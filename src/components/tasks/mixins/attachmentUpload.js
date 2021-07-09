import AttachmentModel from '../../../models/attachment'
import AttachmentService from '../../../services/attachment'
import {generateAttachmentUrl} from '@/helpers/generateAttachmentUrl'

export default {
	methods: {
		attachmentUpload(file, onSuccess) {
			const files = [file]

			const attachmentService = new AttachmentService()

			this.createAttachment(attachmentService, files, onSuccess)
		},
		createAttachment(attachmentService, files, onSuccess = () => {}) {
			const attachmentModel = new AttachmentModel({taskId: this.taskId})
			attachmentService.create(attachmentModel, files)
				.then(r => {
					console.debug(`Uploaded attachments for task ${this.taskId}, response was`, r)
					if (r.success !== null) {
						r.success.forEach(a => {
							this.$store.dispatch('tasks/addTaskAttachment', {
								taskId: this.taskId,
								attachment: a,
							})
							onSuccess(generateAttachmentUrl(this.taskId, a.id))
						})
					}
					if (r.errors !== null) {
						r.errors.forEach(m => {
							this.error(m)
						})
					}
				})
				.catch(e => {
					this.error(e)
				})
		},
	},
}