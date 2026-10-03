# Decision log

A running list of decisions. Checked items are decided; unchecked items are open. Add new entries at the bottom of each section and keep the reasoning to one line.

## Product

- [x] The voice assistant hosts; the screen only shows state. One URL per screen.
- [x] Assistant-neutral: no assistant is named in the UI. Grok is one example.
- [x] Any language: content comes from the assistant as-is; board labels in nine languages, RTL for Arabic and Hebrew.
- [x] Names are set once (`p=`); after that the host sends only changes (`add=`, `up=`).
- [x] Turns: `st=next&up=Name` announces the player; their "ready" makes the host open the question with `timer=`, so question and countdown appear together.
- [x] Up to 6 players.
- [ ] Tap-to-answer, once taps can reach the assistant.
- [ ] More games: road trip bingo, drawing, blur-to-reveal.

## Interaction

- [x] Touch never changes the game the assistant runs. It can browse, switch theme, and clear this device's players (with a confirmation).
- [x] The next URL always wins over anything stored.
- [x] Theme and language are device preferences, settable by URL or (theme) by touch.

## Data

- [x] Four stores: URL (screen), localStorage (roster, history, preferences, car ID), WordPress (sessions, URL log), Presence (who's connected).
- [x] localStorage, not cookies, so nothing extra reaches the server or breaks page caching.
- [x] Sessions are a custom post type (`voiceboard_session`), not a new table.
- [x] No IP addresses stored; rate limiting uses a short-lived hashed key per car.
- [x] Sessions deleted after 30 days.
- [x] Session codes use `code=`, because WordPress reserves `s=`.
- [x] Board parameters may overlap WordPress query vars only for `p` and `w` (never numeric on the board). Enforced by a test.
- [x] Keep URLs under 2,000 characters; the live server rejects about 10,000 and up.

## Platform

- [x] WordPress plugin, routing on `parse_request`; no rewrite rules.
- [x] Assistant instructions live in one file, `llms.txt`, served at `/llms.txt` and embedded in the board HTML.
- [x] The home page redirects to the board but leaves WordPress URLs (`?p=`, `?s=`, previews) alone.
- [x] Presence API is optional; without it, only "who's online" goes away.
- [x] Abilities are read-only for now (instructions, build URL, transcript).
- [ ] Writable abilities (add score, show question) with the board polling its session.
- [ ] Install the MCP Adapter on the live site.

## Design

- [x] Tesla-like default theme following light/dark; Cyber as the alternate.
- [x] Site theme is a theme.json child of Twenty Twenty-Five, dark, deployed with the plugin.
- [x] Inspired by in-car interfaces; no carmaker fonts or logos.
- [ ] Replace hand-drawn icons with a consistent open set (Lucide proposed).

## Process

- [x] Push to `main` runs Playwright against static files, the plugin at `/board/`, and the plugin at the site root; only a green run deploys.
- [x] Release-please with conventional commits.
- [x] Issue labels follow WordPress/presence-api.
- [x] No attribution trailers in commits or PRs.
- [x] Tests keep `llms.txt` and the README in sync with the code.
- [x] Decisions are recorded here, not in PR descriptions.
- [ ] Rewrite early history to remove attribution trailers (needs the owner to force-push).
