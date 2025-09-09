export const ACTIVITY_LEVEL = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
} as const;

const getActivityMultiplier = (activityLevel?: string): number => {
  if (!activityLevel) return 1;
  return (
    ACTIVITY_LEVEL[
      activityLevel.toUpperCase() as keyof typeof ACTIVITY_LEVEL
    ] || 1
  );
};

const calculateBMR = (
  birth_date: string,
  gender: "male" | "female",
  current_weight: number,
  current_weight_unit: "kg" | "lb",
  height: number,
  height_unit: "cm" | "ft"
): number | null => {
  if (!birth_date || !gender || !current_weight || !height) return null;

  const today = new Date();
  const birthDateObj = new Date(birth_date);
  const age = today.getFullYear() - birthDateObj.getFullYear();

  const weightKg =
    current_weight_unit === "lb" ? current_weight * 0.453592 : current_weight;
  const heightCm = height_unit === "ft" ? height * 2.54 : height; // 1 ft = 30.48 cm

  const genderFactor = gender === "male" ? 5 : -161;

  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + genderFactor);
};

export const calculateTDEE = (
  birth_date: string,
  gender: "male" | "female",
  current_weight: number,
  current_weight_unit: "kg" | "lb",
  height: number,
  height_unit: "cm" | "ft",
  activity_level?: string
): number | null => {
  const bmr = calculateBMR(
    birth_date,
    gender,
    current_weight,
    current_weight_unit,
    height,
    height_unit
  );
  if (!bmr) return null;

  return Math.round(bmr * getActivityMultiplier(activity_level));
};
