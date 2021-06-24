/**
 * Parses task text for dates, assignees, labels, lists, priorities and returns an object with all found intents.
 *
 * @param text
 */
export const parseTaskText = text => {
	const result = {
		text: text,
		labels: [],
		list: null,
		priority: null,
		assignees: [],
	}

	result.labels = parseLabels(text)

	result.labels.forEach(l => {
		result.text = result.text
			.replace(`~'${l}' `, '')
			.replace(`~'${l}'`, '')
			.replace(`~"${l}" `, '')
			.replace(`~"${l}"`, '')
			.replace(`~${l} `, '')
			.replace(`~${l}`, '')
	})

	result.text = result.text.trim()

	return result
}

const parseLabels = text => {
	const labels = []

	const labelParts = text.split('~')
	labelParts.forEach((p, index) => {
		// First part contains the rest
		if (index < 1) {
			return
		}

		let labelText
		if (p.charAt(0) === `'`) {
			labelText = p.split(`'`)[1]
		} else if (p.charAt(0) === `"`) {
			labelText = p.split(`"`)[1]
		} else {
			// Only until the next space
			labelText = p.split(' ')[0]
		}
		labels.push(labelText)
	})

	return Array.from(new Set(labels))
}
