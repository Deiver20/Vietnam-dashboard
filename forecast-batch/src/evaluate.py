import pandas as pd
import numpy as np
from pathlib import Path
from .models.base_model import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent


def walk_forward_validation(
    model: BaseModel,
    df: pd.DataFrame,
    target: str = "CIF_Price",
    train_size: int = 180,
    test_size: int = 30,
    step: int = 30,
) -> dict:
    df = df.sort_values("Date").reset_index(drop=True)
    all_predictions = []
    all_actuals = []

    start = train_size
    while start + test_size <= len(df):
        train = df.iloc[:start]
        test = df.iloc[start : start + test_size]

        try:
            model.fit(train, target)
            preds = model.predict(periods=test_size)
            actuals = test[target].values[:len(preds)]
            all_predictions.extend(preds)
            all_actuals.extend(actuals)
        except Exception as e:
            print(f"       ⚠ {model.name} fallo en fold (start={start}): {e}")

        start += step

    if not all_actuals:
        return {"model": model.name, "RMSE": np.nan, "MAE": np.nan, "MAPE": np.nan}

    from .models.base_model import compute_metrics
    metrics = compute_metrics(np.array(all_actuals), np.array(all_predictions))
    metrics["model"] = model.name
    return metrics
