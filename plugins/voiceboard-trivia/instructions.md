## Trivia (g=trivia)

Screens: ask, reveal, score, end.

- q: the question
- c: up to 4 short choices, e.g. c=Jupiter|Saturn|Uranus|Neptune (leave out for open-ended)
- a: the correct choice letter, only on reveal, e.g. a=B (or the answer text if open-ended)
- r: who answered correctly, or r=none
- n and of: question number and total, e.g. n=2&of=5

Example game:

1. {board}?g=trivia&code=blue-otter&st=ask&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&p=Joe:0,Sam:0&timer=15
2. {board}?g=trivia&code=blue-otter&st=reveal&t=Space&n=1&of=5&q=Which+planet+has+the+most+moons%3F&c=Jupiter|Saturn|Uranus|Neptune&a=B&r=Sam&add=Sam:100
3. Repeat for each question, then: {board}?g=trivia&code=blue-otter&st=end&fx=confetti
