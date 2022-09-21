// IDEA: maybe use a small fuzzy search here to prevent errors
export function findPropertyByValue(object, key, value) {
	return Object.values(object).find(
		(l) => l[key]?.toLowerCase() === value.toLowerCase(),
	)
}

