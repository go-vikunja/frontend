import {parseTaskText} from './parseTaskText'
import {calculateDayInterval} from './time/calculateDayInterval'

describe('Parse Task Text', () => {
	it('should return text with no intents as is', () => {
		expect(parseTaskText('Lorem Ipsum').text).toBe('Lorem Ipsum')
	})

	describe('Date Parsing', () => {
		it('should recognize today', () => {
			const result = parseTaskText('Lorem Ipsum today')

			expect(result.text).toBe('Lorem Ipsum')
			const now = new Date()
			expect(result.date.getFullYear()).toBe(now.getFullYear())
			expect(result.date.getMonth()).toBe(now.getMonth())
			expect(result.date.getDate()).toBe(now.getDate())
		})
		it('should recognize tomorrow', () => {
			const result = parseTaskText('Lorem Ipsum tomorrow')

			expect(result.text).toBe('Lorem Ipsum')
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)
			expect(result.date.getFullYear()).toBe(tomorrow.getFullYear())
			expect(result.date.getMonth()).toBe(tomorrow.getMonth())
			expect(result.date.getDate()).toBe(tomorrow.getDate())
		})
		it('should recognize next monday', () => {
			const result = parseTaskText('Lorem Ipsum next monday')

			const untilNextMonday = calculateDayInterval('nextMonday')

			expect(result.text).toBe('Lorem Ipsum')
			const nextMonday = new Date()
			nextMonday.setDate(nextMonday.getDate() + untilNextMonday)
			expect(result.date.getFullYear()).toBe(nextMonday.getFullYear())
			expect(result.date.getMonth()).toBe(nextMonday.getMonth())
			expect(result.date.getDate()).toBe(nextMonday.getDate())
		})
		it('should recognize this weekend', () => {
			const result = parseTaskText('Lorem Ipsum this weekend')

			const untilThisWeekend = calculateDayInterval('thisWeekend')

			expect(result.text).toBe('Lorem Ipsum')
			const thisWeekend = new Date()
			thisWeekend.setDate(thisWeekend.getDate() + untilThisWeekend)
			expect(result.date.getFullYear()).toBe(thisWeekend.getFullYear())
			expect(result.date.getMonth()).toBe(thisWeekend.getMonth())
			expect(result.date.getDate()).toBe(thisWeekend.getDate())
		})
		it('should recognize later this week', () => {
			const result = parseTaskText('Lorem Ipsum later this week')

			const untilLaterThisWeek = calculateDayInterval('laterThisWeek')

			expect(result.text).toBe('Lorem Ipsum')
			const laterThisWeek = new Date()
			laterThisWeek.setDate(laterThisWeek.getDate() + untilLaterThisWeek)
			expect(result.date.getFullYear()).toBe(laterThisWeek.getFullYear())
			expect(result.date.getMonth()).toBe(laterThisWeek.getMonth())
			expect(result.date.getDate()).toBe(laterThisWeek.getDate())
		})
		it('should recognize later next week', () => {
			const result = parseTaskText('Lorem Ipsum later next week')

			const untilLaterNextWeek = calculateDayInterval('laterNextWeek')

			expect(result.text).toBe('Lorem Ipsum')
			const laterNextWeek = new Date()
			laterNextWeek.setDate(laterNextWeek.getDate() + untilLaterNextWeek)
			expect(result.date.getFullYear()).toBe(laterNextWeek.getFullYear())
			expect(result.date.getMonth()).toBe(laterNextWeek.getMonth())
			expect(result.date.getDate()).toBe(laterNextWeek.getDate())
		})
		it('should recognize next week', () => {
			const result = parseTaskText('Lorem Ipsum next week')

			const untilNextWeek = calculateDayInterval('nextWeek')

			expect(result.text).toBe('Lorem Ipsum')
			const nextWeek = new Date()
			nextWeek.setDate(nextWeek.getDate() + untilNextWeek)
			expect(result.date.getFullYear()).toBe(nextWeek.getFullYear())
			expect(result.date.getMonth()).toBe(nextWeek.getMonth())
			expect(result.date.getDate()).toBe(nextWeek.getDate())
		})
	})

	describe('Labels', () => {
		it('should parse labels', () => {
			const result = parseTaskText('Lorem Ipsum ~label1 ~label2')

			expect(result.text).toBe('Lorem Ipsum')
			expect(result.labels).toHaveLength(2)
			expect(result.labels[0]).toBe('label1')
			expect(result.labels[1]).toBe('label2')
		})
		it('should parse labels from the start', () => {
			const result = parseTaskText('~label1 Lorem Ipsum ~label2')

			expect(result.text).toBe('Lorem Ipsum')
			expect(result.labels).toHaveLength(2)
			expect(result.labels[0]).toBe('label1')
			expect(result.labels[1]).toBe('label2')
		})
		it('should resolve duplicate labels', () => {
			const result = parseTaskText('Lorem Ipsum ~label1 ~label1 ~label2')

			expect(result.text).toBe('Lorem Ipsum')
			expect(result.labels).toHaveLength(2)
			expect(result.labels[0]).toBe('label1')
			expect(result.labels[1]).toBe('label2')
		})
		it('should correctly parse labels with spaces in them', () => {
			const result = parseTaskText(`Lorem ~'label with space' Ipsum`)

			expect(result.text).toBe('Lorem Ipsum')
			expect(result.labels).toHaveLength(1)
			expect(result.labels[0]).toBe('label with space')
		})
		it('should correctly parse labels with spaces in them and "', () => {
			const result = parseTaskText('Lorem ~"label with space" Ipsum')

			expect(result.text).toBe('Lorem Ipsum')
			expect(result.labels).toHaveLength(1)
			expect(result.labels[0]).toBe('label with space')
		})
	})
})
