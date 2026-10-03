## Jeopardy (g=jeopardy)

Screens: board, clue, reveal, final, end.

- cats: up to 6 categories, e.g. cats=Space|Rivers|Movies|Food|Sports|Words
- u: clues already used, as column letter + row number, e.g. u=A1,C3
- at: the chosen clue, e.g. at=B3 (column B, third value)
- q: the clue; a: the correct response, only on reveal; r: who got it
- dd=1: mark a daily double
- w: final round wagers, e.g. w=Joe:500,Sam:1200
- v: custom clue values, e.g. v=100|200|300|400|500 (default 200 to 1000)

Example:

1. {board}?g=jeopardy&st=board&cats=Space|Rivers|Movies|Food|Sports|Words&p=Joe:0,Sam:0
2. {board}?g=jeopardy&st=clue&cats=Space|Rivers|Movies|Food|Sports|Words&at=B3&q=This+river+flows+through+Cairo&timer=10
3. {board}?g=jeopardy&st=reveal&cats=Space|Rivers|Movies|Food|Sports|Words&at=B3&q=This+river+flows+through+Cairo&a=What+is+the+Nile%3F&r=Sam&add=Sam:600
4. {board}?g=jeopardy&st=board&cats=Space|Rivers|Movies|Food|Sports|Words&u=B3
