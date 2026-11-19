"use client";

import { CityData } from "@/types/city";
import { ReactNode } from "react";

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export type CriterionKey =
  | "savings"
  | "timezoneOverlap"
  | "techVC"
  | "climateAir"
  | "expatFriendliness"
  | "visaEase"
  | "dogImportEase"
  | "veganFriendliness";

export interface CriterionConfig {
  key: CriterionKey;
  label: string;
  colorClass: string | ((score: number) => string);
  getValue: (city: CityData) => { score: number; notes: string; sources: string[] };
  renderExtra?: (city: CityData) => ReactNode;
}

export const CRITERIA_CONFIG: CriterionConfig[] = [
  {
    key: "savings",
    label: "Savings",
    colorClass: "bg-gray-100 text-gray-700",
    getValue: (city) => ({
      ...city.savings,
      notes: `Original $100,000 scenario, recorded November 2025. ${city.savings.notes}`,
    }),
    renderExtra: (city) => (
      <>
        <span className="text-green-700 font-medium text-xs">
          {dollars.format(city.afterTaxIncome)}/mo take-home
        </span>
        <span className="text-gray-600 text-xs">
          {dollars.format(city.monthlyCost)}/mo cost
        </span>
        <span className={`font-semibold text-xs ${city.savings12Month < 0 ? "text-red-700" : "text-blue-700"}`}>
          {dollars.format(city.savings12Month)}/yr {city.savings12Month < 0 ? "shortfall" : "savings"}
        </span>
      </>
    ),
  },
  {
    key: "timezoneOverlap",
    label: "Timezone Overlap",
    colorClass: "bg-gray-100 text-gray-700",
    getValue: (city) => city.timezoneOverlap,
    renderExtra: (city) => (
      <span className="text-gray-700 text-xs">
        {city.timezoneOffset >= 0 ? "+" : ""}
        {city.timezoneOffset}h
      </span>
    ),
  },
  {
    key: "techVC",
    label: "Tech VC",
    colorClass: "bg-purple-100 text-purple-800",
    getValue: (city) => city.techVC,
  },
  {
    key: "climateAir",
    label: "Climate Air",
    colorClass: "bg-cyan-100 text-cyan-800",
    getValue: (city) => city.climateAir,
  },
  {
    key: "expatFriendliness",
    label: "Expat Friendliness",
    colorClass: "bg-indigo-100 text-indigo-800",
    getValue: (city) => city.expatFriendliness,
  },
  {
    key: "visaEase",
    label: "Visa Ease",
    colorClass: "bg-orange-100 text-orange-800",
    getValue: (city) => city.visaEase,
  },
  {
    key: "dogImportEase",
    label: "Dog Import Ease",
    colorClass: "bg-pink-100 text-pink-800",
    getValue: (city) => city.dogImportEase,
  },
  {
    key: "veganFriendliness",
    label: "Vegan Friendliness",
    colorClass: (score: number) =>
      score >= 8
        ? "bg-green-100 text-green-800"
        : score >= 6
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-800",
    getValue: (city) => city.veganFriendliness,
  },
];

// Convert ranking order to weights (rank 0 is most important)
// Uses exponential weighting so top ranks have much more influence
export function rankingToWeights(orderedKeys: CriterionKey[]): Record<CriterionKey, number> {
  const n = orderedKeys.length;

  // Use exponential weighting: 2^(n-1), 2^(n-2), ..., 2^0
  // Rank 1: 2^7 = 128 (~50%), Rank 2: 2^6 = 64 (~25%), ..., Rank 8: 2^0 = 1 (~0.4%)
  const exponentialWeights = orderedKeys.map((_, index) => Math.pow(2, n - 1 - index));
  const totalWeight = exponentialWeights.reduce((sum, w) => sum + w, 0);

  const weights: Partial<Record<CriterionKey, number>> = {};
  orderedKeys.forEach((key, index) => {
    weights[key] = exponentialWeights[index] / totalWeight;
  });

  return weights as Record<CriterionKey, number>;
}
