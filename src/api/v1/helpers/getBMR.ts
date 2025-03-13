export const getBMR = (
  birthDate: string,
  gender: string,
  weight: number,
  weightUnit: string,
  height: number,
  heightUnit: string
) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  const age = today.getFullYear() - birthDateObj.getFullYear();

  // Convert weight to kg if in lbs
  const weightKg = weightUnit === "lb" ? weight * 0.453592 : weight;

  // Convert height to cm if in inches
  const heightCm = heightUnit === "ft" ? height * 2.54 : height;

  // BMR Calculation
  const genderFactor = gender === "male" ? 5 : -161;
  const BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + genderFactor;

  return BMR;
};
