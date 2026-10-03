# Architecture

The voice assistant runs the game, the screen shows it, and WordPress keeps the few things a single browser can't. Each layer works without the one after it.

## Who controls what

| Concern | Voice / URL (assistant) | Touch (on screen) | Why |
|---|---|---|---|
| Questions, answers, reveals | ✓ | | The assistant is the host and the one source of truth for the game. |
| Scores and players | ✓ (`p=`, `add=`) | | Scoring follows the host's judgment. |
| Screen and game choice | ✓ (`g=`, `st=`) | ✓ (sidebar, home tiles) | Passengers can browse, and the next URL always wins. |
| Timer, confetti | ✓ (`timer=`, `fx=`) | | Pacing is the host's call. |
| Theme (Tesla / Cyber) | ✓ (`theme=`) | ✓ (sidebar toggle) | A personal preference, remembered on the device. |
| Language | ✓ (`lang=`) | | Matches the conversation; applies per URL, otherwise the browser's language. |
| Clearing this device's players | ✓ (`reset=1`) | ✓ (New game, with confirmation) | Starting over is the passengers' call too; the next `p=` still sets the roster. |
| Fullscreen | | ✓ | Browsers allow it only after a tap. |
| Answering by tapping | later | later | Needs a path back to the assistant (see sessions). Until then, players answer out loud. |

Touch never changes the game the assistant is running; it changes what this screen shows, how it looks, or (after a confirmation) what this device remembers, so the assistant and the screen can't disagree.

## Where state lives

| Data | Where | Lifetime | WordPress piece |
|---|---|---|---|
| The current screen | The URL | One page view | None |
| Roster, scores, recent winners, theme | `localStorage` on the device | Until reset or cleared | None; it never leaves the device |
| Who's connected right now | `wp_presence` table | About 150 seconds, refreshed by pings | [Presence API](https://github.com/WordPress/presence-api) feature plugin |
| Session transcript (names, scores, questions asked) | `voiceboard_session` custom post type: transcript in post content, latest snapshot in post meta | Pruned after 30 days by WP-Cron | Custom post types, post meta, WP-Cron |
| URL log and parsing diagnostics | The same session post, as meta | Same | Post meta |
| Assistant instructions | `llms.txt` in the plugin, served with the site's URL | Static | Plugin routing on `parse_request` |
| Tools for MCP-capable assistants | Registered abilities, exposed over MCP | Static | Abilities API and MCP Adapter |

The URL and `localStorage` are a complete game. WordPress storage is for three things one browser can't do: let the assistant read the game back (transcript), show us what assistants really send (log), and show who is playing now (presence).

A session is a document with a title (its code), a body (the transcript), and metadata, which is what a post is, so sessions use a custom post type instead of a new table and get admin screens, capabilities, REST access, and export with it.

## Sessions and presence

1. The assistant invents a session code and adds it to every URL as `code=blue-otter`. (`s=` is taken: WordPress uses it for search.)
2. On each page view the board posts a small snapshot to `POST /wp-json/voiceboard/v1/ping` with its car ID, the session code, app, screen, raw query string, and parsing diagnostics.
3. WordPress appends a line to the session transcript. If the Presence API is active, it also calls `wp_set_presence( 'voiceboard/session/blue-otter', 'voiceboard-<carId>', $state )` and does the same in a `voiceboard/cars` room. A car that stops pinging for about 150 seconds expires, and a `pagehide` beacon removes it right away.
4. An assistant that can read URLs fetches `/board/session/blue-otter`, a plain-text summary of players, scores, and questions already asked.

Presence is optional; without it, sessions and transcripts still work and only "who's online now" goes away.

Each board identifies itself with a random car ID kept in `localStorage`, labelled by the server from the browser's User-Agent (for example, a Tesla firmware version). No IP addresses are stored.

## Assistant capability levels

| Level | Assistant can | Gets |
|---|---|---|
| 1 | Open a URL | The full game on screen |
| 2 | Also read a URL | The transcript, so it never has to track scores |
| 3 | Call tools (MCP) | Abilities like `voiceboard/add-score`, `voiceboard/get-transcript`, and `voiceboard/show-question`, with the board following along by polling its session |

Each level adds to the one before, and nothing at level 1 depends on levels 2 or 3.

## Status

| Piece | Status |
|---|---|
| URL-driven games, themes, effects, `localStorage` roster | Shipped |
| Board labels in nine languages, right-to-left layout | Shipped |
| WordPress plugin, `llms.txt`, home redirect, CI deploy | Shipped |
| Sessions, transcript, URL log, car ID, presence | Shipped |
| Turns (`st=next`, `up=`) | Shipped |
| Read-only abilities | Shipped; MCP Adapter not yet installed on the live site |
| Writable abilities with board polling | Designed |
| Tap-to-answer | Later, after sessions |
