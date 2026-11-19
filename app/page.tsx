"use client";

import { useState } from "react";
import { BASELINE_SALARY, calculateOverallScore, estimateCities } from "@/lib/scoring";
import { useStoredPreference } from "@/lib/use-stored-preference";
import citiesData from "@/data/cities.json";
import { CategoryTooltip } from "@/components/CategoryTooltip";
import { CriteriaRanking } from "@/components/CriteriaRanking";
import { CriterionKey, CRITERIA_CONFIG, rankingToWeights } from "@/lib/criteria-config";

const DEFAULT_RANKING: CriterionKey[] = [
  "savings",
  "techVC",
  "timezoneOverlap",
  "climateAir",
  "expatFriendliness",
  "visaEase",
  "veganFriendliness",
  "dogImportEase",
];

function readList(raw: string | null): string[] {
  try {
    const list: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(list) && list.every(item => typeof item === "string") ? list : [];
  } catch {
    return [];
  }
}

function salaryValue(raw: string | null) {
  const value = Number(raw ?? BASELINE_SALARY);
  return Number.isFinite(value) && value <= Number.MAX_SAFE_INTEGER ? Math.max(0, value) : BASELINE_SALARY;
}

export default function Home() {
  const [savedOrder, saveOrder] = useStoredPreference("cityPickerCriteriaOrder");
  const [savedSalary, saveSalary] = useStoredPreference("cityPickerSalary");
  const [editingEmptySalary, setEditingEmptySalary] = useState(false);
  const [savedHidden, saveHidden] = useStoredPreference("cityPickerHiddenCities");
  const keys = readList(savedOrder);
  const criteriaOrder = keys.length === DEFAULT_RANKING.length && DEFAULT_RANKING.every(key => keys.includes(key))
    ? keys as CriterionKey[] : DEFAULT_RANKING;
  const annualSalary = salaryValue(savedSalary);
  const hiddenCities = new Set(readList(savedHidden));
  const weights = rankingToWeights(criteriaOrder);
  const adjustedCities = estimateCities(citiesData, annualSalary);

  // Sort cities: visible first (by score), then hidden at bottom (by score)
  const sortedCities = [...adjustedCities].sort((a, b) => {
    const aHidden = hiddenCities.has(a.name);
    const bHidden = hiddenCities.has(b.name);

    if (aHidden && !bHidden) return 1;
    if (!aHidden && bHidden) return -1;

    const scoreA = calculateOverallScore(a, weights);
    const scoreB = calculateOverallScore(b, weights);
    return scoreB - scoreA;
  });

  const handleReorder = (newOrder: CriterionKey[]) => {
    saveOrder(JSON.stringify(newOrder));
  };

  const resetRanking = () => {
    handleReorder(DEFAULT_RANKING);
  };

  const toggleHideCity = (cityName: string) => {
    const newHidden = new Set(hiddenCities);
    if (newHidden.has(cityName)) {
      newHidden.delete(cityName);
    } else {
      newHidden.add(cityName);
    }
    saveHidden(JSON.stringify([...newHidden]));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">City Picker</h1>
          <p className="text-gray-600">
            Compare cities for remote work based on your priorities
          </p>
        </div>

        {/* Annual Salary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <label htmlFor="salary" className="text-sm font-medium text-gray-900">
              Annual salary (USD)
            </label>
            <input
              id="salary"
              type="number"
              value={editingEmptySalary ? "" : annualSalary}
              onChange={e => {
                setEditingEmptySalary(e.target.value === "");
                saveSalary(String(salaryValue(e.target.value)));
              }}
              onBlur={() => setEditingEmptySalary(false)}
              aria-describedby="salary-model"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              min="0"
              step="1000"
            />
          </div>
          <p id="salary-model" className="mt-3 text-sm text-gray-600">
            Each city’s monthly take-home estimate scales in proportion to your salary from the original
            $100,000 scenario. Subtract monthly costs from take-home and multiply by 12 to estimate annual savings.
            Costs are the estimates recorded in November 2025 for two adults and a small dog.
          </p>
        </div>

        {/* Criteria Ranking */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Rank Criteria by Importance</h2>
            <button
              onClick={resetRanking}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset to Defaults
            </button>
          </div>
          <CriteriaRanking orderedKeys={criteriaOrder} onReorder={handleReorder} />
          <p className="mt-3 text-sm text-gray-600">
            Savings compares all {citiesData.length} cities at your salary, including hidden cities.
            The lowest annual balance earns 1/10 and the highest earns 10/10. Each dollar between them
            adds the same amount to the grade. When all cities run a shortfall, the smallest shortfall scores highest.
          </p>
        </div>

        {/* Cities Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 sticky left-12 bg-gray-50 z-10 min-w-[150px]">
                    City
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Overall Score /100
                  </th>
                  {CRITERIA_CONFIG.map((config) => (
                    <th key={config.key} className="px-4 py-3 text-left font-semibold text-gray-900">
                      {config.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedCities.map((city, index) => {
                  const isHidden = hiddenCities.has(city.name);
                  return (
                    <tr
                      key={city.name}
                      className={`hover:bg-gray-50 ${isHidden ? "opacity-40 bg-gray-50" : ""}`}
                    >
                      <td className={`px-4 py-3 font-medium sticky left-0 z-10 ${isHidden ? "text-gray-500 bg-gray-50" : "text-gray-900 bg-white"}`}>
                        #{index + 1}
                      </td>
                      <td className={`px-4 py-3 font-medium sticky left-12 z-10 ${isHidden ? "text-gray-500 bg-gray-50" : "text-gray-900 bg-white"}`}>
                        {city.name}
                      </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {calculateOverallScore(city, weights).toFixed(1)}
                      </span>
                    </td>
                    {CRITERIA_CONFIG.map((config) => {
                      const { score, notes, sources } = config.getValue(city);
                      const colorClass = typeof config.colorClass === "function"
                        ? config.colorClass(score)
                        : config.colorClass;

                      return (
                        <td key={config.key} className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {config.renderExtra && config.renderExtra(city)}
                            <CategoryTooltip notes={notes} sources={sources}>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit cursor-help ${colorClass}`}>
                                {score}/10
                              </span>
                            </CategoryTooltip>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHideCity(city.name);
                        }}
                        className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 font-medium"
                      >
                        {isHidden ? "Unhide" : "Hide"}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
