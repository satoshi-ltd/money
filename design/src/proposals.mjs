import {
  BASE, ICON, L, accountRow, btn, content, emptyState, esc, eyebrow, fieldRow, fig, heading, iconButton,
  input, masthead, phone, price, seg, text,
} from './draw.mjs';

const missingConversion = (proposed) => {
  const local = accountRow({ title: 'Chase', currency: BASE, balance: 1000 })
    .replace(fig('—', { size: 'xs', tone: 'muted' }), '');
  const foreign = accountRow({ title: 'Wallet', currency: 'THB', balance: 34596, base: 0 });
  const foreignRow = proposed
    ? foreign.replace(price(0, { size: 'xs', tone: 'muted' }), fig('—', { size: 'xs', tone: 'muted' }))
    : foreign;

  return phone('Accounts', 'Accounts · USD base, two accounts, no THB rate',
    `${masthead({ section: L.ACCOUNTS, actions: iconButton(ICON.ADD) })}${content(`
      <div class="m-hero">${eyebrow(`${L.NET_WORTH} · 2 ${L.ACCOUNTS_CAPTION(2)} · ${BASE}`)}
        <div class="proposal-hero-value">${price(1000, { size: 'hero', bold: true })}</div>
      </div>
      <div class="proposal-filter">${seg([L.ALL, 'USD', 'THB'], L.ALL, { auto: true })}</div>
      <div class="m-section">${heading(L.ACCOUNTS, { eyebrow: '2' })}${local}${foreignRow}</div>
    `)}`, { tab: L.ACCOUNTS });
};

const scheduledEmpty = (proposed) =>
  phone('Scheduled', 'Scheduled · before the first template',
    `${masthead({ section: L.SCHEDULED, back: true, actions: iconButton(ICON.ADD) })}${content(`
      <div class="proposal-summary">${eyebrow(`${L.SCHEDULED_IMPACT} · ${BASE}`)}
        <div class="proposal-hero-value">${price(0, { size: 'xl', bold: true, operator: true })}</div>
        ${text(L.SCHEDULED_IMPACT_CAPTION, { size: 'xxs', tone: 'muted' })}
      </div>
      ${proposed
        ? emptyState(L.SCHEDULED_EMPTY, L.SCHEDULED_EMPTY_GUIDE, L.A11Y_ADD_SCHEDULED)
        : `<div class="proposal-empty-lines">${text(L.SCHEDULED_EMPTY, { medium: true })}${text(L.SCHEDULED_EMPTY_GUIDE, { size: 's', tone: 'muted' })}</div>`}
    `)}`);

const SUNDAY = new Date(2023, 0, 1);
const weekdayShort = (day) => new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(2023, 0, SUNDAY.getDate() + day));
const THURSDAY = 4;

const weeklyRule = (proposed) =>
  phone('ScheduledForm', 'Scheduled form · a weekly rule on Thursday',
    `${masthead({ section: L.SCHEDULED_ONE, sheet: true })}${content(`
      <div class="proposal-block">${seg([L.EXPENSE, L.INCOME], L.EXPENSE)}</div>
      <div class="proposal-block">${fieldRow(L.CONCEPT, input('Gym', { right: true }))}${fieldRow(L.AMOUNT, `${input('40', { right: true, figure: true })}${fig('$', { size: 'sm', tone: 'muted' })}`, { divider: true })}${fieldRow(L.ACCOUNT, text('Chase', { size: 's', medium: true }), { divider: true, chevron: true })}${fieldRow(L.CATEGORY, text('Healthcare', { size: 's', medium: true }), { divider: true, chevron: true })}</div>
      <div class="proposal-block">${eyebrow(L.SCHEDULED_FREQUENCY)}<div class="proposal-gap">${seg([L.SCHEDULED_PATTERN_WEEKLY, L.SCHEDULED_PATTERN_MONTHLY], L.SCHEDULED_PATTERN_WEEKLY)}</div></div>
      <div class="m-daychips proposal-gap">${[0, 1, 2, 3, 4, 5, 6].map((day) => `<span class="m-daychip${day === THURSDAY ? ' on' : ''}">${text(proposed ? weekdayShort(day).slice(0, 2) : weekdayShort(day).charAt(0), { size: 's', bold: day === THURSDAY, medium: day !== THURSDAY, tone: day === THURSDAY ? 'onAccent' : 'muted' })}</span>`).join('')}</div>
      <div class="proposal-gap">${text('Next · Thu, 11 Sep', { size: 's', tone: 'muted' })}</div>
      <div class="proposal-buttons">${btn(L.DELETE, { variant: 'dangerSoft', grow: true })}${btn(L.SAVE, { grow: true })}</div>
    `)}`, { sheet: true });

export const REVIEW = [
  {
    id: 'UI-FX-MISSING-VALUES', area: 'Accounts · unavailable conversion', title: 'Keep an unavailable conversion distinct from zero',
    why: 'Open Accounts to inspect balances, then tap Wallet to enter its native-currency transaction list. The screen already establishes USD once above the net worth and places each conversion beneath its original balance. Preserve that hierarchy. In the same two-account fixture on both sides, Chase holds USD 1,000 and Wallet holds THB 34,596 with no THB rate. Accounts currently defaults the missing conversion to 0.00; the proposal substitutes only that secondary value with an em dash. The hero still sums convertible balances under the current ledger rule; the separate decision DEC-FX-COVERAGE owns how partial totals should read. This is a data-state correction, not a composition change. Trade-off: a dash avoids a false number but cannot explain the missing rate on its own; an accessible name is required.',
    accept: 'The complete Accounts screen retains the hero, filter, row alignment, navigation and native amounts; only an unavailable secondary conversion becomes an em dash. A real zero stays 0.00, restoring a rate restores the figure, and masking hides both amount slots consistently. Apply the same value rule to the existing foreign-account rows on Overview without moving their content. Supply the unavailable accessible name in all five dictionaries and test these states. The logic follows ROADMAP task FX-MISSING-VALUES; no new persisted field is needed.',
    now: missingConversion(false), proposed: missingConversion(true),
  },
  {
    id: 'SCHEDULED-EMPTY', area: 'Scheduled · before the first template', title: 'Give the empty Scheduled panel the same empty state as the other lists',
    why: 'Scheduled opens from the Scheduled line of the month block and from Settings; its next action is the form of a new template. With no template it draws two lines of text (Scheduled.jsx) while Accounts, Transactions and Analytics use the EmptyState component with a well, a caption and a button, so this is the one empty list whose only way forward is the 34-point plus in the masthead. Both sides keep the masthead, the plus and the 30-day figure; the proposal swaps the two lines for EmptyState with the existing copy and the existing label "Add scheduled transaction" as its action. Trade-off: the block is taller and centred, which matters nowhere because nothing sits under it. Reproduced by reading the four screens, not on a device.',
    accept: 'With no scheduled template, Scheduled renders EmptyState with SCHEDULED_EMPTY, SCHEDULED_EMPTY_GUIDE and an action labelled A11Y_ADD_SCHEDULED that opens the new-template form; the masthead plus and the impact figure stay; with one template the list renders as today; no new copy key; a render test covers both states, the Mobile view is regenerated and SPEC names the state.',
    now: scheduledEmpty(false), proposed: scheduledEmpty(true),
  },
  {
    id: 'SCHEDULED-WEEKDAYS', area: 'Scheduled form · weekly rule', title: 'Tell Tuesday from Thursday on the weekday chips',
    why: 'The form opens from the plus or a row of Scheduled; a weekly rule is chosen on seven chips and saved. Each chip shows the first letter of the short weekday (ScheduledForm.jsx, weekdayInitial), Sunday first, so English reads S M T W T F S: two T and two S, told apart only by position; German gives M D M D, Spanish M M, Portuguese S S S and Q Q. The specimen selects Thursday on both sides; the proposal shows the shortest start of the short weekday that is unique within the week, in the same seven slots, the same height and the same order: two letters in English, Spanish, French and German (Su Mo Tu We Th Fr Sa), three in Portuguese, where seg and sex, qua and qui share two. Trade-off: three letters at the largest text size in a 38-point chip must be checked before shipping; if they clip, the chip keeps one letter and the caption under the chips names the chosen days instead. The Mobile view draws these chips Monday first, which the app does not; that correction travels with this change.',
    accept: 'Each weekday chip shows the shortest start of the short weekday of the reader\'s language that is unique within the week (a test asserts seven distinct labels in EN, ES, PT, FR and DE, two letters everywhere but Portuguese), in the order and geometry of today; each chip is a button named by the full weekday with its selected state; the labels fit a 38-point chip at the largest text size (textScale test); the Mobile view draws the same order and labels.',
    now: weeklyRule(false), proposed: weeklyRule(true),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell proposal-board" data-review="${id}"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen proposal-grid"><div class="proposal-description"><b>${esc(title)}</b><p class="kit-note">${esc(why)}</p><p class="kit-note"><b>Accept</b> · ${esc(accept)}</p></div><div class="proposal-side"><div class="kit-caption">Now</div><div class="proposal-scroll">${now}</div></div><div class="proposal-side"><div class="kit-caption">Proposed</div><div class="proposal-scroll">${proposed}</div></div></div></div>`).join('');
