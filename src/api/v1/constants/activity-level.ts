export const ACTIVITY_LEVEL = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

export function getActivityMultiplier(activityLevel: string): number {
  return ACTIVITY_LEVEL[activityLevel as keyof typeof ACTIVITY_LEVEL] || 1; // Default to 1 if not found
}
