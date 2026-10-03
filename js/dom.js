// Tiny element builder. Children may be strings, numbers, nodes, or nested arrays; null and false are skipped.
export const h = (tag, className, ...children) => {
	const node = document.createElement(tag);
	if (className) node.className = className;
	node.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
	return node;
};

// Line icon on a 24x24 grid, drawn from SVG path data.
export const icon = (paths) => {
	const ns = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('class', 'icon');
	svg.setAttribute('aria-hidden', 'true');
	for (const d of paths) {
		const path = document.createElementNS(ns, 'path');
		path.setAttribute('d', d);
		svg.append(path);
	}
	return svg;
};

// Link to another app on this same page. Built from the current path so it survives a <base> tag.
export const appLink = (name, className, ...children) => {
	const link = h('a', className, ...children);
	link.href = `${location.pathname}?g=${encodeURIComponent(name)}`;
	return link;
};
