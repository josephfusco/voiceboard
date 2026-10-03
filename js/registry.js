// A minimal keyed registry. Modules register themselves on import; the board looks them up by name or alias.
export const createRegistry = (kind) => {
	const items = new Map();
	const aliases = new Map();
	return {
		register(name, item, { alias = [] } = {}) {
			if (items.has(name)) throw new Error(`${kind} "${name}" is already registered`);
			items.set(name, { name, ...item });
			alias.forEach((a) => aliases.set(a, name));
			return items.get(name);
		},
		get: (name) => items.get(aliases.get(name) ?? name),
		has: (name) => items.has(aliases.get(name) ?? name),
		list: () => [...items.values()],
	};
};

// Apps (home, games, hall of fame) own params and screens; effects layer on top of any screen.
export const apps = createRegistry('app');
export const effects = createRegistry('effect');
