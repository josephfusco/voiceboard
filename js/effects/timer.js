// timer=15: a countdown ring that drains on its own, no new URL needed.
import { effects } from '../registry.js';
import { h } from '../dom.js';
import { int } from '../params.js';

effects.register('timer', {
	params: { timer: (v) => Math.min(int(v), 600) },
	active: ({ timer }) => timer > 0,
	mount(board, { timer }) {
		const count = h('span', null, timer);
		const ring = h('div', 'fx-timer', count);
		ring.setAttribute('role', 'timer');
		ring.style.setProperty('--duration', `${timer}s`);
		board.append(ring);

		const end = Date.now() + timer * 1000;
		const id = setInterval(() => {
			const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
			count.textContent = left;
			if (!left) {
				ring.classList.add('is-done');
				clearInterval(id);
			}
		}, 200);
	},
});
