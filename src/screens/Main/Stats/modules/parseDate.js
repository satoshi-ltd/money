export const parseDate = (date) => {
  const value = date ? new Date(date) : new Date();

  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0);
};
