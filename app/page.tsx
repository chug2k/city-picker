"use client";

import { useState, useEffect } from "react";
import { CityData, ScoringWeights } from "@/types/city";
import { calculateOverallScore, sortCitiesByScore } from "@/lib/scoring";
import citiesData from "@/data/cities.json";
import { CategoryTooltip } from "@/components/CategoryTooltip";
import { CriteriaRanking } from "@/components/CriteriaRanking";
import { CriterionKey, CRITERIA_CONFIG, rankingToWeights } from "@/lib/criteria-config.tsx";

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

export default function Home() {
  const [criteriaOrder, setCriteriaOrder] = useState<CriterionKey[]>(DEFAULT_RANKING);
  const [cities] = useState<CityData[]>(citiesData as CityData[]);
  const [annualSalary, setAnnualSalary] = useState(100000);
  const [hiddenCities, setHiddenCities] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem("cityPickerCriteriaOrder");
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        setCriteriaOrder(parsed);
      } catch (e) {
        console.error("Failed to load saved criteria order:", e);
      }
    }

    const savedSalary = localStorage.getItem("cityPickerSalary");
    if (savedSalary) {
      setAnnualSalary(Number(savedSalary));
    }

    const savedHidden = localStorage.getItem("cityPickerHiddenCities");
    if (savedHidden) {
      try {
        const parsed = JSON.parse(savedHidden);
        setHiddenCities(new Set(parsed));
      } catch (e) {
        console.error("Failed to load hidden cities:", e);
      }
    }
  }, []);

  // Save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cityPickerCriteriaOrder", JSON.stringify(criteriaOrder));
  }, [criteriaOrder]);

  useEffect(() => {
    localStorage.setItem("cityPickerSalary", String(annualSalary));
  }, [annualSalary]);

  useEffect(() => {
    localStorage.setItem("cityPickerHiddenCities", JSON.stringify(Array.from(hiddenCities)));
  }, [hiddenCities]);

  // Convert ranking to weights
  const weights = rankingToWeights(criteriaOrder);

  // Recalculate cities with adjusted salary (baseline is $100k)
  const BASELINE_SALARY = 100000;
  const salaryMultiplier = annualSalary / BASELINE_SALARY;

  const adjustedCities = cities.map(city => {
    const adjustedAfterTaxIncome = Math.round(city.afterTaxIncome * salaryMultiplier);
    const adjustedSavings12Month = Math.round((adjustedAfterTaxIncome - city.monthlyCost) * 12);

    return {
      ...city,
      afterTaxIncome: adjustedAfterTaxIncome,
      savings12Month: adjustedSavings12Month,
    };
  });

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
    setCriteriaOrder(newOrder);
  };

  const resetRanking = () => {
    setCriteriaOrder(DEFAULT_RANKING);
  };

  const toggleHideCity = (cityName: string) => {
    const newHidden = new Set(hiddenCities);
    if (newHidden.has(cityName)) {
      newHidden.delete(cityName);
    } else {
      newHidden.add(cityName);
    }
    setHiddenCities(newHidden);
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
              Annual Salary (USD):
            </label>
            <input
              id="salary"
              type="number"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              min="0"
              step="1000"
            />
          </div>
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
                    Overall Score
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
