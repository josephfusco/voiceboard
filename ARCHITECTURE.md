# Architecture

Voiceboard splits responsibility three ways: the **voice assistant** runs the game, the **screen** shows it, and **WordPress** remembers what's worth remembering. Each layer works without the one after it.

## Who controls what

| Concern | Voice / URL (assistant) | Touch (on screen) | Why |
|---|---|---|---|
| Questions, answers, reveals | ✓ | | The assistant is the host; one source of truth for the game. |
| Scores and players | ✓ (`p=`, `add=`) | | Scoring follows the host's judgment, not taps. |
| Screen and game choice | ✓ (`g=`, `st=`) | ✓ (sidebar, home tiles) | Passengers can browse; the next URL always wins. |
| Timer, confetti | ✓ (`timer=`, `fx=`) | | Pacing is the host's call. |
| Theme (Tesla / Cyber) | ✓ (`theme=`) | ✓ (sidebar toggle) | A personal preference, remembered on the device. |
| Fullscreen | | ✓ | Browsers only allow it after a tap. |
| Answering by tapping | later | later | Needs a path back to the assistant (sessions, below). Until then, players answer out loud. |

**Rule:** touch never changes game state. It only changes what this screen is showing or how it looks. That keeps the assistant and the screen from disagreeing.

## Where state lives

| Data | Where | Lifetime | Native WordPress piece |
|---|---|---|---|
| The current screen | The URL | One page view | — |
| Roster, scores, theme, car ID, recent winners | `localStorage` in the car | Until reset or cleared | — (never leaves the device) |
| Who's connected right now | `wp_presence` table | ~150s TTL, refreshed by pings | [Presence API](https://github.com/WordPress/presence-api) feature plugin |
| Session transcript (names, scores, questions asked) | `voiceboard_session` custom post type: transcript in post content, latest snapshot in post meta | Pruned after 30 days by WP-Cron | Custom post types, post meta, WP-Cron |
| URL log + diagnostics (debugging) | Same session post, as meta | Same | Post meta |
| Assistant instructions | `llms.txt` in the plugin, served with the site's URL | Static | Plugin routing on `parse_request` |
| Tools for MCP-capable assistants | Registered abilities, exposed over MCP | Static | Abilities API + MCP Adapter |

**Do we need WordPress storage at all?** For playing, no: URL plus `localStorage` is a complete game. WordPress storage earns its place for three things a single browser can't do: letting the assistant *read back* the game (transcript), letting us *debug* what assistants actually send (log), and seeing *who's playing now* (presence).

Sessions use a custom post type rather than a new table because every session is a document with a title (its code), a body (the transcript), and metadata, which is exactly what posts are. That buys admin list screens, capabilities, the REST API, revisions-off storage, and export for free.

## Sessions and presence

1. The assistant invents a session code and adds it to every URL: `code=blue-otter` (not `s=`, which WordPress reserves for search).
2. On each page view the board posts a small snapshot to `POST /wp-json/voiceboard/v1/ping`: car ID, session code, app, screen, the raw query string, and parsing diagnostics.
3. WordPress appends a line to the session's transcript and, if the Presence API is active, calls `wp_set_presence( 'voiceboard/session/blue-otter', 'voiceboard-<carId>', $state )` and the same in a `voiceboard/cars` room. No ping for ~150s means the car is gone. A `pagehide` beacon removes it immediately.
4. The assistant (if it can read URLs) fetches `/board/session/blue-otter`, a plain-text summary of players, scores, and questions already asked.

Presence is optional. Without it, sessions and transcripts still work; you just lose "who's online now".

The car is identified by a random ID the board generates and keeps in `localStorage`, labelled by the server from the browser's User-Agent (e.g. Tesla firmware version). No IP addresses are stored.

## Assistant capability levels

| Level | Assistant can | Gets |
|---|---|---|
| 1 | Open a URL | The full game on screen |
| 2 | Also read a URL | The transcript: it never has to track scores |
| 3 | Call tools (MCP) | Abilities like `voiceboard/add-score`, `voiceboard/get-transcript`, `voiceboard/show-question`; the board follows along by polling its session |

Each level is additive; nothing at level 1 depends on levels 2 or 3.

## Status

| Piece | Status |
|---|---|
| URL-driven games, themes, effects, `localStorage` roster | Shipped |
| WordPress plugin, `llms.txt`, home redirect, CI deploy | Shipped |
| Sessions, transcript, log, presence | Designed (this document) |
| Abilities + MCP | Designed |
| Tap-to-answer | Later, after sessions |
