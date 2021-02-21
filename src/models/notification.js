import AbstractModel from '@/models/abstractModel'
import {parseDateOrNull} from '@/helpers/parseDateOrNull'

export default class NotificationModel extends AbstractModel {
	constructor(data) {
		super(data)

		this.created = new Date(this.created)
		this.readAt = parseDateOrNull(this.readAt)
	}

	defaults() {
		return {
			id: 0,
			name: '',
			notification: null,
			read: false,
			readAt: null,
		}
	}
}
