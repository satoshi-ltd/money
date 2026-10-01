# Changelog

## 3.0.95 — 2026-10-01

- The title of the new-account sheet is a phrase of its own in each language: "Nueva cuenta", "Nova conta", "Neues Konto" and "Nouveau compte", where joining the two words had read "Nuevo Cuenta", "Novo Conta" and "Neu Konto". The French first-account title says "Votre premier compte", not "première".

## 3.0.94 — 2026-10-01

- A long name in the bar of a pushed screen, such as an account called "Savings and travel money" on its transactions, shortens with an ellipsis instead of pushing the action buttons off the right edge.

## 3.0.93 — 2026-10-01

- The net on a day's header in a transaction list is priced like the rows under it, each at the rate of its own month. It used today's rate, so on a day in a past month the header and the rows disagreed when a rate had moved since.

## 3.0.92 — 2026-10-01

- Rates are filed under the month on your clock, the one your entries are read in. Away from UTC an entry made in the first or last hours of a month could be priced from the neighbouring month's table, a day off; now the table of today is the table of that month wherever you are.

## 3.0.91 — 2026-10-01

- On the open Fold the tab bar and the seal give way to a side rail: the wordmark, the four tabs as words and New at the foot, with the screen filling the width beside it instead of a centred column of 480 points. A phone, or the folded Fold, keeps its bar; the layout follows the window as the device folds and unfolds. Pushed screens and sheets keep their column.

## 3.0.90 — 2026-10-01

- Fifteen colours instead of twenty. Five roles that nothing needed are gone: two never used (success, warning) and three that were another role renamed (inverse is the text colour, the ink written on it is the background, the ink on a soft accent is the text colour). No screen changes except the text on the soft accent surfaces (the backup nudge and the suggestion chip), a shade darker in light mode.

## 3.0.89 — 2026-10-01

- The days of the calendar are bigger targets: 48 points high and a seventh of the sheet wide (they were 40 high with a gap between them), so a thumb lands on the day it means.

## 3.0.88 — 2026-10-01

- Analytics says one thing beside each category bar: its share of the month. A budgeted category no longer swaps that for "of 300" or "+21"; its bar still runs to the limit, turns danger and reddens the amount when passed, and the budget's own figures stay in the category sheet. Neither the list nor the sheet turns its bar accent at four fifths any more: ink up to the limit, danger past it.

## 3.0.87 — 2026-10-01

- The account sheet dresses like the others: its title is the account's name (a long one gives way to the close button), the "Details" heading and the Cancel button are gone, and the close button leaves the sheet.

## 3.0.86 — 2026-10-01

- One calendar, drawn by Môney on iOS and Android. The Date row of a transaction, a clone and a scheduled transaction opens a month in the sheet: hairlines, mono figures, the accent on the chosen day, today outlined, days past the limit dimmed and not tappable, the month in your language and the week opening on Monday (Sunday in English). Pick a day, then Accept; Cancel leaves the date as it was.
- Every day is announced by its full name to a screen reader, and the arrows name the month they go to.
- A picked day keeps the time of the entry, and never lands in the future.

## 3.0.85 — 2026-10-01

- The Android calendar answers taps. The date of a transaction, a clone and a scheduled transaction opens the system calendar on its own instead of inside one of our sheets, where it floated dimmed and ignored every tap. iOS keeps the inline calendar in the sheet.

## 3.0.84 — 2026-10-01

- Shorter copy. Twelve captions, errors and empty states said their point twice or explained the app to itself ("Unable to fetch updated currency rates. Please check your internet connection."); they now say it once ("Couldn't update rates. Check your connection."), in the five languages, each within the room of its slot (a line that already fit kept its words). The onboarding note no longer claims the opening balance is written as the first entry in the ledger: it is where the account starts.

## 3.0.83 — 2026-10-01

- Soft budgets. An expense category gets a monthly limit from its sheet; the month block says what is left of the limits and how many categories are over, and Analytics draws each budgeted category against its limit (ink while within, accent from 80%, danger past it with the excess beside). What was left of a limit last month rides into the next, and nothing ever blocks an entry. Alerts are not part of this.

## 3.0.82 — 2026-10-01

- An account can be one you owe. The opening balance accepts a minus, so a credit card or a loan starts below zero; Accounts and the Overview name it "Owed" beside its title, Accounts splits the net worth into what you hold and what you owe once there is a debt, the distribution bar draws only what you hold, and paying a card down now reads as a rise in the month's delta instead of a fall.

## 3.0.81 — 2026-10-01

- The reminders have an hour of their own. Settings gets a "Reminder time" row under the backup switch, from 06:00 to 22:00, that moves both the scheduled-transaction reminders (the day before) and the weekly backup reminder, which were fixed at 08:00. The backup row reads the chosen hour, and the choice travels in a backup.

## 3.0.80 — 2026-10-01

- A title you only ever filed as the other type is offered too. Typing "sal" on Expense used to offer nothing because Salary only exists as an income; it now appears marked with "Income" and its signed amount when the current type has no proposal, and a tap fills the entry and switches the type.

## 3.0.79 — 2026-10-01

- The "Hide from Analytics" checkbox says what it does: "Hide from Analytics and the month", and the same in the other four languages, because it also keeps the entry out of the Overview month. The label wraps beside its box at large text instead of pushing it off.

## 3.0.78 — 2026-10-01

- The months on the charts read as months in every language. They were the first three letters of the name, so German drew "mär" and French drew "jui" for both juin and juillet; each language now has its own short months ("juin", "juil.", "märz").

## 3.0.77 — 2026-09-30

- The backup reminder row reads "Weekly · Sun 08:00" with a middle dot, like every other caption, instead of a hyphen.

## 3.0.76 — 2026-09-30

- The date sheet takes its backdrop and its handle from the theme, like the confirm dialog: the same overlay, darker in dark mode, and a fully rounded handle.

## 3.0.75 — 2026-09-30

- Accounts shows a Total only under a currency filter. Under All it was the net worth again, to the cent, two hundred points under the net worth at the top.
- A currency filter no longer outlives its last account: delete the last USD account and Accounts returns to All instead of showing an empty list.

## 3.0.74 — 2026-09-30

- The suggestion chip is easier to hit. It was 24 points tall and dismisses on a tap; it is now 32 points with a touch area that reaches 44, and every pressable chip gets the same reach.

## 3.0.73 — 2026-09-30

- Masking amounts has a switch. Until now the only way was a tap on the net-worth figure, with nothing to say so and nothing to show the state; Preferences now has "Mask amounts", and the tap on the figure still works.

## 3.0.72 — 2026-09-30

- Scheduled adds with the same icon button as Accounts. Its bar carried an outlined button with a plus; now every bar that adds looks alike, and the round seal stays for adding a transaction.
- The lock dialog's button says "Lock" instead of "Accept".

## 3.0.71 — 2026-09-30

- "Log out" becomes "Lock". The row takes you back to the PIN screen and nothing more, since there is no account to leave; the dialog says so: "Lock Môney?" and "You will be asked for your PIN." The same in the other four languages.

## 3.0.70 — 2026-09-30

- Settings reads in sentence case like the rest of the app: "Update rates", "Back up data", "Restore data", "Base currency", "Backup reminder", "Privacy policy", and the backup reminder notification. The other four languages already did.

## 3.0.69 — 2026-09-30

- The open Fold keeps a column. Lists, forms, the top bar, the charts and the PIN keypad stop at 480 points and sit centred, instead of stretching across the whole window. Phones are narrower than that and look the same.

## 3.0.68 — 2026-09-30

- A proposal is one full-width row. Each offer under the concept field sat in a field row with an empty label, so it read as a value with no key; it is now the title with its account and category under it and the amount in the accent at the right.

## 3.0.67 — 2026-09-30

- The swing says which way it went. "Swing −208.11 · Personal" is the category's spend minus its usual, which the figure alone never said; the line now reads "Personal, less than usual". The caption takes the room the figure leaves, and a long category name shortens before the direction does.

## 3.0.66 — 2026-09-30

- The month block's Scheduled line opens Scheduled. It named the pending schedules and led nowhere; Scheduled was two levels away, through Settings. The line now reads "See all N" with a chevron and is a button.
- "See all 4" in each language's own order: "Voir les 4", "Alle 4 ansehen". The accounts heading and the category sheet say it the same way.

## 3.0.65 — 2026-09-30

- Say what Analytics is waiting for. Under two months of history the charts drew a window padded with empty months, a line rising out of nothing that said nothing about why; the screen now says "Nothing to chart yet", that two months of entries draw the first line, and offers the first entry.

## 3.0.64 — 2026-09-30

- Keep translated nouns in their own case. The month captions under the net worth and an account's balance, and the account count in the hero, were lowercased in code; German capitalises its nouns, so "Dieser Monat" and "Konten" shipped as "dieser monat" and "konten". Each caption is now its own phrase in every language, a single account reads "1 account" instead of "1 accounts", and the form's Save button is one phrase in each language's own order ("Ausgabe speichern", not "Speichern ausgabe").

## 3.0.63 — 2026-09-30

- Name every control for VoiceOver and TalkBack. Nothing in the app carried an accessibility label or role, so the masthead's search, the add seal, the PIN keys, the suggestion chip, the tabs and the Settings rows were all read as a bare "button", and the two switches in Settings could not be flipped with VoiceOver at all. Each control now says what it is and does, in the app's language, with its state where it has one; a toggle row is the switch, so tapping anywhere on it flips it; a slot with nothing behind it is skipped.

## 3.0.62 — 2026-09-30

- Open a category's "See all" on that category. The eyebrow counted the category's entries of the month and then opened an empty Transactions panel; it now opens Transactions filtered to that category and month, across accounts, titled after both, and the count is exactly what the panel lists.

## 3.0.61 — 2026-09-21

- Read the current month's rates from the file dated today, falling back to yesterday and the day before, and treat a download that misses it as no download at all. Two things went wrong at once: a sync could come back with an older month and without the current one, stamp itself as fresh and report success; and the CDN in front of the feed held the `latest` alias seven days behind and served it with a clean 200. Either way every balance was valued at a stale close: 7.04 BTC read 545,901 dollars at the 14th's 77,542 while the day stood at 81,240. Dated files are immutable, so no cache can age them, and the current month now has to answer before anything else is kept; otherwise the app keeps what it had, leaves the last-update date alone, and says so.
- Keep Save available whenever the fields are complete. Whether a transaction could be saved was a flag the form set as you typed, and the screen moved the form without touching it: choosing another account or switching between expense and income put the default category back but left the flag false, and a cloned transaction whose only change was the account could never be saved. The screens now read completeness from the fields themselves.
- Start Metro the way the sibling apps do, `expo start --dev-client --scheme money`, so pressing `a` opens the development client by its own scheme instead of the derived `exp+` one.

## 3.0.60 — 2026-09-20

- Set the fingerprint key on the lock screen in the same ink as the digits beside it. It was drawn in the accent, which read as a warning rather than as one more key on the keypad.
- Switch the backup reminder the same way as the unlock preference. Two settings you turn on and off sat on the same screen, one as a switch and the other as the word On, and only one of them looked like something you could touch.

## 3.0.59 — 2026-09-20

- Size the category sheet's date, count and amount columns from their text instead of a fixed width, and let the row grow, so a large amount no longer breaks onto a second line.
- Name the reader the way the phone does: Face ID or Touch ID on an iPhone, face or fingerprint elsewhere.
- Stop the development fallback from unlocking on its own. Without a real reader there is no prompt to answer, so it now waits for the key on the keypad instead of opening the ledger silently.

## 3.0.58 — 2026-09-20

- Break Settings apart: everything used to sit under Preferences. Appearance is now its own group holding the theme and the text size, as in the sibling apps, Preferences keeps language, currency, scheduled transactions and the backup reminder, and the lock gets a group of its own.
- Name the unlock row after the reader the phone actually has, Face ID or fingerprint, and give the lock screen key the matching glyph. The row no longer explains where the PIN is kept.

## 3.0.57 — 2026-09-19

- Unlock with a fingerprint instead of typing the PIN. Turning it on in Settings stores the PIN on this phone behind the reader, in the keychain, and the lock screen asks for it on arrival and from the key that now fills the empty slot on the keypad. A weak biometric is refused, because it cannot gate the keychain. Wiping the ledger forgets the stored PIN, and neither the PIN nor this preference travels in a backup.

## 3.0.56 — 2026-09-16

- Add a text size preference to Settings, beside Appearance, with four steps from Small to Largest. It multiplies the whole type ramp, copy and figures alike, and reaches the amount fields, chips and the masthead as well as body text. The choice is stored with the other preferences and pulled back onto a known step when a backup carries anything else.

## 3.0.55 — 2026-09-15

- Build the Android app on this machine with `eas build --local`, keeping the signing keystore in EAS: `yarn build:local:prod` writes a signed APK to `release-assets/`, and `yarn build:local:dev` compiles the development client, boots the emulator and installs it. `yarn check:release` refuses a build whose manifests disagree.
- Size the time, percentage and month-flow columns from their text instead of a fixed width, so a large system font no longer wraps the clock onto a second line.
