import {calculateDayInterval} from './time/calculateDayInterval'
import {calculateNearestHours} from './time/calculateNearestHours'
import {replaceAll} from './replaceAll'

/**
 * Parses task text for dates, assignees, labels, lists, priorities and returns an object with all found intents.
 *
 * @param text
 */
export const parseTaskText = text => {
	const result = {
		text: text,
		date: null,
		labels: [],
		list: null,
		priority: null,
		assignees: [],
	}

	result.labels = parseLabels(text)
	const {newText, date} = parseDate(text)
	result.text = newText
	result.date = date

	return cleanupResult(result)
}

const parseDate = text => {
	const lowerText = text.toLowerCase()

	if (lowerText.includes('today')) {
		return {
			newText: replaceAll(text, 'today', ''),
			date: getDateFromInterval(calculateDayInterval('today')),
		}
	}
	if (lowerText.includes('tomorrow')) {
		return {
			newText: replaceAll(text, 'tomorrow', ''),
			date: getDateFromInterval(calculateDayInterval('tomorrow')),
		}
	}
	if (lowerText.includes('next monday')) {
		return {
			newText: replaceAll(text, 'next monday', ''),
			date: getDateFromInterval(calculateDayInterval('nextMonday')),
		}
	}
	if (lowerText.includes('this weekend')) {
		return {
			newText: replaceAll(text, 'this weekend', ''),
			date: getDateFromInterval(calculateDayInterval('thisWeekend')),
		}
	}
	if (lowerText.includes('later this week')) {
		return {
			newText: replaceAll(text, 'later this week', ''),
			date: getDateFromInterval(calculateDayInterval('laterThisWeek')),
		}
	}
	if (lowerText.includes('later next week')) {
		return {
			newText: replaceAll(text, 'later next week', ''),
			date: getDateFromInterval(calculateDayInterval('laterNextWeek')),
		}
	}
	if (lowerText.includes('next week')) {
		return {
			newText: replaceAll(text, 'next week', ''),
			date: getDateFromInterval(calculateDayInterval('nextWeek')),
		}
	}


	return {
		newText: text,
		date: null,
	}
}

const getDateFromInterval = interval => {
	const newDate = new Date()
	newDate.setDate(newDate.getDate() + interval)
	newDate.setHours(calculateNearestHours(newDate))
	newDate.setMinutes(0)
	newDate.setSeconds(0)

	return newDate
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

const cleanupResult = result => {
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
