/*
 * Trivia board: renders game state entirely from the URL query string.
 *
 * Params (all optional, all forgiving):
 *   st   ask | reveal | score | end   (inferred if omitted)
 *   t    title / category              "Space"
 *   q    question text                 "Which planet has the most moons?"
 *   c    choices, pipe-separated       "Jupiter|Saturn|Uranus|Neptune"
 *   a    correct choice, 1-4 or A-D    "2" or "B"
 *   n    question number               "3"
 *   of   total questions               "10"
 *   p    players, Name:score,...       "Joe:200,Sam:100"
 *   r    who got it right, or "none"   "Sam"
 */
(function () {
	'use strict';

	var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
	var STATES = ['ask', 'reveal', 'score', 'end'];

	function parseChoices(raw) {
		if (!raw) return [];
		return raw.split('|')
			.map(function (s) { return s.trim(); })
			.filter(Boolean)
			.slice(0, LETTERS.length);
	}

	// Returns a 0-based index, or -1 if the answer can't be resolved.
	function parseAnswer(raw, choices) {
		if (!raw) return -1;
		raw = raw.trim();
		var letter = LETTERS.indexOf(raw.toUpperCase());
		if (letter !== -1) return letter;
		var num = parseInt(raw, 10);
		if (!isNaN(num) && String(num) === raw) return num - 1;
		// Fall back to matching the choice text itself.
		var lower = raw.toLowerCase();
		for (var i = 0; i < choices.length; i++) {
			if (choices[i].toLowerCase() === lower) return i;
		}
		return -1;
	}

	function parsePlayers(raw) {
		if (!raw) return [];
		return raw.split(',').map(function (entry) {
			var idx = entry.lastIndexOf(':');
			var name = (idx === -1 ? entry : entry.slice(0, idx)).trim();
			var score = idx === -1 ? 0 : parseInt(entry.slice(idx + 1), 10);
			return { name: name, score: isNaN(score) ? 0 : score };
		}).filter(function (p) { return p.name; });
	}

	function parseState(search) {
		var params = new URLSearchParams(search);
		var get = function (k) { return (params.get(k) || '').trim(); };

		var choices = parseChoices(get('c'));
		var state = {
			st: get('st').toLowerCase(),
			title: get('t'),
			question: get('q'),
			choices: choices,
			answer: parseAnswer(get('a'), choices),
			n: parseInt(get('n'), 10) || 0,
			of: parseInt(get('of'), 10) || 0,
			players: parsePlayers(get('p')),
			right: get('r')
		};

		if (STATES.indexOf(state.st) === -1) {
			if (state.question) state.st = state.answer !== -1 ? 'reveal' : 'ask';
			else if (state.players.length) state.st = 'score';
			else state.st = 'idle';
		}
		// Can't show a question screen without a question.
		if ((state.st === 'ask' || state.st === 'reveal') && !state.question) {
			state.st = state.players.length ? 'score' : 'idle';
		}
		return state;
	}

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text != null) node.textContent = text;
		return node;
	}

	function header(state) {
		var bar = el('header', 'bar');
		bar.appendChild(el('div', 'bar-title', state.title || 'Trivia'));
		if (state.n) {
			bar.appendChild(el('div', 'bar-progress',
				'Question ' + state.n + (state.of ? ' of ' + state.of : '')));
		}
		return bar;
	}

	function scoreStrip(players) {
		var strip = el('footer', 'strip');
		players.forEach(function (p) {
			var chip = el('div', 'chip');
			chip.appendChild(el('span', 'chip-name', p.name));
			chip.appendChild(el('span', 'chip-score', String(p.score)));
			strip.appendChild(chip);
		});
		return strip;
	}

	function renderQuestion(state, reveal) {
		var frag = document.createDocumentFragment();
		frag.appendChild(header(state));

		var body = el('section', 'stage');
		body.appendChild(el('h1', 'question', state.question));

		if (state.choices.length) {
			var list = el('ol', 'choices count-' + state.choices.length);
			state.choices.forEach(function (text, i) {
				var item = el('li', 'choice');
				if (reveal && state.answer !== -1) {
					item.classList.add(i === state.answer ? 'is-correct' : 'is-dim');
				}
				item.appendChild(el('span', 'choice-letter', LETTERS[i]));
				item.appendChild(el('span', 'choice-text', text));
				list.appendChild(item);
			});
			body.appendChild(list);
		}

		if (reveal) {
			var verdict;
			if (state.right && state.right.toLowerCase() !== 'none') {
				verdict = state.right + ' got it!';
			} else if (state.right) {
				verdict = 'Nobody got it';
			}
			if (!state.choices.length && state.answer === -1 && !verdict) {
				verdict = 'Answer revealed';
			}
			if (verdict) body.appendChild(el('div', 'verdict', verdict));
		}

		frag.appendChild(body);
		if (state.players.length) frag.appendChild(scoreStrip(state.players));
		return frag;
	}

	function renderScores(state, final) {
		var frag = document.createDocumentFragment();
		frag.appendChild(header(state));

		var body = el('section', 'stage');
		var sorted = state.players.slice().sort(function (a, b) { return b.score - a.score; });
		var top = sorted.length ? sorted[0].score : 0;
		var leaders = sorted.filter(function (p) { return p.score === top; });

		var heading = 'Scoreboard';
		if (final) {
			if (!sorted.length) heading = 'Game over';
			else if (leaders.length > 1) heading = "It's a tie!";
			else heading = leaders[0].name + ' wins!';
		}
		body.appendChild(el('h1', 'question' + (final ? ' is-final' : ''), heading));

		var table = el('ol', 'scores');
		sorted.forEach(function (p) {
			var row = el('li', 'score-row' + (final && p.score === top ? ' is-leader' : ''));
			row.appendChild(el('span', 'score-name', p.name));
			row.appendChild(el('span', 'score-value', String(p.score)));
			table.appendChild(row);
		});
		body.appendChild(table);

		frag.appendChild(body);
		return frag;
	}

	function renderIdle(state) {
		var frag = document.createDocumentFragment();
		var body = el('section', 'stage is-idle');
		body.appendChild(el('h1', 'question', state.title || 'Trivia'));
		body.appendChild(el('p', 'subtitle', 'Ask Grok to start a game'));
		frag.appendChild(body);
		return frag;
	}

	function render() {
		var state = parseState(window.location.search);
		var board = document.getElementById('board');
		var view;

		switch (state.st) {
			case 'ask': view = renderQuestion(state, false); break;
			case 'reveal': view = renderQuestion(state, true); break;
			case 'score': view = renderScores(state, false); break;
			case 'end': view = renderScores(state, true); break;
			default: view = renderIdle(state);
		}

		board.className = 'board state-' + state.st;
		board.replaceChildren(view);
		document.title = state.question || state.title || 'Trivia';
	}

	window.addEventListener('popstate', render);
	render();

	// Exposed for tests.
	window.TriviaBoard = { parseState: parseState };
})();
