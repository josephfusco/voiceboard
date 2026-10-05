// auto= moves the board on by itself, so the host talks less:
//   auto=reveal  when the timer runs out, show the answer (the ask URL already carries a=)
//   auto=score   after a few seconds, show the scoreboard
//   auto=next    after a few seconds, give the next player in the roster their turn
// after= sets the delay in seconds. The next screen drops score changes and effects, so nothing counts twice.
import { effects, h, int, lower } from 'voiceboard';

const DROP = ['add', 'p', 'reset', 'fx', 'timer', 'auto', 'after', 'r'];

const nextScreen = (state) => {
	const params = new URLSearchParams(location.search);
	DROP.forEach((key) => params.delete(key));
	if (state.auto === 'reveal') {
		params.set('st', 'reveal');
	} else if (state.auto === 'score') {
		params.set('st', 'score');
	} else if (state.auto === 'next') {
		const names = state.p.map((p) => p.name);
		const at = names.findIndex((name) => name.toLowerCase() === (state.up || '').toLowerCase());
		if (!names.length) return null;
		params.set('st', 'next');
		params.set('up', names[(at + 1) % names.length]);
		['q', 'c', 'a', 'n'].forEach((key) => params.delete(key));
	} else {
		return null;
	}
	return `${location.pathname}?${params}`;
};

effects.register('auto', {
	params: { auto: lower, after: (v) => Math.min(int(v), 120) },
	active: ({ auto }) => ['reveal', 'score', 'next'].includes(auto),
	mount(board, state) {
		const target = nextScreen(state);
		if (!target) return;
		// Reveal waits for the countdown; the others default to six seconds.
		const seconds = state.after || (state.auto === 'reveal' ? state.timer : 0) || 6;
		const bar = h('div', 'fx-auto');
		bar.style.setProperty('--duration', `${seconds}s`);
		bar.setAttribute('aria-hidden', 'true');
		board.append(bar);
		setTimeout(() => location.assign(target), seconds * 1000);
	},
});
