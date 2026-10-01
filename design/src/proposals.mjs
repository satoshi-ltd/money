import { btn, esc, fig, icon, ICON, L, text } from './draw.mjs';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const monthGrid = ({ today, last, picked }) =>
  `<div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;row-gap:2px">${DAYS.map((d) => text(d, { size: 'xs', tone: 'muted', center: true })).join('')}<span></span>${Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const future = day > last;
    const chosen = day === picked;
    const style = chosen ? 'background:var(--color-accent);border-radius:4px;padding:8px 0' : `padding:8px 0${day === today ? ';border:var(--hairline) solid var(--color-border);border-radius:4px' : ''}`;
    return fig(`${day}`, { size: 'sm', tone: chosen ? 'onAccent' : future ? 'muted' : undefined, style: `${style}${future ? ';opacity:.4' : ''}` });
  }).join('')}</div>`;

const ownCalendar = () =>
  `<div class="m" style="width:320px;background:var(--color-background);padding:16px 20px 20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">${icon(ICON.BACK, { size: 's', tone: 'textMuted' })}${text('September 2026', { medium: true })}${icon(ICON.RIGHT, { size: 's', tone: 'textMuted' })}</div>${monthGrid({ today: 9, last: 9, picked: 4 })}<div style="display:flex;gap:8px;margin-top:16px">${btn(L.CANCEL, { variant: 'outlined', grow: true })}${btn(L.ACCEPT, { grow: true })}</div></div>`;

const systemCalendar = () =>
  `<div style="width:320px;font:400 13px/1.4 system-ui,sans-serif;background:#fff;color:#1c1b1f;border-radius:28px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.25)"><div style="background:#006a6a;color:#fff;padding:16px 20px"><div style="font-size:12px;opacity:.8">Select date</div><div style="font-size:28px">Wed, Sep 9</div></div><div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;padding:12px 12px 0;gap:6px">${DAYS.map((d) => `<span style="opacity:.6">${d}</span>`).join('')}<span></span>${Array.from({ length: 30 }, (_, i) => `<span style="padding:6px 0;${i + 1 === 4 ? 'background:#006a6a;color:#fff;border-radius:50%' : ''}">${i + 1}</span>`).join('')}</div><div style="display:flex;justify-content:flex-end;gap:24px;padding:12px 20px;color:#006a6a"><span>Cancel</span><span>OK</span></div></div>`;

export const REVIEW = [
  {
    id: 'CALENDAR-OWN', area: 'Transaction, Clone and Scheduled forms', title: 'A calendar drawn in the design system',
    why: "Parked by the creator: not now. The Android date picker is the system's Material dialog, a teal header and rounded white card in an app whose accent is gold, and it already broke inside a sheet. An own month grid looks the same on both platforms, names every day for a screen reader, follows the language's first weekday and can be tested. Recommended when picked up, because every entry carries a date.",
    accept: 'The Date row opens a month grid in the sheet on iOS and Android: hairlines, mono figures, the accent on the chosen day, Today outlined, days past the maximum dimmed and not tappable, the language\'s own month names and first weekday, every day announced by name; a test per rule; the system picker is gone.',
    now: systemCalendar(),
    proposed: ownCalendar(),
  },
];

export const reviewBoards = () =>
  REVIEW.map(({ id, area, title, why, accept, now, proposed }) => `<div class="kit-cell" data-review="${id}" style="grid-column: 1 / -1"><div class="kit-caption">${id} · ${esc(area)}</div><div class="kit-specimen" style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px"><div style="grid-column:1 / -1"><b style="font:600 15px/1.3 var(--font-sans)">${esc(title)}</b><p class="kit-note" style="margin:4px 0 0">${esc(why)}</p><p class="kit-note" style="margin:4px 0 0"><b>Accept</b> · ${esc(accept)}</p></div><div><div class="kit-caption" style="margin-bottom:8px">Now</div><div style="overflow:auto">${now}</div></div><div><div class="kit-caption" style="margin-bottom:8px">Proposed</div><div style="overflow:auto">${proposed}</div></div></div></div>`).join('');
