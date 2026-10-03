// A minimal keyed registry. Modules register themselves on import; the board looks them up by name.
export const createRegistry = (kind) => {
	const items = new Map();
	return {
		register(name, item) {
			if (items.has(name)) throw new Error(`${kind} "${name}" is already registered`);
			items.set(name, item);
			return item;
		},
		get: (name) => items.get(name),
		has: (name) => items.has(name),
	};
};

export const games = createRegistry('game');
