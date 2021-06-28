import {parseTaskText} from '@/helpers/parseTaskText'
import TaskModel from '@/models/task'
import {formatISO} from 'date-fns'
import UserModel from '@/models/user'
import LabelTask from '@/models/labelTask'
import LabelModel from '@/models/label'
import LabelTaskService from '@/services/labelTask'
import {mapState} from 'vuex'

export default {
	data() {
		return {
			labelTaskService: LabelTaskService,
		}
	},
	created() {
		this.labelTaskService = new LabelTaskService()
	},
	computed: mapState({
		labels: state => state.labels.labels,
	}),
	methods: {
		createNewTask(newTaskTitle) {
			const parsedTask = parseTaskText(newTaskTitle)
			console.log(parsedTask.date)

			const task = new TaskModel({
				title: parsedTask.text,
				listId: this.$route.params.listId,
				dueDate: parsedTask.date !== null ? formatISO(parsedTask.date) : null, // I don't know why, but it all goes up in flames when I just pass in the date normally.
				priority: parsedTask.priority,
				assignees: parsedTask.assignees.map(a => new UserModel({username: a}))
			})
			return this.taskService.create(task)
				.then(task => {

					// The first element will always contain the title, even if there is no occurrence of ~
					if (parsedTask.labels.length > 1) {

						// First, create an unresolved promise for each entry in the array to wait
						// until all labels are added to update the task title once again
						let labelAddings = []
						let labelAddsToWaitFor = []
						parsedTask.labels.forEach((p, index) => {
							if (index < 1) {
								return
							}

							labelAddsToWaitFor.push(new Promise((resolve, reject) => {
								labelAddings.push({resolve: resolve, reject: reject})
							}))
						})

						const addLabelToTask = (label, index) => {
							const labelTask = new LabelTask({
								taskId: task.id,
								labelId: label.id,
							})
							this.labelTaskService.create(labelTask)
								.then(result => {
									task.labels.push(label)
									// Make the promise done (the one with the index 0 does not exist)
									labelAddings[index - 1].resolve(result)
								})
								.catch(e => {
									this.error(e)
								})
						}

						// Then do everything that is involved in finding, creating and adding the label to the task
						parsedTask.labels.forEach((labelTitle, index) => {
							// Check if the label exists
							const label = Object.values(this.labels).find(l => {
								return l.title.toLowerCase() === labelTitle.toLowerCase()
							})

							// Label found, use it
							if (typeof label !== 'undefined') {
								addLabelToTask(label, index)
							} else {
								// label not found, create it
								const label = new LabelModel({title: labelTitle})
								this.$store.dispatch('labels/createLabel', label)
									.then(res => {
										addLabelToTask(res, index)
									})
									.catch(e => {
										this.error(e)
									})
							}
						})

						// This waits until all labels are created and added to the task
						return Promise.all(labelAddsToWaitFor)
							.then(() => {
								return Promise.resolve(task)
							})
					}

					return Promise.resolve(task)
				})
				.catch(e => {
					this.error(e)
					return Promise.reject(e)
				})
		},
	},
}
