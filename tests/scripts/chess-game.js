// A whole chess game, starting from what people say in the car. Used by the end-to-end test and the demo video.
// The game is Légal's mate (1755): seven moves, a queen sacrifice, and a knight checkmate.
export const VOICE_SCRIPT = [
	{ speaker: 'Driver', says: 'Hey, open voiceboardgames.com and host chess for Joe and Sam. Joe is white.' },
	{ speaker: 'Joe', says: 'Pawn to e4' },
	{ speaker: 'Sam', says: 'Pawn to e5' },
	{ speaker: 'Joe', says: 'Knight to f3' },
	{ speaker: 'Sam', says: 'Pawn to d6' },
	{ speaker: 'Joe', says: 'Bishop to c4' },
	{ speaker: 'Sam', says: 'Bishop to g4' },
	{ speaker: 'Joe', says: 'Knight to c3' },
	{ speaker: 'Sam', says: 'Pawn to g6' },
	{ speaker: 'Joe', says: 'Knight takes e5' },
	{ speaker: 'Sam', says: 'Bishop takes d1. I got your queen!' },
	{ speaker: 'Joe', says: 'Bishop takes f7, check' },
	{ speaker: 'Sam', says: 'King to e7' },
	{ speaker: 'Joe', says: 'Knight to d5. Checkmate!' },
];

/**
 * A mock assistant: what we expect a real voice assistant to do with each line. It sets up the game,
 * then appends each spoken move to the move list and opens the new URL. It passes spoken moves through
 * as-is (comma-separated) to exercise the board's speech helper.
 */
export const mockAssistant = (code = 'demo-chess') => {
	const moves = [];
	let players = '';
	return ({ speaker, says }) => {
		const setup = says.match(/host chess for (\w+) and (\w+)/i);
		if (setup) {
			players = `${setup[1]}:0,${setup[2]}:0`;
		} else {
			moves.push(says.split(/[.!]/)[0].replace(/,/g, '').trim()); // commas separate moves
		}
		const params = new URLSearchParams({ g: 'chess', code, p: players });
		if (moves.length) params.set('mv', moves.join(','));
		return `?${params}`;
	};
};
