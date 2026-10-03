// Tiny element builder. Children may be strings, numbers, nodes, or nested arrays; null and false are skipped.
export const h = (tag, className, ...children) => {
	const node = document.createElement(tag);
	if (className) node.className = className;
	node.append(...children.flat(Infinity).filter((c) => c != null && c !== false));
	return node;
};
