import { CityData, ScoringWeights } from "@/types/city";

/**
 * Calculate overall weighted score for a city
 */
export function calculateOverallScore(
  city: CityData,
  weights: ScoringWeights
): number {
  const score =
    city.savings.score * weights.savings +
    city.timezoneOverlap.score * weights.timezoneOverlap +
    city.techVC.score * weights.techVC +
    city.climateAir.score * weights.climateAir +
    city.expatFriendliness.score * weights.expatFriendliness +
    city.visaEase.score * weights.visaEase +
    city.dogImportEase.score * weights.dogImportEase +
    city.veganFriendliness.score * weights.veganFriendliness;

  // Score is already weighted (weights sum to 1.0), multiply by 10 to get 0-10 scale
  return Math.round(score * 10 * 10) / 10; // Round to 1 decimal place
}

/**
 * Sort cities by overall score
 */
export function sortCitiesByScore(
  cities: CityData[],
  weights: ScoringWeights
): CityData[] {
  return [...cities].sort((a, b) => {
    const scoreA = calculateOverallScore(a, weights);
    const scoreB = calculateOverallScore(b, weights);
    return scoreB - scoreA; // Descending order
  });
}

/**
 * Validate that weights sum to 1.0 (100%)
 */
export function validateWeights(weights: ScoringWeights): boolean {
  const sum =
    weights.savings +
    weights.timezoneOverlap +
    weights.techVC +
    weights.climateAir +
    weights.expatFriendliness +
    weights.visaEase +
    weights.dogImportEase +
    weights.veganFriendliness;

  // Allow small floating point errors
  return Math.abs(sum - 1.0) < 0.001;
}

/**
 * Normalize weights to sum to 1.0
 */
export function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const sum =
    weights.savings +
    weights.timezoneOverlap +
    weights.techVC +
    weights.climateAir +
    weights.expatFriendliness +
    weights.visaEase +
    weights.dogImportEase +
    weights.veganFriendliness;

  if (sum === 0) {
    // Return equal weights if sum is 0
    const equalWeight = 1 / 8;
    return {
      savings: equalWeight,
      timezoneOverlap: equalWeight,
      techVC: equalWeight,
      climateAir: equalWeight,
      expatFriendliness: equalWeight,
      visaEase: equalWeight,
      dogImportEase: equalWeight,
      veganFriendliness: equalWeight,
    };
  }

  return {
    savings: weights.savings / sum,
    timezoneOverlap: weights.timezoneOverlap / sum,
    techVC: weights.techVC / sum,
    climateAir: weights.climateAir / sum,
    expatFriendliness: weights.expatFriendliness / sum,
    visaEase: weights.visaEase / sum,
    dogImportEase: weights.dogImportEase / sum,
    veganFriendliness: weights.veganFriendliness / sum,
  };
}
