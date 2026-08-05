"""Cálculo y persistencia de forecasts (5 modelos × 4 horizontes × 2 frecuencias × N productos)."""
from __future__ import annotations

import sys
import warnings
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from dateutil.relativedelta import relativedelta
from supabase import Client

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.evaluate import walk_forward_validation  # noqa: E402
from src.models.arima_model import ARIMAModel  # noqa: E402
from src.models.catboost_model import CatBoostModel  # noqa: E402
from src.models.ensemble import EnsembleModel  # noqa: E402
from src.models.prophet_model import ProphetModel  # noqa: E402
from src.models.xgboost_model import XGBoostModel  # noqa: E402
from src.features import build_all_features  # noqa: E402

from .upsert_supabase import upsert

warnings.filterwarnings("ignore")

HORIZONS_DAILY = [30, 60, 90, 120]
HORIZONS_MONTHLY = [3, 6, 9, 12]

MODEL_FACTORIES = {
    "ARIMA": lambda: ARIMAModel(),
    "Prophet": lambda: ProphetModel(),
    "XGBoost": lambda: XGBoostModel(),
    "CatBoost": lambda: CatBoostModel(),
}


def _build_product_series(df: pd.DataFrame, product: str, freq: str, ext: pd.DataFrame) -> pd.DataFrame:
    """Construye la serie agregada (sin rolling) con features externos mergeados."""
    pdf = df[df["product"] == product].copy()
    if pdf.empty:
        return pd.DataFrame()

    if freq == "D":
        pdf["date"] = pdf["fecha"].dt.normalize()
    else:
        pdf["date"] = pdf["fecha"].dt.to_period("M").dt.to_timestamp()

    s = (
        pdf.groupby(["date"])["cif_unit_calc"]
        .agg(cif_price="mean", transactions="count")
        .reset_index()
    )
    s = s.sort_values("date").reset_index(drop=True)

    if freq == "D":
        full_range = pd.date_range(start=s["date"].min(), end=s["date"].max(), freq="D")
        limit = 7
    else:
        full_range = pd.date_range(start=s["date"].min(), end=s["date"].max(), freq="MS")
        limit = 3
    s = s.set_index("date").reindex(full_range).rename_axis("date").reset_index()
    s["cif_price"] = s["cif_price"].interpolate(method="linear", limit=limit, limit_direction="both")
    s["transactions"] = s["transactions"].fillna(0).astype(int)
    s = s.dropna(subset=["cif_price"]).reset_index(drop=True)

    if not ext.empty:
        e = ext.copy()
        e["date"] = pd.to_datetime(e["date"])
        s = pd.merge(s, e, on="date", how="left")
        for col in ("fx_usdvnd", "corn_fut", "soymeal_fut"):
            if col in s.columns:
                s[col] = pd.to_numeric(s[col], errors="coerce")
                s[col] = s[col].ffill().bfill()

    return s


def _future_dates(last_date: pd.Timestamp, periods: int, freq: str) -> list[date]:
    """Genera las fechas futuras a partir de la última fecha histórica."""
    out: list[date] = []
    if freq == "D":
        cur = last_date
        for _ in range(periods):
            cur = cur + timedelta(days=1)
            out.append(cur.date())
    else:
        cur = last_date
        for _ in range(periods):
            cur = cur + relativedelta(months=1)
            out.append(cur.date())
    return out


def _train_arima(train_df: pd.DataFrame, horizon: int) -> tuple[ARIMAModel, np.ndarray, np.ndarray, np.ndarray]:
    m = ARIMAModel()
    m.fit(train_df, target="cif_price")
    lo, pr, hi = m.predict_intervals(periods=horizon, alpha=0.20)
    return m, np.asarray(lo), np.asarray(pr), np.asarray(hi)


def _train_prophet(train_df: pd.DataFrame, horizon: int) -> tuple[ProphetModel, np.ndarray, np.ndarray, np.ndarray]:
    m = ProphetModel()
    p = train_df.rename(columns={"date": "ds", "cif_price": "y"})[["ds", "y"]].copy()
    p = p.dropna()
    m.fit(p, target="cif_price")
    lo, pr, hi = m.predict_intervals(periods=horizon, alpha=0.20)
    return m, np.asarray(lo), np.asarray(pr), np.asarray(hi)


def _train_xgboost(train_df: pd.DataFrame, horizon: int, freq: str) -> tuple[Any, np.ndarray, np.ndarray, np.ndarray]:
    feat = build_all_features(train_df.copy(), target="cif_price", freq=freq)
    feat = feat.dropna(subset=["lag_1"]).reset_index(drop=True)
    if len(feat) < 30:
        raise ValueError(f"Insuficientes features para XGBoost ({len(feat)} filas)")
    m = XGBoostModel()
    m.fit(feat, target="cif_price", freq=freq)
    lo, pr, hi = m.predict_intervals(periods=horizon, alpha=0.20)
    return m, np.asarray(lo), np.asarray(pr), np.asarray(hi)


def _train_catboost(train_df: pd.DataFrame, horizon: int, freq: str) -> tuple[Any, np.ndarray, np.ndarray, np.ndarray]:
    feat = build_all_features(train_df.copy(), target="cif_price", freq=freq)
    feat = feat.dropna(subset=["lag_1"]).reset_index(drop=True)
    if len(feat) < 30:
        raise ValueError(f"Insuficientes features para CatBoost ({len(feat)} filas)")
    m = CatBoostModel()
    m.fit(feat, target="cif_price", freq=freq)
    lo, pr, hi = m.predict_intervals(periods=horizon, alpha=0.20)
    return m, np.asarray(lo), np.asarray(pr), np.asarray(hi)


def _rmse_mae_mape(y_true: np.ndarray, y_pred: np.ndarray) -> tuple[float, float, float]:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = ~np.isnan(y_true) & ~np.isnan(y_pred)
    if not mask.any():
        return float("nan"), float("nan"), float("nan")
    yt, yp = y_true[mask], y_pred[mask]
    rmse = float(np.sqrt(np.mean((yt - yp) ** 2)))
    mae = float(np.mean(np.abs(yt - yp)))
    denom = np.where(np.abs(yt) < 1e-6, np.nan, np.abs(yt))
    mape = float(np.nanmean(np.abs(yt - yp) / denom) * 100.0) if np.isfinite(denom).any() else float("nan")
    return rmse, mae, mape


def _forecast_for_product_freq(
    client: Client,
    run_id: str,
    df: pd.DataFrame,
    ext: pd.DataFrame,
    product: str,
    freq: str,
    horizons: list[int],
) -> dict:
    """Corre los 4 modelos + ensemble para un (product, freq). Retorna conteos."""
    s = _build_product_series(df, product, freq, ext)
    min_rows = 24 if freq == "M" else 60
    if s.empty or len(s) < min_rows:
        print(f"       · {product} {freq}: datos insuficientes ({len(s)} filas)")
        return {"results": 0, "metrics": 0}

    last_date = pd.to_datetime(s["date"].iloc[-1])
    forecast_results_rows: list[dict] = []
    forecast_metrics_rows: list[dict] = []

    for horizon in horizons:
        if len(s) <= horizon + 30:
            print(f"       · {product} {freq} h={horizon}: datos insuficientes")
            continue

        # Split: train = s[:-horizon], test = s[-horizon:]
        train = s.iloc[: -horizon].copy()
        test = s.iloc[-horizon:].copy()
        actuals = test["cif_price"].values

        # Agregar TODA la serie histórica como Ensemble is_historical=true
        for _, row in s.iterrows():
            d = row["date"]
            if hasattr(d, "date"):
                d = d.date()
            forecast_results_rows.append(
                {
                    "run_id": run_id,
                    "product": product,
                    "frequency": freq,
                    "horizon": horizon,
                    "model": "Ensemble",
                    "forecast_date": d.isoformat() if hasattr(d, "isoformat") else str(d),
                    "point_forecast": float(row["cif_price"]) if pd.notna(row["cif_price"]) else None,
                    "lower_bound": float(row["cif_price"]) if pd.notna(row["cif_price"]) else None,
                    "upper_bound": float(row["cif_price"]) if pd.notna(row["cif_price"]) else None,
                    "is_historical": True,
                    "actual_value": float(row["cif_price"]) if pd.notna(row["cif_price"]) else None,
                }
            )

        # Recolectar modelos entrenados en train para ensemble
        per_model_metrics: dict[str, dict] = {}
        per_model_predictions: dict[str, np.ndarray] = {}
        per_model_intervals: dict[str, tuple[np.ndarray, np.ndarray]] = {}

        for model_name in ("ARIMA", "Prophet", "XGBoost", "CatBoost"):
            try:
                if model_name == "ARIMA":
                    m, lo, pr, hi = _train_arima(train, horizon)
                elif model_name == "Prophet":
                    m, lo, pr, hi = _train_prophet(train, horizon)
                elif model_name == "XGBoost":
                    m, lo, pr, hi = _train_xgboost(train, horizon, freq)
                else:  # CatBoost
                    m, lo, pr, hi = _train_catboost(train, horizon, freq)

                rmse, mae, mape = _rmse_mae_mape(actuals, pr)
                per_model_metrics[model_name] = {"RMSE": rmse, "MAE": mae, "MAPE": mape}
                per_model_predictions[model_name] = pr
                per_model_intervals[model_name] = (lo, hi)

                # Forecast futuro (futuro más allá de los datos actuales)
                future_dates = _future_dates(last_date, horizon, freq)
                for i, fd in enumerate(future_dates):
                    forecast_results_rows.append(
                        {
                            "run_id": run_id,
                            "product": product,
                            "frequency": freq,
                            "horizon": horizon,
                            "model": model_name,
                            "forecast_date": fd.isoformat(),
                            "point_forecast": float(max(pr[i], 0)) if i < len(pr) else None,
                            "lower_bound": float(max(lo[i], 0)) if i < len(lo) else None,
                            "upper_bound": float(max(hi[i], 0)) if i < len(hi) else None,
                            "is_historical": False,
                        }
                    )
            except Exception as e:
                print(f"       ⚠ {model_name} falló para {product} {freq} h={horizon}: {e}")
                per_model_metrics[model_name] = {"RMSE": float("nan"), "MAE": float("nan"), "MAPE": float("nan")}

        # Ensemble: promedio ponderado por inverse RMSE
        valid_metrics = {k: v for k, v in per_model_metrics.items() if not np.isnan(v["RMSE"])}
        if valid_metrics:
            rmses = np.array([v["RMSE"] for v in valid_metrics.values()])
            inv = 1.0 / (rmses + 1e-6)
            weights = inv / inv.sum()
            weight_map = dict(zip(valid_metrics.keys(), weights))
        else:
            weight_map = {}

        # Guardar métricas
        for model_name, m in per_model_metrics.items():
            forecast_metrics_rows.append(
                {
                    "run_id": run_id,
                    "product": product,
                    "frequency": freq,
                    "horizon": horizon,
                    "model": model_name,
                    "rmse": m["RMSE"] if not np.isnan(m["RMSE"]) else None,
                    "mae": m["MAE"] if not np.isnan(m["MAE"]) else None,
                    "mape": m["MAPE"] if not np.isnan(m["MAPE"]) else None,
                    "weight": float(weight_map[model_name]) if model_name in weight_map else None,
                }
            )

        # Ensemble: para los forecasts futuros
        if per_model_predictions:
            future_dates = _future_dates(last_date, horizon, freq)
            preds_arrays = list(per_model_predictions.values())
            lo_arrays = [per_model_intervals[k][0] for k in per_model_predictions.keys()]
            hi_arrays = [per_model_intervals[k][1] for k in per_model_predictions.keys()]
            min_len = min(len(p) for p in preds_arrays)
            preds_arrays = [p[:min_len] for p in preds_arrays]
            lo_arrays = [a[:min_len] for a in lo_arrays]
            hi_arrays = [a[:min_len] for a in hi_arrays]

            keys = list(per_model_predictions.keys())
            ws = np.array([weight_map.get(k, 0.0) for k in keys])
            if ws.sum() > 0:
                ws = ws / ws.sum()
                ens_pr = np.zeros(min_len)
                ens_lo = np.zeros(min_len)
                ens_hi = np.zeros(min_len)
                for w, p, lo, hi in zip(ws, preds_arrays, lo_arrays, hi_arrays):
                    ens_pr += w * p
                    ens_lo += w * lo
                    ens_hi += w * hi

                for i, fd in enumerate(future_dates):
                    if i >= min_len:
                        break
                    forecast_results_rows.append(
                        {
                            "run_id": run_id,
                            "product": product,
                            "frequency": freq,
                            "horizon": horizon,
                            "model": "Ensemble",
                            "forecast_date": fd.isoformat(),
                            "point_forecast": float(max(ens_pr[i], 0)),
                            "lower_bound": float(max(ens_lo[i], 0)),
                            "upper_bound": float(max(ens_hi[i], 0)),
                            "is_historical": False,
                        }
                    )
                ens_rmse, ens_mae, ens_mape = _rmse_mae_mape(actuals, ens_pr[:min_len])
                forecast_metrics_rows.append(
                    {
                        "run_id": run_id,
                        "product": product,
                        "frequency": freq,
                        "horizon": horizon,
                        "model": "Ensemble",
                        "rmse": ens_rmse,
                        "mae": ens_mae,
                        "mape": ens_mape,
                        "weight": 1.0,
                    }
                )

    n_results = 0
    n_metrics = 0
    if forecast_results_rows:
        n_results = upsert(
            client,
            "forecast_results",
            forecast_results_rows,
            on_conflict=None,
        )
    if forecast_metrics_rows:
        n_metrics = upsert(
            client,
            "forecast_metrics",
            forecast_metrics_rows,
            on_conflict="run_id,product,frequency,horizon,model",
        )
    return {"results": n_results, "metrics": n_metrics}


def compute_and_store_forecast(
    client: Client,
    run_id: str,
    df: pd.DataFrame,
    ext: pd.DataFrame,
    products: list[str],
    *,
    frequencies: tuple[str, ...] = ("D", "M"),
) -> dict:
    """Itera sobre (product × freq), entrena, valida, predice, guarda."""
    if df.empty:
        return {"results": 0, "metrics": 0}

    total = {"results": 0, "metrics": 0}
    for product in products:
        for freq in frequencies:
            horizons = HORIZONS_DAILY if freq == "D" else HORIZONS_MONTHLY
            print(f"       · {product} {freq} ({horizons})")
            counts = _forecast_for_product_freq(client, run_id, df, ext, product, freq, horizons)
            total["results"] += counts["results"]
            total["metrics"] += counts["metrics"]
    return total
