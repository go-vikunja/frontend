import AbstractService from './abstractService'
import TaskModel from '@/models/task'
import type {ITask} from '@/modelTypes/ITask'
import AttachmentService from './attachment'
import LabelService from './label'

import {formatISO} from 'date-fns'
import {colorFromHex} from '@/helpers/color/colorFromHex'
import {getDefaultReminderAmount} from '@/helpers/defaultReminder'

const parseDate = date => {
	if (date) {
		return formatISO(new Date(date))
	}

	return null
}

export default class TaskService extends AbstractService<ITask> {
	constructor() {
		super({
			create: '/lists/{listId}',
			getAll: '/tasks/all',
			get: '/tasks/{id}',
			update: '/tasks/{id}',
			delete: '/tasks/{id}',
		})
	}

	modelFactory(data) {
		return new TaskModel(data)
	}

	beforeUpdate(model) {
		return this.processModel(model)
	}

	beforeCreate(model) {
		return this.processModel(model)
	}

	processModel(updatedModel) {
		const model = {...updatedModel}

		model.title = model.title?.trim()

		// Ensure that listId is an int
		model.listId = Number(model.listId)

		// Convert dates into an iso string
		model.dueDate = parseDate(model.dueDate)
		model.startDate = parseDate(model.startDate)
		model.endDate = parseDate(model.endDate)
		model.doneAt = parseDate(model.doneAt)
		model.created = formatISO(new Date(model.created))
		model.updated = formatISO(new Date(model.updated))

		// remove all nulls, these would create empty reminders
		for (const index in model.reminderDates) {
			if (model.reminderDates[index] === null) {
				model.reminderDates.splice(index, 1)
			}
		}

		// Make normal timestamps from js dates
		if (model.reminderDates.length > 0) {
			model.reminderDates = model.reminderDates.map(r => {
				return formatISO(new Date(r))
			})
		}

		if (model.dueDate !== null && model.reminderDates.length === 0) {
			const defaultReminder = getDefaultReminderAmount()
			if (defaultReminder !== null) {
				const dueDate = +new Date(model.dueDate)
				const reminderDate = new Date(dueDate - (defaultReminder * 1000))
				model.reminderDates.push(formatISO(reminderDate))
			}
		}

		// Make the repeating amount to seconds
		let repeatAfterSeconds = 0
		if (model.repeatAfter !== null && (model.repeatAfter.amount !== null || model.repeatAfter.amount !== 0)) {
			switch (model.repeatAfter.type) {
				case 'hours':
					repeatAfterSeconds = model.repeatAfter.amount * 60 * 60
					break
				case 'days':
					repeatAfterSeconds = model.repeatAfter.amount * 60 * 60 * 24
					break
				case 'weeks':
					repeatAfterSeconds = model.repeatAfter.amount * 60 * 60 * 24 * 7
					break
				case 'months':
					repeatAfterSeconds = model.repeatAfter.amount * 60 * 60 * 24 * 30
					break
				case 'years':
					repeatAfterSeconds = model.repeatAfter.amount * 60 * 60 * 24 * 365
					break
			}
		}
		model.repeatAfter = repeatAfterSeconds

		model.hexColor = colorFromHex(model.hexColor)

		// Do the same for all related tasks
		Object.keys(model.relatedTasks).forEach(relationKind => {
			model.relatedTasks[relationKind] = model.relatedTasks[relationKind].map(t => {
				return this.processModel(t)
			})
		})

		// Process all attachments to preven parsing errors
		if (model.attachments.length > 0) {
			const attachmentService = new AttachmentService()
			model.attachments.map(a => {
				return attachmentService.processModel(a)
			})
		}

		// Preprocess all labels
		if (model.labels.length > 0) {
			const labelService = new LabelService()
			model.labels = model.labels.map(l => labelService.processModel(l))
		}

		return model as ITask
	}
}

