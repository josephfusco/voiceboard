// Chess by voice. The move list lives in the URL (mv=e4 e5 Nf3), the board replays it with real rules, and the
// session transcript gives the assistant the exact position and the legal moves, so it never loses track.
// A Voiceboard module; see plugins/README.md.
import { addStrings, apps, h, header, sharedScreens, t } from 'voiceboard';
import { Chess } from './vendor/chess.js';

// Modules can bring their own styles.
document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: new URL(`./chess.css${new URL(import.meta.url).search}`, import.meta.url).href }));

const L = (title, description, phrase, white, black, toMove, check, mate, stalemate, draw, illegal, moveN) =>
	({ 'chess.title': title, 'chess.description': description, 'chess.phrase': phrase, 'chess.white': white, 'chess.black': black, 'chess.toMove': toMove, 'chess.check': check, 'chess.mate': mate, 'chess.stalemate': stalemate, 'chess.draw': draw, 'chess.illegal': illegal, 'chess.moveN': moveN });
addStrings({
	en: L('Chess', 'Play chess by voice. The board checks every move.', 'host a game of chess', 'White', 'Black', '{side} to move', 'Check!', 'Checkmate. {name} wins!', 'Stalemate', 'Draw', 'Not a legal move: {move}', 'Move {n}'),
	es: L('Ajedrez', 'Juega al ajedrez por voz. El tablero comprueba cada jugada.', 'presenta una partida de ajedrez', 'Blancas', 'Negras', 'Juegan {side}', '¡Jaque!', 'Jaque mate. ¡{name} gana!', 'Ahogado', 'Tablas', 'Jugada no válida: {move}', 'Jugada {n}'),
	fr: L('Échecs', "Jouez aux échecs à la voix. L'échiquier vérifie chaque coup.", "anime une partie d'échecs", 'Blancs', 'Noirs', 'Trait aux {side}', 'Échec !', 'Échec et mat. {name} gagne !', 'Pat', 'Nulle', 'Coup illégal : {move}', 'Coup {n}'),
	de: L('Schach', 'Schach per Stimme spielen. Das Brett prüft jeden Zug.', 'moderiere eine Partie Schach', 'Weiß', 'Schwarz', '{side} am Zug', 'Schach!', 'Schachmatt. {name} gewinnt!', 'Patt', 'Remis', 'Kein gültiger Zug: {move}', 'Zug {n}'),
	pt: L('Xadrez', 'Jogue xadrez por voz. O tabuleiro confere cada lance.', 'apresente uma partida de xadrez', 'Brancas', 'Pretas', 'Vez das {side}', 'Xeque!', 'Xeque-mate. {name} venceu!', 'Afogamento', 'Empate', 'Lance inválido: {move}', 'Lance {n}'),
	ja: L('チェス', '声でチェス。盤面がすべての手をチェックします。', 'チェスの対局を進行して', '白', '黒', '{side}の手番', 'チェック！', 'チェックメイト。{name}さんの勝ち！', 'ステイルメイト', '引き分け', '不正な手: {move}', '{n}手目'),
	zh: L('国际象棋', '用语音下国际象棋，棋盘会检查每一步。', '主持一局国际象棋', '白方', '黑方', '轮到{side}', '将军！', '将死。{name}获胜！', '逼和', '和棋', '不合法的走法：{move}', '第{n}步'),
	ar: L('شطرنج', 'العب الشطرنج بالصوت. تتحقق الرقعة من كل نقلة.', 'قدّم مباراة شطرنج', 'الأبيض', 'الأسود', 'دور {side}', 'كش!', 'كش مات. فاز {name}!', 'تعادل بالجمود', 'تعادل', 'نقلة غير قانونية: {move}', 'النقلة {n}'),
	he: L('שחמט', 'משחקים שחמט בקול. הלוח בודק כל מהלך.', 'להנחות משחק שחמט', 'לבן', 'שחור', 'תור: {side}', 'שח!', 'מט. הניצחון של {name}!', 'פט', 'תיקו', 'מהלך לא חוקי: {move}', 'מהלך {n}'),
});

// Undo, corrections, and game endings.
addStrings({
	en: { 'chess.undid': "Undid {moves}", 'chess.changed': "Changed {from} to {to}", 'chess.wins': "{name} wins!", 'chess.drawAgreed': "Draw agreed" },
	es: { 'chess.undid': "Deshecho: {moves}", 'chess.changed': "Cambiado {from} por {to}", 'chess.wins': "¡{name} gana!", 'chess.drawAgreed': "Tablas acordadas" },
	fr: { 'chess.undid': "Annulé : {moves}", 'chess.changed': "{from} remplacé par {to}", 'chess.wins': "{name} gagne !", 'chess.drawAgreed': "Nulle par accord" },
	de: { 'chess.undid': "Rückgängig: {moves}", 'chess.changed': "{from} geändert zu {to}", 'chess.wins': "{name} gewinnt!", 'chess.drawAgreed': "Remis vereinbart" },
	pt: { 'chess.undid': "Desfeito: {moves}", 'chess.changed': "{from} trocado por {to}", 'chess.wins': "{name} venceu!", 'chess.drawAgreed': "Empate acordado" },
	ja: { 'chess.undid': "取り消し: {moves}", 'chess.changed': "{from} を {to} に変更", 'chess.wins': "{name}さんの勝ち！", 'chess.drawAgreed': "合意により引き分け" },
	zh: { 'chess.undid': "已撤销：{moves}", 'chess.changed': "已将{from}改为{to}", 'chess.wins': "{name}获胜！", 'chess.drawAgreed': "双方同意和棋" },
	ar: { 'chess.undid': "تم التراجع عن {moves}", 'chess.changed': "تم تغيير {from} إلى {to}", 'chess.wins': "فاز {name}!", 'chess.drawAgreed': "تعادل بالاتفاق" },
	he: { 'chess.undid': "בוטל: {moves}", 'chess.changed': "{from} הוחלף ב{to}", 'chess.wins': "הניצחון של {name}!", 'chess.drawAgreed': "תיקו בהסכמה" },
});

// Filled glyphs for both sides, colored by CSS, read more clearly at a glance than outlined ones.
const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const PIECE = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };

// Moves are separated by commas, or by spaces when every word is already a move ("e4 e5 Nf3").
// Anything else is one spoken move ("knight to f3").
const NOTATION = /^([KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?|O-O(-O)?|[a-h][1-8][a-h][1-8][qrbn]?)[+#]?$/;
const moveList = (v) => {
	const words = v.split(/\s+/).filter(Boolean);
	const list = v.includes(',') ? v.split(',') : words.every((word) => NOTATION.test(word)) ? words : [v];
	return list.map((s) => s.trim()).filter(Boolean).slice(0, 600);
};

const PIECES_SPOKEN = { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', horse: 'n', pawn: 'p' };

// Turns a spoken move ("knight takes e5", "castle queenside", "pawn to e8 promote to knight") into standard
// notation by matching it against the legal moves. Ambiguous or impossible moves come back unchanged and fail.
const fromSpeech = (text, game) => {
	const words = text.toLowerCase().replace(/checkmate|check|[!?+#]/g, ' ');
	if (/castl/.test(words)) return /queen|long/.test(words) ? 'O-O-O' : 'O-O';
	const squares = words.match(/[a-h][1-8]/g) ?? [];
	const piece = Object.entries(PIECES_SPOKEN).find(([word]) => new RegExp(`\\b${word}\\b`).test(words.replace(/promot\w*.*/, '')))?.[1];
	const promotion = PIECES_SPOKEN[words.match(/promot\w*\s*(?:to\s*)?(queen|rook|bishop|knight)/)?.[1]];
	const candidates = game.moves({ verbose: true }).filter((m) =>
		m.to === squares.at(-1)
		&& (!piece || m.piece === piece)
		&& (squares.length < 2 || m.from === squares[0])
		&& (!m.promotion || m.promotion === (promotion ?? 'q')));
	return candidates.length === 1 ? candidates[0].san : text;
};

// Replays the moves, stopping at the first one that isn't legal.
const replay = (moves) => {
	const game = new Chess();
	for (const [i, move] of moves.entries()) {
		try {
			game.move(move);
		} catch {
			try {
				game.move(fromSpeech(move, game));
			} catch {
				return { game, illegal: move, at: i + 1 };
			}
		}
	}
	return { game };
};

// What changed since the last screen in this tab: an undo (moves removed) or a correction (the last
// moves replaced). Plain additions are just moves. A big jump backward is a new game, not an undo.
const lastChange = (code, moves) => {
	const key = `voiceboard-chess:${code || 'local'}`;
	let before = [];
	try {
		before = JSON.parse(sessionStorage.getItem(key)) ?? [];
		sessionStorage.setItem(key, JSON.stringify(moves));
	} catch {
		return null;
	}
	let same = 0;
	while (same < before.length && same < moves.length && before[same] === moves[same]) same++;
	const removed = before.slice(same);
	return removed.length && removed.length <= 3 ? { removed, added: moves.slice(same) } : null;
};

const sideName = (color) => t(color === 'w' ? 'chess.white' : 'chess.black');

const player = (p, color) => p[color === 'w' ? 0 : 1]?.name ?? sideName(color);

// result= uses chess notation: 1-0 (White wins, e.g. Black resigned), 0-1, or 1/2 (draw agreed).
const result = (v) => {
	const value = v.replace(/\s/g, '').toLowerCase();
	if (value === '1-0' || value === '0-1') return value;
	return /^(1\/2|½|draw)/.test(value) ? 'draw' : '';
};

const status = ({ chess: { game }, p, result: outcome }) => {
	if (outcome === 'draw') return t('chess.drawAgreed');
	if (outcome) return t('chess.wins', { name: player(p, outcome === '1-0' ? 'w' : 'b') });
	const winner = player(p, game.turn() === 'w' ? 'b' : 'w');
	if (game.isCheckmate()) return t('chess.mate', { name: winner });
	if (game.isStalemate()) return t('chess.stalemate');
	if (game.isDraw()) return t('chess.draw');
	return game.inCheck() ? t('chess.check') : t('chess.toMove', { side: sideName(game.turn()) });
};

const boardView = ({ chess: { game }, side }) => {
	const last = game.history({ verbose: true }).at(-1);
	const rows = game.board();
	const order = side === 'b' ? [...rows].reverse().map((row) => [...row].reverse()) : rows;
	const files = side === 'b' ? 'hgfedcba' : 'abcdefgh';
	const grid = h('div', 'chess-board');
	grid.setAttribute('role', 'grid');
	grid.setAttribute('aria-label', 'Chess board');
	order.forEach((row, r) => row.forEach((piece, c) => {
		const square = files[c] + (side === 'b' ? r + 1 : 8 - r);
		const light = (('abcdefgh'.indexOf(square[0]) + Number(square[1])) % 2) === 1;
		const check = piece?.type === 'k' && piece.color === game.turn() && game.inCheck();
		const cell = h('div', `sq ${light ? 'light' : 'dark'}${last && (square === last.from || square === last.to) ? ' last' : ''}${check ? ' check' : ''}`,
			piece && h('span', `piece ${piece.color}`, GLYPH[piece.type]),
			c === 0 && h('span', 'coord rank', square[1]),
			r === 7 && h('span', 'coord file', square[0]));
		cell.dataset.square = square;
		cell.setAttribute('role', 'gridcell');
		cell.setAttribute('aria-label', piece ? `${square}: ${piece.color === 'w' ? 'white' : 'black'} ${PIECE[piece.type]}` : `${square}: empty`);
		grid.append(cell);
	}));

	// Touch only: tap a piece of the side to move to see where it can go. One piece at a time; tap again to clear.
	// It never changes the game.
	grid.addEventListener('click', (event) => {
		const cell = event.target.closest('.sq');
		const selected = grid.querySelector('.sq.selected')?.dataset.square;
		grid.querySelectorAll('.selected, .target, .capture').forEach((el) => el.classList.remove('selected', 'target', 'capture'));
		const piece = cell && game.get(cell.dataset.square);
		if (!piece || cell.dataset.square === selected || piece.color !== game.turn() || game.isGameOver()) return;
		cell.classList.add('selected');
		for (const move of game.moves({ square: cell.dataset.square, verbose: true })) {
			grid.querySelector(`[data-square="${move.to}"]`).classList.add(move.captured ? 'capture' : 'target');
		}
	});
	return grid;
};

const play = (state) => {
	const { game, illegal, change } = state.chess;
	const history = game.history();
	const over = game.isGameOver() || Boolean(state.result);
	// Pieces each side has taken, shown beside that player.
	const captured = (color) => game.history({ verbose: true }).filter((m) => m.color === color && m.captured).map((m) => GLYPH[m.captured]).join('');
	const playerRow = (color) => h('div', `card chess-player${game.turn() === color && !over ? ' is-turn' : ''}`,
		h('span', `dot ${color}`), player(state.p, color),
		captured(color) && h('span', `chess-captured ${color === 'w' ? 'b' : 'w'}`, captured(color)));
	// The last ten full moves as a numbered table: 1. e4 e5
	const rows = [];
	for (let i = 0; i < history.length; i += 2) rows.push([i / 2 + 1, history[i], history[i + 1] ?? '']);

	return [
		header(state, history.length ? t('chess.moveN', { n: Math.floor(history.length / 2) + 1 }) : null),
		h('section', 'stage chess',
			h('div', 'chess-layout',
				boardView(state),
				h('div', 'chess-side',
					playerRow('b'),
					h('div', 'chess-center',
						change && h('p', 'chess-change', change.added.length
							? t('chess.changed', { from: change.removed.join(' '), to: change.added.join(' ') })
							: t('chess.undid', { moves: change.removed.join(' ') })),
						h('p', 'chess-status', status(state)),
						illegal && h('p', 'chess-illegal', t('chess.illegal', { move: illegal })),
						rows.length > 0 && h('ol', 'chess-moves', rows.slice(-10).map(([n, white, black]) =>
							h('li', null, h('span', 'muted', `${n}.`), h('span', null, white), h('span', null, black))))),
					playerRow('w')))),
	];
};

const screens = { ...sharedScreens, play };

apps.register('chess', {
	title: t('chess.title'),
	description: t('chess.description'),
	phrase: t('chess.phrase'),
	icon: ['M12 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z', 'M10 7.5 9 13h6l-1-5.5', 'M8 13h8l1 4H7z', 'M6 20h12'],
	params: { mv: moveList, side: (v) => (v.toLowerCase().startsWith('b') ? 'b' : 'w'), result },
	screens,
	pick: (state) => {
		state.chess = replay(state.mv);
		const { game, illegal, at } = state.chess;
		state.chess.change = lastChange(state.code, game.history());
		const { change } = state.chess;
		// Plain text for the session transcript, so the assistant always knows the real position.
		state.note = [
			`Chess. Position (FEN): ${game.fen()}.`,
			`${game.turn() === 'w' ? 'White' : 'Black'} to move${game.inCheck() ? ', in check' : ''}.`,
			change && `Last change: ${change.added.length ? `${change.removed.join(' ')} replaced with ${change.added.join(' ')}` : `undid ${change.removed.join(' ')}`}.`,
			state.result ? `Result: ${state.result === 'draw' ? 'draw agreed' : `${state.result === '1-0' ? 'White' : 'Black'} wins`}.`
				: game.isGameOver() ? `Game over: ${game.isCheckmate() ? 'checkmate' : 'draw'}.` : `Legal moves: ${game.moves().join(' ')}.`,
			illegal ? `Move ${at} (${illegal}) is not legal and was ignored, along with any moves after it.` : '',
		].filter(Boolean).join(' ');
		return Object.hasOwn(screens, state.st) ? state.st : 'play';
	},
});
