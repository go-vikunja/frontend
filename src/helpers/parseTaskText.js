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
	if (lowerText.includes('next month')) {
		const date = new Date()
		date.setDate(1)
		date.setMonth(date.getMonth() + 1)
		date.setHours(calculateNearestHours(date))
		date.setMinutes(0)
		date.setSeconds(0)

		return {
			newText: replaceAll(text, 'next month', ''),
			date: date,
		}
	}
	// TODO "in x [hours|days|weeks|months]

	// TODO end of month
	// TODO all of the above with @/at time parsing
	// TODO weekdays (just put the name of the weekday in
	// TODO hours
	// TODO day - like 25th for the current month or the next (if curDate > 25th)

	const {foundText, date} = getDateFromText(text)

	return {
		newText: replaceAll(text, foundText, ''),
		date: date,
	}
}

export const getDateFromText = (text, now = new Date()) => {
	const fullDateRegex = /([0-9][0-9]?\/[0-9][0-9]?\/[0-9][0-9]([0-9][0-9])?|[0-9][0-9][0-9][0-9]\/[0-9][0-9]?\/[0-9][0-9]?|[0-9][0-9][0-9][0-9]-[0-9][0-9]?-[0-9][0-9]?)/ig

	// 1. Try parsing the text as a "usual" date, like 2021-06-24 or 06/24/2021
	let results = fullDateRegex.exec(text)
	let result = results === null ? null : results[0]
	let foundText = result
	let containsYear = true
	if (result === null) {
		// 2. Try parsing the date as something like "jan 21" or "21 jan"
		const monthRegex = /((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec) [0-9][0-9]?|[0-9][0-9]? (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/ig
		results = monthRegex.exec(text)
		result = results === null ? null : `${results[0]} ${now.getFullYear()}`
		foundText = results === null ? '' : results[0]
		containsYear = false

		if (result === null) {
			// 3. Try parsing the date as "27/01" or "01/27"
			const monthNumericRegex = /([0-9][0-9]?\/[0-9][0-9]?)/ig
			results = monthNumericRegex.exec(text)

			// Put the year before or after the date, depending on what works
			result = results === null ? null : `${now.getFullYear()}/${results[0]}`
			foundText = results === null ? '' : results[0]
			if (isNaN(new Date(result))) {
				result = results === null ? null : `${results[0]}/${now.getFullYear()}`
			}
			if (isNaN(new Date(result)) && results[0] !== null) {
				const parts = results[0].split('/')
				result = `${parts[1]}/${parts[0]}/${now.getFullYear()}`
			}
		}
	}

	const date = new Date(result)
	if (isNaN(date)) {
		return {
			foundText,
			date: null,
		}
	}

	if (!containsYear && date < now) {
		date.setFullYear(date.getFullYear() + 1)
	}

	return {
		foundText,
		date: date,
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
