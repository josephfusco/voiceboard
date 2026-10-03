// Typed URL params: a schema maps each key to a parser, and readParams turns a query string into state.

// Undo extra rounds of encoding ("%253F" -> "%3F" -> "?") from launchers that re-encode URLs.
const decode = (value) => {
	for (let i = 0; i < 3 && /%[\da-f]{2}/i.test(value); i++) {
		try {
			value = decodeURIComponent(value.replace(/\+/g, ' '));
		} catch {
			break;
		}
	}
	return value.trim();
};

export const text = (v) => v;
export const lower = (v) => v.toLowerCase();
export const int = (v) => parseInt(v, 10) || 0;
export const flag = (v) => /^(1|true|yes|y)$/i.test(v);
export const list = (v) => v.split('|').map((s) => s.trim()).filter(Boolean);
export const names = (v) => v.toLowerCase().split(/[|,\s]+/).filter(Boolean);
export const slug = (v) => v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);

export const MAX_PLAYERS = 6;

// "Joe:200,Sam:-100" -> [{ name: 'Joe', score: 200 }, { name: 'Sam', score: -100 }]
export const players = (v) => v.split(',').map((entry) => {
	const [name, score] = entry.split(/:(?=[^:]*$)/);
	return { name: name.trim(), score: int(score ?? '') };
}).filter((p) => p.name).slice(0, MAX_PLAYERS);

// Params every app shares. add= and reset= adjust the remembered roster (see store.js).
export const common = {
	g: lower, st: lower, t: text, n: int, of: int, fx: names, theme: lower, lang: lower,
	p: players, add: players, reset: flag, code: slug, up: text,
};

export const readParams = (search, schema) => {
	const params = new URLSearchParams(search);
	return Object.fromEntries(
		Object.entries(schema).map(([key, parse]) => [key, parse(decode(params.get(key) ?? ''))]),
	);
};
