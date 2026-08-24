import { theme } from '../theme';
import { buttonHeight, iconButtonSize, rowHeight, viewOffset } from '../theme/layout';

const MASTHEAD = iconButtonSize + theme.spacing.md + theme.spacing.sm;
const TOGGLE = theme.hairline * 2 + (theme.spacing.xs + 1) * 2 + theme.typography.lineHeights.caption + theme.spacing.md;
const HERO = theme.typography.figureLineHeights.xl + theme.spacing.xs;
const HEADING = theme.typography.lineHeights.subtitle + theme.spacing.xs * 2;
const GROUP = theme.spacing.md;
const ACTIONS = buttonHeight + theme.spacing.sm;
const KEYBOARD = 320;
const MIN = 0.3;
const MAX = 0.94;

export const sheetContentHeight = ({
  actions = 1,
  bottom = 0,
  extra = 0,
  headings = 0,
  hero = false,
  rows = 0,
  toggles = 0,
} = {}) =>
  MASTHEAD +
  toggles * TOGGLE +
  (hero ? HERO : 0) +
  headings * HEADING +
  (rows ? rows * rowHeight + GROUP : 0) +
  (actions ? ACTIONS : 0) +
  extra +
  viewOffset +
  bottom;

// Android applies the fraction to the container minus the top inset, not to the whole window: divide by the same
// thing it multiplies by, or every sheet comes out short and drops its actions past the edge.
// Rounds up: a sliver of empty sheet is invisible, a sliver too short clips the actions.
export const sheetDetent = (content, windowHeight, topInset = 0) => {
  const available = windowHeight - topInset;
  if (!available || available <= 0) return MAX;

  return Math.min(MAX, Math.max(MIN, Math.ceil((content / available) * 100) / 100));
};

// Two detents make Android expand the sheet while the IME is up; with one it translates instead, and that write is lost.
export const sheetDetents = (content, windowHeight, { keyboard = false, topInset = 0 } = {}) => {
  const resting = sheetDetent(content, windowHeight, topInset);
  if (!keyboard) return [resting];

  const raised = sheetDetent(content + KEYBOARD, windowHeight, topInset);
  return raised > resting ? [resting, raised] : [resting];
};
