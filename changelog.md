# Changelog

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
