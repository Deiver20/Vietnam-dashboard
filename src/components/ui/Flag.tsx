"use client";

import ReactCountryFlag from "react-country-flag";
import { getCountryCode } from "@/app/lib/functions/countryCodes";

interface FlagProps {
  country: string;
  className?: string;
}

export function Flag({ country, className = "w-6 h-4 rounded" }: FlagProps) {
  const code = getCountryCode(country);

  if (!code) {
    return <span className={`inline-flex bg-navy-line ${className}`} />;
  }

  return (
    <span className={`inline-flex items-center justify-center overflow-hidden ${className}`}>
      <ReactCountryFlag
        countryCode={code}
        svg
        alt={`${country} flag`}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
      />
    </span>
  );
}
