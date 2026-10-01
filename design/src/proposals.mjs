import {
  calendar, esc, fig, kebab, text,
} from './draw.mjs';


const USES = { background: 18, surface: 17, surfaceSoft: 6, text: 19, textSecondary: 7, textMuted: 9, border: 40, rule: 5, accent: 27, onAccent: 6, accentSoft: 4, onAccentSoft: 5, positive: 3, danger: 9, dangerSoft: 2, warning: 0, success: 0, overlay: 2, inverse: 8, onInverse: 5 };
const KEEP = ['background', 'surface', 'text', 'textSecondary', 'textMuted', 'border', 'rule', 'accent', 'onAccent', 'accentSoft', 'danger', 'dangerSoft', 'overlay'];
const FOLD = { surfaceSoft: 'surface', onAccentSoft: 'text', positive: 'accent', warning: 'danger', success: 'accent', inverse: 'text', onInverse: 'background' };

const swatch = (name, note, { gone } = {}) =>
  `<div style="display:flex;align-items:center;gap:10px;min-height:28px${gone ? ';opacity:.45' : ''}"><i style="width:28px;height:20px;border-radius:4px;border:var(--hairline) solid var(--color-border);background:var(--color-${kebab(name)})"></i>${text(name, { size: 's', medium: !gone })}<span style="flex:1"></span>${fig(note, { size: 'xs', tone: 'muted' })}</div>`;

const paletteNow = () =>
  `<div style="width:320px;display:grid;grid-template-columns:1fr 1fr;gap:4px 20px">${Object.keys(USES).map((name) => swatch(name, `${USES[name]} ${USES[name] === 1 ? 'use' : 'uses'}`)).join('')}</div>`;

const paletteProposed = () =>
  `<div style="width:320px;display:grid;grid-template-columns:1fr 1fr;gap:4px 20px">${KEEP.map((name) => swatch(name, '')).join('')}<div style="grid-column:1 / -1;margin-top:8px">${text('Folded', { size: 'xs', tone: 'muted', uppercase: true })}</div>${Object.entries(FOLD).map(([name, into]) => swatch(name, `→ ${into}`, { gone: true })).join('')}</div>`;

const calendarCells = (height) =>
  calendar().replace(/min-height:40px/g, `min-height:${height}px`).replace('padding:16px 20px 20px', `padding:16px 20px 20px;outline:var(--hairline) solid var(--color-border)`);

export const REVIEW = [
  {
    id: 'COLOUR-ROLES', area: 'Design system · colour', title: 'Thirteen colours instead of twenty',
    why: 'The contract says paper and ink, one accent and hairlines, yet the theme carries twenty roles. Two are never used (success, warning), positive and success are the same hex in both themes, onAccentSoft is text in dark and onAccent in light, inverse and onInverse are text and background renamed, and surfaceSoft sits two hex points from border in dark. On a phone every extra role is a chance to pick the wrong one. Recommended: fold the seven aliases into the role they already are; the screens do not change, the kit shows the same pixels.',
    accept: 'theme.colors has the thirteen roles on the right in both themes and no other; every colors.X in src/ and every tone name in Text and Icon resolves to one of them; the folded tokens are gone from theme.js, store, kit and SPEC; the contrast test still passes; no screen changes a pixel except where an alias had drifted (the kit diff shows them).',
    now: paletteNow(),
    proposed: paletteProposed(),
  },
  {
    id: 'CALENDAR-TARGET', area: 'DatePicker', title: 'Days a thumb can hit',
    why: 'The day cells of the new calendar are 40 points high with 2 points between them, under the 44 of iOS and the 48 of Android, and there is no room for a hit slop. A six-week month at 48 points grows the sheet by 48 and still fits a phone. Recommended once the creator has tried the 40 on a device (VERIFY-DATE).',
    accept: 'Every day cell is at least 48 points high and wide on a 360-point screen; a six-week month fits the sheet with its buttons visible at the default text size; the kit specimen shows the new height; a test on the style.',
    now: calendarCells(40),
    proposed: calendarCells(48),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell" data-review="${id}" style="grid-column: 1 / -1"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px"><div style="grid-column:1 / -1"><b style="font:600 15px/1.3 var(--font-sans)">${esc(title)}</b><p class="kit-note" style="margin:4px 0 0">${esc(why)}</p><p class="kit-note" style="margin:4px 0 0"><b>Accept</b> · ${esc(accept)}</p></div><div><div class="kit-caption" style="margin-bottom:8px">Now</div><div style="overflow:auto">${now}</div></div><div><div class="kit-caption" style="margin-bottom:8px">Proposed</div><div style="overflow:auto">${proposed}</div></div></div></div>`).join('');
