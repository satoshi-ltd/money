const SUNDAY_FIRST = ['en'];

export const weekStartFor = (language) => (SUNDAY_FIRST.includes(`${language}`.slice(0, 2).toLowerCase()) ? 0 : 1);

export const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const dayKey = (date) => date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();

export const dayAllowed = ({ date, maximumDate, minimumDate }) =>
  (!minimumDate || dayKey(date) >= dayKey(minimumDate)) && (!maximumDate || dayKey(date) <= dayKey(maximumDate));

export const weekdayOrder = (weekStart) => Array.from({ length: 7 }, (_, index) => (weekStart + index) % 7);

export const monthWeeks = ({ month, weekStart = 1, year }) => {
  const lead = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
  const length = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
};

export const composeDate = ({ day, maximumDate, minimumDate, time }) => {
  const stamp = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds(),
  ).getTime();
  const floor = minimumDate ? Math.max(stamp, minimumDate.getTime()) : stamp;

  return new Date(maximumDate ? Math.min(floor, maximumDate.getTime()) : floor);
};
