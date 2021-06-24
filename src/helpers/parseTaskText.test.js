import {parseTaskText} from './parseTaskText'

describe('Parse Task Text', () => {
	it('should return text with no intents as is', () => {
		expect(parseTaskText('Lorem Ipsum').text).toBe('Lorem Ipsum')
	})

	describe('labels', () => {
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
	})
})
