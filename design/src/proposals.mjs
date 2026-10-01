import {
  BASE, L, 
  esc, eyebrow, fieldRow, fig,
  heading, kebab, monthRow,
  monthSummary, price, text, 
} from './draw.mjs';

const frame = (body, { sheet, width = 350 } = {}) => `<div class="m" style="width:${width}px;padding:12px 0;background:var(--color-${sheet ? 'surface' : 'background'})">${body}</div>`;

const stack = (...parts) => parts.join('<div style="height:16px"></div>');
const dot = (tone) => `<i class="m-dot" style="width:9px;height:9px;background:var(--color-${tone})"></i>`;


const BUDGET_ROWS = [
  { name: 'Personal', limit: 300, spent: 226, color: 'accent' },
  { name: 'Transit', limit: 100, spent: 121, color: 'text' },
  { name: 'Food & Drinks', limit: 120, spent: 105, color: 'textSecondary' },
  { name: 'Leisure', spent: 61, pct: 11, color: 'textMuted' },
];
const budgetState = ({ limit, spent }) => (!limit ? 'none' : spent > limit ? 'over' : spent / limit >= 0.8 ? 'near' : 'within');
const categoryBars = (budgeted) =>
  `<div>${heading(L.EXPENSES, { eyebrow: 'September' })}${BUDGET_ROWS.map((row) => {
    const state = budgeted ? budgetState(row) : 'none';
    const share = row.pct || Math.round((row.spent / 552.78) * 100);
    const fillColor = { over: 'danger', near: 'accent', within: 'text', none: kebab(row.color) }[state];
    const width = state === 'none' ? share : Math.min(100, Math.round((row.spent / row.limit) * 100));
    const note = state === 'none' ? `${share}%` : state === 'over' ? `+${row.spent - row.limit}` : `of ${row.limit}`;
    return `<div class="m-category">${dot(kebab(row.color))}<span style="flex:1">${text(row.name, { size: 's' })}</span><span class="track" style="max-width:96px"><i class="fill" style="display:block;width:${width}%;background:var(--color-${fillColor})"></i></span>${fig(note, { size: 'xs', tone: state === 'over' ? 'danger' : 'muted', style: 'min-width:34px;text-align:right' })}${price(row.spent, { fixed: 0, bold: true, tone: state === 'over' ? 'danger' : undefined })}</div>`;
  }).join('')}</div>`;
const categoryHero = (budget) =>
  `<div><div style="display:flex;align-items:center;gap:8px">${dot('accent')}${text('Personal', { size: 'l', bold: true, style: 'flex:1' })}${eyebrow(`September · ${BASE}`)}</div><div style="display:flex;align-items:baseline;gap:8px;margin-top:8px">${price(226, { size: 'xl', bold: true })}${fig(`41% ${L.OF_SPEND}`, { size: 'sm', tone: 'muted' })}</div>${budget ? `<div class="m-bar" style="margin:12px 0 4px"><div class="fill" style="width:65.5%"></div></div>${fieldRow('Budget', `${price(345, { tone: undefined })}${text('300 + 45 carried over', { size: 'xxs', tone: 'muted' })}`, { chevron: true })}${monthRow('Left', price(119, { size: 'md' }), text('of 345', { size: 'xs', tone: 'muted' }))}` : ''}</div>`;







export const REVIEW = [
  {
    id: 'UI-BUDGETS', area: 'Overview · Analytics · Category', title: 'A soft budget that says where you stand, never blocks',
    why: 'Phase 1 needs a line in the month block and a state per category. Recommended: one "Budgets" line (what is left of the sum of the limits, how many categories are over), the Analytics category track read against the limit instead of the share (ink while within, accent from 80%, danger beyond it with the excess beside), and the limit as one Budget row in the Category sheet with the carried-over amount in its caption. Alternative: only the month line and no per-category colour. Alerts are a later task and are not drawn.',
    accept: 'The month block carries the Budgets line; budgeted categories in Analytics draw their track against the limit with the within, near and over states; the Category sheet edits the limit and shows the rollover; categories without a limit draw as today.',
    now: stack(
      frame(monthSummary({ spent: 552.78, baseline: 1042.29, pace: `−47% ${L.BELOW_PACE}`, day: 9, swing: -208.11, swingCategory: 'Personal', scheduled: 1325.29, pending: 4 })),
      frame(categoryBars(false)),
      frame(categoryHero(false), { sheet: true }),
    ),
    proposed: stack(
      frame(monthSummary({ spent: 552.78, baseline: 1042.29, pace: `−47% ${L.BELOW_PACE}`, day: 9, swing: -208.11, swingCategory: 'Personal', scheduled: 1325.29, pending: 4, lines: monthRow('Budgets', price(68, { size: 'md' }), text('left of 520 · 1 over', { size: 'xs', tone: 'muted' })) })),
      frame(categoryBars(true)),
      frame(categoryHero(true), { sheet: true }),
    ),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell" data-review="${id}" style="grid-column: 1 / -1"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px"><div style="grid-column:1 / -1"><b style="font:600 15px/1.3 var(--font-sans)">${esc(title)}</b><p class="kit-note" style="margin:4px 0 0">${esc(why)}</p><p class="kit-note" style="margin:4px 0 0"><b>Accept</b> · ${esc(accept)}</p></div><div><div class="kit-caption" style="margin-bottom:8px">Now</div><div style="overflow:auto">${now}</div></div><div><div class="kit-caption" style="margin-bottom:8px">Proposed</div><div style="overflow:auto">${proposed}</div></div></div></div>`).join('');
