import {
  ACCOUNTS, BASE, DE, ICON, L, NET, accountRow,
  check, chip, esc, eyebrow, fieldRow, fig,
  heading, icon, input, kebab, masthead, monthRow,
  monthSummary, price, rightValue, seg, setting, switchEl, text, 
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


const amountRow = (value) => fieldRow(L.AMOUNT, `${input(value, { right: true, figure: true })}${fig('$', { size: 'sm', tone: 'muted' })}`, { divider: true });
const accountField = () => fieldRow(L.ACCOUNT, `${text('Chase ·', { size: 's', medium: true })}${price(12480.55)}`, { divider: true, chevron: true });

const SETTINGS_PREFS = (extra = '', hour = '08:00') =>
  `<div><div class="m-group">${eyebrow(L.PREFERENCES, { style: 'display:block' })}${setting(L.SCHEDULED, { right: rightValue('4') })}${setting(L.MASK_AMOUNTS, { divider: true, subtitle: L.MASK_AMOUNTS_CAPTION, right: switchEl(false) })}${setting(L.REMINDER_BACKUP, { divider: true, subtitle: `${L.SCHEDULED_PATTERN_WEEKLY} · Sun ${hour}`, right: switchEl(true) })}${extra}</div></div>`;
const hourRows = (hours, chosen) =>
  hours.map((hour, index) => `<div style="display:flex;align-items:center;gap:12px;height:44px${index ? ';border-top:var(--hairline) solid var(--color-border)' : ''}">${fig(hour, { size: 'md', bold: hour === chosen, style: 'flex:1' })}${hour === chosen ? icon(ICON.CHECK, { tone: 'accent' }) : ''}</div>`).join('');

const proposalFrom = ({ title, where, value, mark }) =>
  `<div style="display:flex;align-items:center;gap:8px;min-height:44px;border-top:var(--hairline) solid var(--color-border)"><span style="flex:1;display:flex;flex-direction:column"><span style="display:flex;align-items:center;gap:8px">${text(title, { size: 's', medium: true })}${mark ? chip(mark, { variant: 'outline' }) : ''}</span>${text(where, { size: 'xxs', tone: 'muted' })}</span>${price(value, { tone: 'accent', operator: true })}</div>`;
const conceptForm = (rows) =>
  frame(`<div><div>${seg([L.EXPENSE, L.INCOME, L.SWAP], L.EXPENSE)}</div><div style="margin-top:16px">${fieldRow(L.CONCEPT, input('sal', { right: true }))}${rows}${amountRow('')}${accountField()}${fieldRow(L.CATEGORY, text('Food & Drinks', { size: 's', medium: true }), { divider: true, chevron: true })}</div></div>`, { sheet: true });


const hideRow = (label, size) => `<div class="m-checkrow">${text(label, { size, tone: 'muted', style: 'flex:1' })}${check(false)}</div>`;
const hideFrame = (label, deLabel) =>
  frame(`<div>${eyebrow('English', { style: 'display:block;margin-top:4px' })}${hideRow(label, 's')}${eyebrow('Deutsch', { style: 'display:block;margin-top:12px' })}${hideRow(deLabel, 's')}${eyebrow('Large text, Deutsch', { style: 'display:block;margin-top:12px' })}${hideRow(deLabel, 'l')}</div>`, { sheet: true });

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
  {
    id: 'UI-NOTIF-TIME', area: 'Settings', title: 'The hour of the reminders',
    why: 'Both reminders fire at 08:00 today and Settings offers no way to move them. Recommended: one "Reminder time" row in Preferences under the backup switch, its caption naming what it moves, opening a sheet of hours with a check on the chosen one; the backup caption then reads the chosen hour. Alternative: one row per reminder kind, which doubles the rows for a setting few will tell apart.',
    accept: 'Preferences shows the Reminder time row with the stored hour, the sheet lists the hours with the chosen one checked, and the backup reminder caption follows it; the five dictionaries carry the row and its caption.',
    now: frame(SETTINGS_PREFS()),
    proposed: stack(
      frame(SETTINGS_PREFS(setting('Reminder time', { divider: true, subtitle: 'Scheduled transactions the day before, backup on Sundays', right: rightValue('09:00', { figure: true }) }), '09:00')),
      frame(`<div>${masthead({ section: 'Reminder time', sheet: true })}<div style="margin-top:8px">${hourRows(['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'], '09:00')}</div></div>`, { sheet: true }),
    ),
  },
  {
    id: 'UI-REC-CROSS-TYPE', area: 'Transaction form', title: 'A title known only under the other type',
    why: 'Typing "sal" on Expense offers nothing today because Salary only exists as an income. Recommended: when the current type has no proposal, the row for the other type\'s title appears with an outline chip naming that type and the amount signed; a tap writes the title, amount, account and category and flips the type, as the exact-title flip already does. Alternative: no chip and a type-coloured amount, which reads as a bug rather than an offer.',
    accept: 'With no proposal under the current type, the row for the other type appears marked with that type\'s name; it never appears when the current type has a proposal; the chip names the type in the five languages.',
    now: conceptForm(''),
    proposed: conceptForm(proposalFrom({ title: 'Salary', where: 'Chase · Salary', value: 3000, mark: L.INCOME })),
  },
  {
    id: 'UI-HIDE-COPY', area: 'Transaction form', title: 'What the checkbox promises',
    why: 'The box keeps an entry out of Analytics and out of the Overview month block, but the label names only Analytics. Recommended: the wider label, "Hide from Analytics and the month", which says what happens and still fits one line at the default size (it wraps to two at large text, as drawn). Alternative: keep the label and document the wider effect in SPEC, which costs no width but leaves the reader guessing.',
    accept: 'The Transaction and Clone forms draw the wider label in the five languages; the row stays at least 44 points tall and wraps without clipping at the largest text size.',
    now: hideFrame(L.HIDE_FROM_ANALYTICS, DE.HIDE_FROM_ANALYTICS),
    proposed: hideFrame('Hide from Analytics and the month', 'Nicht in Analysen und im Monat'),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell" data-review="${id}" style="grid-column: 1 / -1"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px"><div style="grid-column:1 / -1"><b style="font:600 15px/1.3 var(--font-sans)">${esc(title)}</b><p class="kit-note" style="margin:4px 0 0">${esc(why)}</p><p class="kit-note" style="margin:4px 0 0"><b>Accept</b> · ${esc(accept)}</p></div><div><div class="kit-caption" style="margin-bottom:8px">Now</div><div style="overflow:auto">${now}</div></div><div><div class="kit-caption" style="margin-bottom:8px">Proposed</div><div style="overflow:auto">${proposed}</div></div></div></div>`).join('');
