export const getProgressionPercentage = (currentBalance = 0, progression = 0) =>
  progression ? (progression * 100) / (currentBalance - progression) : undefined;
