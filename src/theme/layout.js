import { theme } from './theme';

// Derived layout constants used across sliders/cards/inputs.
// Keep these as plain numbers so they can be safely used in RN props/styles.
export const viewOffset = theme.spacing.md;
export const cardGap = theme.spacing.sm;

export const cardAccountSize = theme.spacing.md * 10;
export const cardAccountSnap = cardAccountSize + cardGap;

export const optionSize = theme.spacing.md * 5.2;
export const optionSnap = optionSize + cardGap;

export const inputTextHeight = theme.spacing.md * 4;
export const inputPaddingHorizontal = theme.spacing.sm;
export const inputPaddingVertical = theme.spacing.sm;
