const project = ({ height, max, min, padding, value }) => {
  const span = max - min || Math.abs(max) || 1;
  return height - padding - ((value - min) / span) * (height - padding * 2);
};

export const chartBounds = (values = []) => ({ max: Math.max(...values), min: Math.min(...values) });

export const linePath = (values = [], { height, padding = 4, width }) => {
  const { max, min } = chartBounds(values);
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const y = project({ height, max, min, padding, value });
      return `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

export const trendPath = (values = [], { height, padding = 4, width, window = 3 }) => {
  const { max, min } = chartBounds(values);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const half = Math.floor(window / 2);

  return values
    .map((_value, index) => {
      const from = Math.max(0, index - half);
      const slice = values.slice(from, Math.min(values.length, index + half + 1));
      const mean = slice.reduce((total, value) => total + value, 0) / slice.length;
      const y = project({ height, max, min, padding, value: mean });
      return `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

export const pointAt = (values = [], index, { height, padding = 4, width }) => {
  const { max, min } = chartBounds(values);
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return { x: index * step, y: project({ height, max, min, padding, value: values[index] }) };
};

export const compactFigure = (value = 0) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e6) return `${Math.round(value / 1e5) / 10}M`;
  if (absolute >= 1e3) return `${Math.round(value / 1e3)}k`;
  return `${Math.round(value)}`;
};
