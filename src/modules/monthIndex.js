export const monthIndex = (timestamp) => {
  const date = new Date(timestamp);
  return date.getFullYear() * 12 + date.getMonth();
};
