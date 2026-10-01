import {
  ACCOUNTS, BASE, DE, FR, ICON, L, NET, accountRow,
  btn, check, chip, dayHead, esc, eyebrow, fieldRow, fig,
  flowChart, heading, icon, input, kebab, masthead, monthRow,
  monthSummary, price, rightValue, seg, setting, switchEl, text, txRow,
} from './draw.mjs';

const frame = (body, { sheet, width = 350 } = {}) => `<div class="m" style="width:${width}px;padding:12px 0;background:var(--color-${sheet ? 'surface' : 'background'})">${body}</div>`;

const stack = (...parts) => parts.join('<div style="height:16px"></div>');
const tail = (...parts) => `<span style="display:flex;align-items:center;gap:8px">${parts.join('')}</span>`;
const weekBars = (values, top) => `<span style="display:flex;align-items:flex-end;gap:3px;height:18px">${values.map((value, index) => `<i style="display:block;width:6px;height:${Math.round(value * 18)}px;background:var(--color-${index === top ? 'accent' : 'text-muted'})"></i>`).join('')}</span>`;
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

const goalBlock = ({ title, saved, target, pace, month }) =>
  `<div style="padding:12px 0;border-bottom:var(--hairline) solid var(--color-border)"><div style="display:flex;align-items:baseline;gap:8px">${text(title, { medium: true, style: 'flex:1' })}${eyebrow(pace)}</div><div style="display:flex;align-items:baseline;gap:8px;margin-top:6px">${price(saved, { size: 'lg', bold: true, fixed: 0 })}${text('of', { size: 'xs', tone: 'muted' })}${price(target, { size: 'md', tone: 'muted', fixed: 0 })}${fig(`${Math.round((saved / target) * 100)}%`, { size: 'xs', tone: 'muted', style: 'margin-left:auto' })}</div><div class="m-bar" style="margin:9px 0 6px"><div class="fill" style="width:${((saved / target) * 100).toFixed(1)}%"></div></div><div style="display:flex;align-items:baseline;gap:8px">${price(month, { size: 'xs', operator: true, tone: 'positive', fixed: 0 })}${text('this month', { size: 'xxs', tone: 'muted' })}</div></div>`;
const goalsSection = () =>
  `<div class="m-section">${heading('Goals', { eyebrow: '2' })}${goalBlock({ title: 'Emergency fund', saved: 9800, target: 15000, pace: 'Sep 2027 at this pace', month: 450 })}${goalBlock({ title: 'Japan trip', saved: 1200, target: 4000, pace: 'Jun 2027 at this pace', month: 150 })}</div>`;
const overviewSlice = (goals) =>
  frame(`<div><div class="m-section">${heading(L.ACCOUNTS, { actions: eyebrow(L.SEE_ALL_COUNT(ACCOUNTS.length)) })}${ACCOUNTS.slice(0, 2).map(accountRow).join('')}</div>${goals ? goalsSection() : ''}<div class="m-section">${heading(L.TRANSACTIONS, { actions: eyebrow(L.SEE_ALL) })}${dayHead('Today', -36.36)}${txRow({ time: '11:16', title: 'Gasoline', category: 'Transit', value: 1000, currency: 'THB', base: 30.43 })}</div></div>`);

const amountRow = (value) => fieldRow(L.AMOUNT, `${input(value, { right: true, figure: true })}${fig('$', { size: 'sm', tone: 'muted' })}`, { divider: true });
const accountField = () => fieldRow(L.ACCOUNT, `${text('Chase ·', { size: 's', medium: true })}${price(12480.55)}`, { divider: true, chevron: true });
const splitPart = (category, value) => fieldRow(category, `${input(value, { right: true, figure: true })}${fig('$', { size: 'sm', tone: 'muted' })}`, { divider: true });
const formFrame = (body, button) => frame(`<div>${body}<div style="margin-top:20px">${button}</div></div>`, { sheet: true });

const SETTINGS_PREFS = (extra = '', hour = '08:00') =>
  `<div><div class="m-group">${eyebrow(L.PREFERENCES, { style: 'display:block' })}${setting(L.SCHEDULED, { right: rightValue('4') })}${setting(L.MASK_AMOUNTS, { divider: true, subtitle: L.MASK_AMOUNTS_CAPTION, right: switchEl(false) })}${setting(L.REMINDER_BACKUP, { divider: true, subtitle: `${L.SCHEDULED_PATTERN_WEEKLY} · Sun ${hour}`, right: switchEl(true) })}${extra}</div></div>`;
const hourRows = (hours, chosen) =>
  hours.map((hour, index) => `<div style="display:flex;align-items:center;gap:12px;height:44px${index ? ';border-top:var(--hairline) solid var(--color-border)' : ''}">${fig(hour, { size: 'md', bold: hour === chosen, style: 'flex:1' })}${hour === chosen ? icon(ICON.CHECK, { tone: 'accent' }) : ''}</div>`).join('');

const proposalFrom = ({ title, where, value, mark }) =>
  `<div style="display:flex;align-items:center;gap:8px;min-height:44px;border-top:var(--hairline) solid var(--color-border)"><span style="flex:1;display:flex;flex-direction:column"><span style="display:flex;align-items:center;gap:8px">${text(title, { size: 's', medium: true })}${mark ? chip(mark, { variant: 'outline' }) : ''}</span>${text(where, { size: 'xxs', tone: 'muted' })}</span>${price(value, { tone: 'accent', operator: true })}</div>`;
const conceptForm = (rows) =>
  frame(`<div><div>${seg([L.EXPENSE, L.INCOME, L.SWAP], L.EXPENSE)}</div><div style="margin-top:16px">${fieldRow(L.CONCEPT, input('sal', { right: true }))}${rows}${amountRow('')}${accountField()}${fieldRow(L.CATEGORY, text('Food & Drinks', { size: 's', medium: true }), { divider: true, chevron: true })}</div></div>`, { sheet: true });

const tickTable = (dict, months) => months.map((month) => dict.MONTHS[month].slice(0, 3).toLowerCase());
const MONTHS_SHORT = {
  FR: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  DE: ['jan.', 'feb.', 'märz', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sept.', 'okt.', 'nov.', 'dez.'],
};
const FLOW_SAMPLE = { incomes: [3000, 3000, 3200, 3000, 4100, 3000], expenses: [2100, 2450, 1980, 2600, 2300, 1900] };
const tickChart = (labels, caption) => `${eyebrow(caption, { style: 'display:block;margin-bottom:4px' })}${flowChart({ ...FLOW_SAMPLE, labels, figureLabels: true })}`;
const FR_WINDOW = [3, 4, 5, 6, 7, 8];
const DE_WINDOW = [0, 1, 2, 3, 4, 5];

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
    id: 'UI-GOALS', area: 'Overview · Goals', title: 'A goal with a target and this month\'s progress',
    why: 'Recommended: a Goals section on the Overview between Accounts and Transactions, present only once a goal exists: name, saved of target, one accent bar, the month\'s contribution and the month the target lands at this pace, all in the base currency; a small sheet creates or edits a goal. Alternative: the goals inside Analytics, which keeps the Overview shorter but hides them. Which balances feed a goal is logic and lives in GOALS.',
    accept: 'The Overview draws the Goals section from the first goal and nothing before it; a goal sheet takes name, target and an optional date; figures and the bar follow the base currency; the five dictionaries carry the new copy.',
    now: overviewSlice(false),
    proposed: stack(
      overviewSlice(true),
      frame(`<div>${masthead({ section: 'Goal', sheet: true })}<div style="margin-top:8px">${fieldRow(L.NAME, input('Emergency fund', { right: true }))}${fieldRow('Target', `${input('15000', { right: true, figure: true })}${fig('$', { size: 'sm', tone: 'muted' })}`, { divider: true })}${fieldRow('By', text('Optional', { size: 's', tone: 'muted' }), { divider: true, chevron: true })}</div><div style="display:flex;gap:12px;margin-top:24px">${btn(L.DELETE, { variant: 'dangerSoft', grow: true })}${btn(L.SAVE, { grow: true })}</div></div>`, { sheet: true }),
    ),
  },
  {
    id: 'UI-SPLIT-TX', area: 'Transaction form · Transactions', title: 'One entry, several categories',
    why: 'Recommended: the Category row gains a "Split" outline chip; choosing it turns the row into one row per part (category and amount), an "Add a part" chip and a "Left to assign" line that must read zero before Save is available; in lists the entry reads "Split · 3 categories". Alternative: parts entered as percentages, or splitting only from the Clone sheet. The single balance effect and the per-category reporting are logic and live in SPLIT-TX.',
    accept: 'The Category row offers Split; the split form lists the parts with a live "Left to assign" and keeps Save off until it is zero; the transaction row marks a split entry; the five dictionaries carry Split, Add a part and Left to assign.',
    now: formFrame(`${fieldRow(L.CONCEPT, input('Market', { right: true }))}${amountRow('120')}${accountField()}${fieldRow(L.CATEGORY, text('Food & Drinks', { size: 's', medium: true }), { divider: true, chevron: true })}`, btn(L.SAVE_EXPENSE, { grow: true })),
    proposed: stack(
      formFrame(`${fieldRow(L.CONCEPT, input('Market', { right: true }))}${amountRow('120')}${accountField()}${fieldRow(L.CATEGORY, `${chip('Split', { variant: 'outline' })}${text('Food & Drinks', { size: 's', medium: true })}`, { divider: true, chevron: true })}`, btn(L.SAVE_EXPENSE, { grow: true })),
      formFrame(`${fieldRow(L.CONCEPT, input('Market', { right: true }))}${amountRow('120')}${accountField()}<div style="display:flex;align-items:center;margin-top:16px">${eyebrow('Split · 3 parts', { style: 'flex:1' })}${chip('Add a part', { variant: 'outline', iconName: ICON.ADD })}</div>${splitPart('Food & Drinks', '80')}${splitPart('Home', '30')}${splitPart('Personal', '10')}${monthRow('Left to assign', price(0, { size: 'md' }), icon(ICON.CHECK, { size: 'xs', tone: 'accent' }))}`, btn(L.SAVE_EXPENSE, { grow: true })),
      frame(`${dayHead('Today', -120)}${txRow({ time: '18:02', title: 'Market', category: 'Split · 3 categories', value: 120, currency: 'USD' })}`),
    ),
  },
  {
    id: 'UI-INS-V2', area: 'Overview', title: 'Three more lines in the month block',
    why: 'Recommended: each pattern is one line under the swing and above Scheduled, in the block\'s own grammar (label, figure or word, muted hint): the busiest weekday with seven small bars and its share of spend, the largest entry of the month with its title and date, and the subscriptions found with their monthly total and count. Alternative: lines that open the entries behind them, as Scheduled does; not drawn, to keep the block quiet.',
    accept: 'The month block shows the Busiest day, Largest and Subscriptions lines when their data exists and omits each one otherwise; the lines keep the 96-point label column and hold at large text sizes; the five dictionaries carry the three labels.',
    now: frame(monthSummary({ spent: 552.78, baseline: 1042.29, pace: `−47% ${L.BELOW_PACE}`, day: 9, swing: -208.11, swingCategory: 'Personal', scheduled: 1325.29, pending: 4 })),
    proposed: frame(monthSummary({
      spent: 552.78, baseline: 1042.29, pace: `−47% ${L.BELOW_PACE}`, day: 9, swing: -208.11, swingCategory: 'Personal', scheduled: 1325.29, pending: 4,
      lines: `${monthRow('Busiest day', text('Saturday'), tail(weekBars([0.35, 0.3, 0.4, 0.3, 0.55, 1, 0.45], 5), text('34% of spend', { size: 'xs', tone: 'muted' })))}${monthRow('Largest', price(-180, { size: 'md' }), text('Dentist, Sep 3', { size: 'xs', tone: 'muted' }))}${monthRow('Subscriptions', price(-66.98, { size: 'md' }), text('3 every month', { size: 'xs', tone: 'muted' }))}`,
    })),
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
    id: 'UI-MONTH-TICKS', area: 'Analytics', title: 'Month ticks that read as months',
    why: 'Now: the ticks are the first three letters of the month name, so German draws "mär" and French draws "jui" twice, for juin and juillet. Proposed: each language owns its short month (MONTHS_SHORT), with a full stop where the word is cut, still lower case like every figure label. Alternative: sentence case ("Juin", "Juil."), which reads better in German but sets the ticks apart from the mono figures.',
    accept: 'Chart and FlowChart draw MONTHS_SHORT, every tick of a 12-month window is distinct in the five languages, and the longest tick fits a slot of one sixth of the chart at the largest text size.',
    now: stack(tickChart(tickTable(DE, DE_WINDOW), 'Deutsch · Jan to Jun'), tickChart(tickTable(FR, FR_WINDOW), 'Français · Apr to Sep')),
    proposed: stack(
      tickChart(DE_WINDOW.map((month) => MONTHS_SHORT.DE[month]), 'Deutsch · Jan to Jun'),
      tickChart(FR_WINDOW.map((month) => MONTHS_SHORT.FR[month]), 'Français · Apr to Sep'),
    ),
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
