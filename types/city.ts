export interface CriterionDetail {
  score: number; // 1-10
  notes: string;
  sources: string[]; // Array of URLs for data sources
}

export interface CityData {
  name: string;
  timezoneOffset: number; // Hours difference from Singapore
  afterTaxIncome: number; // USD per month
  monthlyCost: number; // USD per month for 2 adults + dog
  savings12Month: number; // USD saved over 12 months
  savings: CriterionDetail;
  timezoneOverlap: CriterionDetail;
  techVC: CriterionDetail;
  climateAir: CriterionDetail;
  expatFriendliness: CriterionDetail;
  visaEase: CriterionDetail;
  dogImportEase: CriterionDetail;
  veganFriendliness: CriterionDetail;
}

export interface ScoringWeights {
  savings: number; // Default: 20%
  timezoneOverlap: number; // Default: 15%
  techVC: number; // Default: 20%
  climateAir: number; // Default: 15%
  expatFriendliness: number; // Default: 10%
  visaEase: number; // Default: 10%
  dogImportEase: number; // Default: 5%
  veganFriendliness: number; // Default: 5%
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  savings: 0.20,
  timezoneOverlap: 0.15,
  techVC: 0.20,
  climateAir: 0.15,
  expatFriendliness: 0.10,
  visaEase: 0.10,
  dogImportEase: 0.05,
  veganFriendliness: 0.05,
};
