import {
  ACCOUNTS, BASE, L, NET, accountRow,
  chip, esc, eyebrow, fieldRow, fig,
  heading, kebab, monthRow,
  monthSummary, price, text, 
} from './draw.mjs';

const frame = (body, { sheet, width = 350 } = {}) => `<div class="m" style="width:${width}px;padding:12px 0;background:var(--color-${sheet ? 'surface' : 'background'})">${body}</div>`;

const stack = (...parts) => parts.join('<div style="height:16px"></div>');
const dot = (tone) => `<i class="m-dot" style="width:9px;height:9px;background:var(--color-${tone})"></i>`;

const CARD = { title: 'Visa', currency: 'USD', balance: -1284.3 };
const NET_WITH_CARD = NET + CARD.balance;
const cardEyebrow = () => `${L.NET_WORTH} · ${ACCOUNTS.length + 1} ${L.ACCOUNTS_CAPTION(ACCOUNTS.length + 1)} · ${BASE}`;
const liabilityRow = ({ title, currency, balance }) =>
  `<div class="m-row" style="padding:10px 0"><span class="text"><span style="display:flex;align-items:center;gap:8px">${text(title, { medium: true })}${chip('Owed', { variant: 'outline' })}</span>${text(`${currency} · Credit card`, { size: 'xxs', tone: 'muted' })}</span><span class="amount">${price(balance, { currency, size: 'lg', bold: true, symbol: true })}${fig('—', { size: 'xs', tone: 'muted' })}</span></div>`;
const accountsFrame = (card) =>
  frame(
    `<div class="m-hero">${eyebrow(cardEyebrow())}<div style="margin-top:4px">${price(NET_WITH_CARD, { size: 'hero', bold: true })}</div>${card ? `<div style="display:flex;gap:12px;margin-top:6px">${text('Assets', { size: 'xxs', tone: 'muted' })}${price(NET, { size: 'xs', tone: 'muted' })}${text('Owed', { size: 'xxs', tone: 'muted' })}${price(CARD.balance, { size: 'xs', tone: 'muted' })}</div>` : ''}</div><div><div class="m-section">${heading(L.ACCOUNTS, { eyebrow: `${ACCOUNTS.length + 1}` })}${[...ACCOUNTS.slice(0, 2).map((account) => accountRow({ ...account, change: undefined })), card ? liabilityRow(CARD) : accountRow(CARD)].join('')}</div></div>`,
  );
const overviewAccountsFrame = (card) =>
  frame(`<div><div class="m-section">${heading(L.ACCOUNTS, { actions: eyebrow(L.SEE_ALL_COUNT(ACCOUNTS.length + 1)) })}${[accountRow(ACCOUNTS[0]), accountRow(ACCOUNTS[1]), card ? liabilityRow(CARD) : accountRow(CARD)].join('')}</div></div>`);

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
    id: 'UI-ACC-NEGATIVE', area: 'Accounts · Overview', title: 'A card you owe, next to the accounts you hold',
    why: 'Today a negative balance is drawn like any other: a minus in ink and nothing that says it is a debt, and the net worth hides what is owed inside one figure. Recommended: the same row, a quiet "Owed" outline chip under the name and "Credit card" in the caption, the figure staying ink (red is kept for destructive actions), and an Assets / Owed pair under the net worth. The distribution bar keeps drawing assets only. Alternative: a separate "Owed" group under the list, or the figure in the danger tone. How an account becomes a liability (a negative opening balance is enough) is logic and lives in ACC-NEGATIVE.',
    accept: 'Accounts and the Overview rows draw a negative balance with the "Owed" chip and its caption, the Accounts hero shows Assets and Owed under the net worth, and the distribution bar ignores the debt; the five dictionaries carry the two new words.',
    now: stack(accountsFrame(false), overviewAccountsFrame(false)),
    proposed: stack(accountsFrame(true), overviewAccountsFrame(true)),
  },
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
