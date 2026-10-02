# Tesla Trivia Board

A static, client-side game board for the Tesla in-car browser. Grok hosts the game by voice and opens a new URL each turn; the page renders whatever state the query string describes. No backend.

## URL format

| Param | Meaning | Example |
|---|---|---|
| `st` | Screen: `ask`, `reveal`, `score`, `end` (inferred if omitted) | `ask` |
| `t` | Title / category | `Space` |
| `q` | Question | `Which planet has the most moons?` |
| `c` | Choices, pipe-separated (up to 6) | `Jupiter\|Saturn\|Uranus\|Neptune` |
| `a` | Correct answer: `1`–`4`, `A`–`D`, or the choice text | `B` |
| `n` / `of` | Question number / total | `3` / `10` |
| `p` | Players and scores | `Joe:200,Sam:100` |
| `r` | Who got it right, or `none` | `Sam` |

Examples:

```
/?st=ask&t=Space&n=3&of=10&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&p=Joe:200,Sam:100
/?st=reveal&t=Space&n=3&of=10&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&a=B&r=Sam&p=Joe:200,Sam:200
/?st=end&t=Space&p=Joe:300,Sam:500
```

Missing or malformed params degrade gracefully (bad scores become 0, unknown `st` is inferred, a question screen with no `q` falls back to the scoreboard).

## Prompt for Grok

> Host a 5-question multiple-choice trivia game about [topic] for [Joe and Sam]. For every question, open `https://YOUR-HOST/?st=ask&t=TOPIC&n=N&of=5&q=QUESTION&c=A|B|C|D&p=Joe:SCORE,Sam:SCORE` and read the question aloud. After someone answers, open the same URL with `st=reveal&a=LETTER&r=NAME` (or `r=none`) and updated scores. Each correct answer is worth 100. At the end open `?st=end&p=...`.

## Local preview

```sh
php -S 127.0.0.1:8765   # or: npx serve
```

## Things to verify in the car

1. Does re-opening a URL reuse the same tab, or stack new ones?
2. Does Grok keep the URL format and scores accurate over 10+ turns?
3. How long do URLs get before something truncates them?
