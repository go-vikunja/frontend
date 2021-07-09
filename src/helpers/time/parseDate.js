import {calculateDayInterval} from './calculateDayInterval'
import {calculateNearestHours} from './calculateNearestHours'
import {replaceAll} from '../replaceAll'

export const parseDate = text => {
	const lowerText = text.toLowerCase()

	if (lowerText.includes('today')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('today')), 'today')
	}
	if (lowerText.includes('tomorrow')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('tomorrow')), 'tomorrow')
	}
	if (lowerText.includes('next monday')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('nextMonday')), 'next monday')
	}
	if (lowerText.includes('this weekend')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('thisWeekend')), 'this weekend')
	}
	if (lowerText.includes('later this week')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('laterThisWeek')), 'later this week')
	}
	if (lowerText.includes('later next week')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('laterNextWeek')), 'later next week')
	}
	if (lowerText.includes('next week')) {
		return addTimeToDate(text, getDateFromInterval(calculateDayInterval('nextWeek')), 'next week')
	}
	if (lowerText.includes('next month')) {
		const date = new Date()
		date.setDate(1)
		date.setMonth(date.getMonth() + 1)
		date.setHours(calculateNearestHours(date))
		date.setMinutes(0)
		date.setSeconds(0)

		return addTimeToDate(text, date, 'next month')
	}
	if (lowerText.includes('end of month')) {
		const curDate = new Date()
		const date = new Date(curDate.getFullYear(), curDate.getMonth() + 1, 0)
		date.setHours(calculateNearestHours(date))
		date.setMinutes(0)
		date.setSeconds(0)

		return addTimeToDate(text, date, 'end of month')
	}

	let parsed = getDateFromWeekday(text)
	if (parsed.date !== null) {
		return addTimeToDate(text, parsed.date, parsed.foundText)
	}

	parsed = getDayFromText(text)
	if (parsed.date !== null) {
		return addTimeToDate(text, parsed.date, parsed.foundText)
	}

	parsed = getDateFromTextIn(text)
	if (parsed.date !== null) {
		return {
			newText: replaceAll(text, parsed.foundText, ''),
			date: parsed.date,
		}
	}

	parsed = getDateFromText(text)

	return {
		newText: replaceAll(text, parsed.foundText, ''),
		date: parsed.date,
	}
}

const addTimeToDate = (text, date, match) => {
	const matcher = new RegExp(`(${match} (at|@) )([0-9][0-9]?(:[0-9][0-9]?)?( ?(a|p)m)?)`, 'ig')
	const results = matcher.exec(text)

	if (results !== null) {
		const time = results[3]
		const parts = time.split(':')
		let hours = parseInt(parts[0])
		let minutes = 0
		if (time.endsWith('pm')) {
			hours += 12
		}
		if (parts.length > 1) {
			minutes = parseInt(parts[1])
		}

		date.setHours(hours)
		date.setMinutes(minutes)
		date.setSeconds(0)
	}

	const replace = results !== null ? results[0] : match
	return {
		newText: replaceAll(text, replace, ''),
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

	if (result === null) {
		return {
			foundText,
			date: null,
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
		date,
	}
}

export const getDateFromTextIn = (text, now = new Date()) => {
	const regex = /(in [0-9]+ (hours?|days?|weeks?|months?))/ig
	const results = regex.exec(text)
	if (results === null) {
		return {
			foundText: '',
			date: null,
		}
	}

	let foundText = results[0]
	const date = new Date(now)
	const parts = foundText.split(' ')
	switch (parts[2]) {
		case 'hours':
		case 'hour':
			date.setHours(date.getHours() + parseInt(parts[1]))
			break
		case 'days':
		case 'day':
			date.setDate(date.getDate() + parseInt(parts[1]))
			break
		case 'weeks':
		case 'week':
			date.setDate(date.getDate() + parseInt(parts[1]) * 7)
			break
		case 'months':
		case 'month':
			date.setMonth(date.getMonth() + parseInt(parts[1]))
			break
	}

	return {
		foundText,
		date,
	}
}

const getDateFromWeekday = text => {
	const matcher = /(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)/ig
	const results = matcher.exec(text)
	if (results === null) {
		return {
			foundText: null,
			date: null,
		}
	}

	const date = new Date()
	const currentDay = date.getDay()
	let day = 0

	switch (results[0]) {
		case 'mon':
		case 'monday':
			day = 1
			break
		case 'tue':
		case 'tuesday':
			day = 2
			break
		case 'wed':
		case 'wednesday':
			day = 3
			break
		case 'thu':
		case 'thursday':
			day = 4
			break
		case 'fri':
		case 'friday':
			day = 5
			break
		case 'sat':
		case 'saturday':
			day = 6
			break
		case 'sun':
		case 'sunday':
			day = 0
			break
		default:
			return {
				foundText: null,
				date: null,
			}
	}

	const distance = (day + 7 - currentDay) % 7
	date.setDate(date.getDate() + distance)

	return {
		foundText: results[0],
		date: date,
	}
}

const getDayFromText = text => {
	const matcher = /(([1-2][0-9])|(3[01])|(0?[1-9]))(st|nd|rd|th|\.)/ig
	const results = matcher.exec(text)
	if (results === null) {
		return {
			foundText: null,
			date: null,
		}
	}

	const date = new Date()
	date.setDate(parseInt(results[0]))

	if (date < new Date()) {
		date.setMonth(date.getMonth() + 1)
	}

	return {
		foundText: results[0],
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
