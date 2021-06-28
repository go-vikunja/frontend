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

			const task = new TaskModel({
				title: parsedTask.text,
				listId: this.$route.params.listId,
				dueDate: parsedTask.date !== null ? formatISO(parsedTask.date) : null, // I don't know why, but it all goes up in flames when I just pass in the date normally.
				priority: parsedTask.priority,
				assignees: parsedTask.assignees.map(a => new UserModel({username: a}))
			})
			return this.taskService.create(task)
				.then(task => {

					if (parsedTask.labels.length > 0) {

						let labelAddsToWaitFor = []

						const addLabelToTask = label => {
							const labelTask = new LabelTask({
								taskId: task.id,
								labelId: label.id,
							})
							return this.labelTaskService.create(labelTask)
								.then(result => {
									task.labels.push(label)
									return Promise.resolve(result)
								})
								.catch(e => Promise.reject(e))
						}

						// Then do everything that is involved in finding, creating and adding the label to the task
						parsedTask.labels.forEach(labelTitle => {
							// Check if the label exists
							const label = Object.values(this.labels).find(l => {
								return l.title.toLowerCase() === labelTitle.toLowerCase()
							})

							// Label found, use it
							if (typeof label !== 'undefined') {
								labelAddsToWaitFor.push(addLabelToTask(label))
							} else {
								// label not found, create it
								const label = new LabelModel({title: labelTitle})
								labelAddsToWaitFor.push(this.$store.dispatch('labels/createLabel', label)
									.then(res => {
										return addLabelToTask(res)
									})
									.catch(e => Promise.reject(e))
								)
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
				.catch(e => Promise.reject(e))
		},
	},
}
