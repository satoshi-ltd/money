export const getProgressionPercentage = (currentBalance = 0, progression = 0) => {
  if (currentBalance - progression === 0) return undefined;
  return progression ? (progression * 100) / (currentBalance - progression) : undefined;
};
