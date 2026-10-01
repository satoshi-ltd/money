import { L, esc, heading, monthRow, monthSummary, price, text } from './draw.mjs';

const monthBlock = (lines = '') =>
  `<div class="m" style="width:360px;background:var(--color-background);padding:0 20px 16px">${heading(L.THIS_MONTH, { eyebrow: 'September' })}${monthSummary({ spent: 552.78, baseline: 1042.29, pace: `−47% ${L.BELOW_PACE}`, day: 9, swing: -208.11, swingCategory: 'Personal', scheduled: 1325.29, pending: 4, lines })}</div>`;

const budgetsRow = () => monthRow(L.BUDGETS, price(68, { size: 'md' }), text(L.BUDGETS_OVER(1), { size: 'xs', tone: 'muted' }));

const endsNear = () => monthRow('Ends near', price(2227.49, { size: 'md' }), text('Usual month ', { size: 'xs', tone: 'muted' }) + price(2100, { size: 'xs', tone: 'muted' }));

export const REVIEW = [
  {
    id: 'UI-INS-PACE-SCHEDULED', area: 'Overview · the month block', title: 'Where the month ends, with what is still scheduled',
    why: "The pace compares what has been spent by today with what was spent by the same day in the last six months, so a charge scheduled for later falls on neither side and \"47% below pace\" can sit above 1,675 of rent and subscriptions still to come. The Scheduled line shows their net, which an income can hide. One line fixes the reading without touching the pace: where the month ends if nothing but the scheduled expenses is spent from here (spent so far plus the expenses still scheduled, converted at today's table), beside the usual full month (the median of the last six). Expenses only: scheduled incomes stay out, as the discarded forecast signal decided. It appears only while an expense is pending and a usual month exists, and never changes the lead's verdict. Recommended.",
    accept: 'While at least one expense is still pending this month (a scheduled occurrence not yet recorded, or an entry dated later this month) and at least two earlier months with spend give a usual full month, the month block shows one line, Ends near, with spent so far plus those pending expenses and the usual month as its hint, between the swing and the Budgets lines; it is absent otherwise; a month with no spend yet still shows it; pending expenses in another currency convert at the latest table and one that cannot be converted is skipped; occurrences already recorded are not counted twice; scheduled incomes are never counted; the lead pace and bar are untouched; a test per rule, and the ROADMAP task INS-PACE-SCHEDULED follows this board.',
    now: monthBlock(budgetsRow()),
    proposed: monthBlock(`${endsNear()}${budgetsRow()}`),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell" data-review="${id}" style="grid-column: 1 / -1"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px"><div style="grid-column:1 / -1"><b style="font:600 15px/1.3 var(--font-sans)">${esc(title)}</b><p class="kit-note" style="margin:4px 0 0">${esc(why)}</p><p class="kit-note" style="margin:4px 0 0"><b>Accept</b> · ${esc(accept)}</p></div><div><div class="kit-caption" style="margin-bottom:8px">Now</div><div style="overflow:auto">${now}</div></div><div><div class="kit-caption" style="margin-bottom:8px">Proposed</div><div style="overflow:auto">${proposed}</div></div></div></div>`).join('');
