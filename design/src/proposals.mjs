import { esc, eyebrow, fig, L, text } from './draw.mjs';

const frame = (body) => `<div class="m" style="width:350px;padding:12px 0;background:var(--color-background)">${body}</div>`;

const COPY = [
  ['ERROR_SERVICE_RATES', 60, "Couldn't update rates. Check your connection."],
  ['ERROR_IMPORT', 60, 'That file is not a backup.'],
  ['CONFIRM_DELETION_CAPTION', 60, 'This cannot be undone.'],
  ['CONFIRM_LOCK_CAPTION', 60, 'Your PIN is asked on the next open.'],
  ['SCHEDULED_AUTOCREATE_LIMIT', 60, '100 scheduled entries created. Review them in Scheduled.'],
  ['SCHEDULED_EMPTY_GUIDE', 48, 'Recurring entries, created on their due date.'],
  ['EMPTY_ACCOUNTS_CAPTION', 48, 'Add an account to start.'],
  ['BIOMETRIC_UNLOCK_INVALIDATED', 48, 'Fingerprint unlock is off. Enter your PIN.'],
  ['BIOMETRIC_UNLOCK_NOT_AVAILABLE', 32, 'No fingerprint set up'],
  ['MASK_AMOUNTS_CAPTION', 32, 'Or tap the net worth'],
  ['SCHEDULED_IMPACT_CAPTION', 24, 'Next 30 days, net'],
  ['ONB_ACCOUNT_NOTE', 90, 'The opening balance is where the account starts. Add other accounts later.'],
];

const copyRows = (rows) =>
  rows
    .map(
      ([key, ceiling, value]) =>
        `<div style="padding:6px 0;border-bottom:var(--hairline) solid var(--color-border)">${eyebrow(key, { style: 'display:block' })}<div style="display:flex;align-items:baseline;gap:8px;margin-top:2px"><span style="flex:1">${text(value, { size: 's' })}</span>${fig(`${[...value].length} / ${ceiling}`, { size: 'xs', tone: [...value].length > ceiling ? 'danger' : 'muted' })}</div></div>`,
    )
    .join('');

export const REVIEW = [
  {
    id: 'UI-COPY-BREVITY', area: 'Every screen', title: 'Copy that says it twice',
    why: 'Twelve of the 205 English strings run past the room of the slot they sit in: captions that repeat what the title or the control already says, errors that explain the app to itself, empty states that narrate. The first one found, "Scheduled transactions the day before, backup on Sundays", never shipped for that reason. Recommended: a ceiling per slot, one line at the default size, in every language: 24 characters beside a figure, 32 under a row, 48 in an empty state or a toast, 60 in a dialog, 90 where the product speaks (onboarding). The colophon keeps its voice, and the other onboarding lines already fit. ONB_ACCOUNT_NOTE also claims the opening balance is written as the first entry in the ledger, which it is not: it is the account's starting balance, so its rewrite says that. The twelve rewrites below are the same sentences with the second half cut, each shown with its length against its ceiling. Alternative: leave the long forms and shorten only what wraps at the largest text size, which keeps the voice and the length.',
    accept: 'Every caption, hint, toast and empty-state line fits the ceiling of its slot in the five languages, a dictionary test holds each class of key to its ceiling, and the twelve rewrites ship in English first and then in Spanish, Portuguese, French and German with the same ceilings.',
    now: frame(copyRows(COPY.map(([key, ceiling]) => [key, ceiling, L[key]]))),
    proposed: frame(copyRows(COPY)),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell" data-review="${id}" style="grid-column: 1 / -1"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px"><div style="grid-column:1 / -1"><b style="font:600 15px/1.3 var(--font-sans)">${esc(title)}</b><p class="kit-note" style="margin:4px 0 0">${esc(why)}</p><p class="kit-note" style="margin:4px 0 0"><b>Accept</b> · ${esc(accept)}</p></div><div><div class="kit-caption" style="margin-bottom:8px">Now</div><div style="overflow:auto">${now}</div></div><div><div class="kit-caption" style="margin-bottom:8px">Proposed</div><div style="overflow:auto">${proposed}</div></div></div></div>`).join('');
