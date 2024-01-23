export const getMonthDiff = (baseDate = new Date(), date = new Date()) => {
  let months = (date.getFullYear() - baseDate.getFullYear()) * 12;
  months -= baseDate.getMonth();
  months += date.getMonth();

  return months <= 0 ? 0 : months;
};
