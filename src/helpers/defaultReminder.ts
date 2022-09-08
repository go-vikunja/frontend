const DEFAULT_REMINDER_KEY = 'defaultReminder'

interface DefaultReminderSettings {
	enabled: boolean,
	amount: number,
}

function calculateDefaultReminderSeconds(type: string, amount: number): number {
	switch (type) {
		case 'minutes':
			return amount * 60
		case 'hours':
			return amount * 60 * 60
		case 'days':
			return amount * 60 * 60 * 24
		case 'months':
			return amount * 60 * 60 * 24 * 30
	}

	return 0
}

export function saveDefaultReminder(enabled: boolean, type: string, amount: number) {
	const defaultReminderSeconds = calculateDefaultReminderSeconds(type, amount)
	localStorage.setItem(DEFAULT_REMINDER_KEY, JSON.stringify(<DefaultReminderSettings>{
		enabled,
		amount: defaultReminderSeconds,
	}))
}

export function getDefaultReminderAmount(): number | null {
	const settings = getDefaultReminderSettings()

	return settings?.enabled
		? settings.amount
		: null
}

export function getDefaultReminderSettings(): DefaultReminderSettings | null {
	const s: string | null = localStorage.getItem(DEFAULT_REMINDER_KEY)
	if (s === null) {
		return null
	}

	return JSON.parse(s)
}
