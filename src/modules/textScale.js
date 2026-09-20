import { StyleSheet } from 'react-native';

export const DEFAULT_TEXT_SCALE = 1;

// Four steps, not a slider: React Native multiplies these by the OS font scale again, so the usable headroom is narrow.
export const TEXT_SCALES = [0.9, DEFAULT_TEXT_SCALE, 1.15, 1.3];

const parse = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return NaN;
};

export const clampTextScale = (value) => {
  const scale = parse(value);
  if (!Number.isFinite(scale)) return DEFAULT_TEXT_SCALE;

  return TEXT_SCALES.reduce((best, step) => (Math.abs(step - scale) < Math.abs(best - scale) ? step : best));
};

// Flatten what the caller composed: a screen style may set its own fontSize, and it must scale like every other.
export const scaledType = (style, value) => {
  const scale = clampTextScale(value);
  if (scale === DEFAULT_TEXT_SCALE) return null;

  const { fontSize, lineHeight } = StyleSheet.flatten(style) || {};
  const scaled = {};
  if (typeof fontSize === 'number') scaled.fontSize = Math.round(fontSize * scale);
  if (typeof lineHeight === 'number') scaled.lineHeight = Math.round(lineHeight * scale);

  return Object.keys(scaled).length ? scaled : null;
};
