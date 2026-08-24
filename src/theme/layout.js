import { theme } from './theme';

// Derived layout constants used across rows/inputs/sheets.
// Keep these as plain numbers so they can be safely used in RN props/styles.
export const viewOffset = theme.spacing.lg;
export const cardGap = theme.spacing.sm;

export const wellSize = theme.spacing.xl;
export const iconButtonSize = theme.spacing.xl + 2;
export const sealSize = theme.spacing.xl + theme.spacing.xs;

export const rowHeight = theme.spacing.xxl - theme.spacing.xxs;
export const fieldHeight = theme.spacing.xl + theme.spacing.sm - 2;
export const buttonHeight = theme.spacing.xxl - 2;

export const inputTextHeight = fieldHeight;
export const inputPaddingHorizontal = theme.spacing.sm;
export const inputPaddingVertical = theme.spacing.xs;

export const categorySize = theme.spacing.xxl + theme.spacing.xl;
export const categorySnap = categorySize + theme.spacing.xs;

export const cardAccountSize = theme.spacing.md * 10;
export const cardAccountWidth = theme.spacing.md * 13.5;
export const cardAccountHeight = theme.spacing.md * 9.5;
export const cardAccountSnap = cardAccountWidth + cardGap;

export const dropdownWidth = theme.spacing.md * 16.25;

export const optionSize = theme.spacing.md * 5.2;
export const optionSnap = optionSize + cardGap;
