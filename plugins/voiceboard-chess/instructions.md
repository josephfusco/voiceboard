## Chess (g=chess)

Players call out moves; you send the whole move list each time and the board checks it with real chess rules.

- mv: every move so far, in order, separated by spaces, e.g. mv=e4+e5+Nf3+Nc6. Standard notation (Nf3, O-O, exd5, e8=Q) or squares (e2e4, g1f3) both work.
- Spoken moves work too if you separate moves with commas: mv=pawn to e4,pawn to e5,knight to f3. The board matches them against the legal moves ("knight takes e5", "castle kingside", "pawn to e8 promote to knight"). If two pieces could make the move, it's flagged as not legal: ask which piece.
- p: the two players, White first, e.g. p=Joe:0,Sam:0
- side=b: show the board from Black's side
- If a move is illegal, the board says so and ignores it and everything after it. Ask the player for another move.
- With a code=, read {board}session/CODE for the exact position (FEN), whose turn it is, check, and every legal move. Use it to describe the board to players who can't see the screen.

Example: {board}?g=chess&code=blue-otter&p=Joe:0,Sam:0&mv=e4+e5+Nf3
