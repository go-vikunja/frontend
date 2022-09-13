import {describe, it, expect, vi, afterEach, beforeEach} from 'vitest'
import {
	getDefaultReminderSettings,
	getSavedReminderSettings,
	parseSavedReminderAmount,
	saveDefaultReminder,
} from '@/helpers/defaultReminder'
import * as exports from '@/helpers/defaultReminder'

describe('Default Reminder Save', () => {
	it('Should save a default reminder with minutes', () => {
		const spy = vi.spyOn(window.localStorage, 'setItem')
		saveDefaultReminder(true, 'minutes', 5)

		expect(spy).toHaveBeenCalledWith('defaultReminder', '{"enabled":true,"amount":300}')
	})
	it('Should save a default reminder with hours', () => {
		const spy = vi.spyOn(window.localStorage, 'setItem')
		saveDefaultReminder(true, 'hours', 5)
		
		expect(spy).toHaveBeenCalledWith('defaultReminder', '{"enabled":true,"amount":18000}')
	})
	it('Should save a default reminder with days', () => {
		const spy = vi.spyOn(window.localStorage, 'setItem')
		saveDefaultReminder(true, 'days', 5)

		expect(spy).toHaveBeenCalledWith('defaultReminder', '{"enabled":true,"amount":432000}')
	})
	it('Should save a default reminder with months', () => {
		const spy = vi.spyOn(window.localStorage, 'setItem')
		saveDefaultReminder(true, 'months', 5)

		expect(spy).toHaveBeenCalledWith('defaultReminder', '{"enabled":true,"amount":12960000}')
	})
})

describe('Default Reminder Load', () => {
	it('Should parse minutes', () => {
		const settings = parseSavedReminderAmount(5 * 60)
		
		expect(settings.amount).toBe(5)
		expect(settings.type).toBe('minutes')
	})
	it('Should parse hours', () => {
		const settings = parseSavedReminderAmount(5 * 60 * 60)

		expect(settings.amount).toBe(5)
		expect(settings.type).toBe('hours')
	})
	it('Should parse days', () => {
		const settings = parseSavedReminderAmount(5 * 60 * 60 * 24)

		expect(settings.amount).toBe(5)
		expect(settings.type).toBe('days')
	})
	it('Should parse months', () => {
		const settings = parseSavedReminderAmount(5 * 60 * 60 * 24 * 30)

		expect(settings.amount).toBe(5)
		expect(settings.type).toBe('months')
	})
})
