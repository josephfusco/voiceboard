// fx=confetti: a one-shot burst over whatever screen is showing.
import { effects } from '../registry.js';
import { h } from '../dom.js';

const PIECES = 90;
const COLORS = ['var(--accent)', 'var(--correct)', '#f5b400', '#e5484d', '#8e4ec6'];
const random = (min, max) => min + Math.random() * (max - min);

effects.register('confetti', {
	params: {},
	active: ({ fx }) => fx.includes('confetti') && !matchMedia('(prefers-reduced-motion: reduce)').matches,
	mount(board) {
		board.append(h('div', 'fx-confetti', Array.from({ length: PIECES }, (_, i) => {
			const piece = h('i');
			Object.entries({
				'--x': `${random(0, 100)}%`,
				'--drift': `${random(-15, 15)}vw`,
				'--spin': `${random(360, 1080)}deg`,
				'--time': `${random(2.5, 4.5)}s`,
				'--delay': `${random(0, 0.8)}s`,
				'--color': COLORS[i % COLORS.length],
			}).forEach(([key, value]) => piece.style.setProperty(key, value));
			return piece;
		})));
	},
});
