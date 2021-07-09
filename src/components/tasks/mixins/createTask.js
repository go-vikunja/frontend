import {parseTaskText} from '@/helpers/parseTaskText'
import TaskModel from '@/models/task'
import {formatISO} from 'date-fns'
import LabelTask from '@/models/labelTask'
import LabelModel from '@/models/label'
import LabelTaskService from '@/services/labelTask'
import {mapState} from 'vuex'
import UserService from '@/services/user'

export default {
	data() {
		return {
			labelTaskService: LabelTaskService,
			userService: UserService,
		}
	},
	created() {
		this.labelTaskService = new LabelTaskService()
		this.userService = new UserService()
	},
	computed: mapState({
		labels: state => state.labels.labels,
	}),
	methods: {
		createNewTask(newTaskTitle, bucketId = 0, lId = 0) {
			const parsedTask = parseTaskText(newTaskTitle)
			const assignees = []

			let listId = null
			if (parsedTask.list !== null) {
				const list = this.$store.getters['lists/findListByExactname'](parsedTask.list)
				listId = list === null ? null : list.id
			}
			if (listId === null) {
				listId = lId !== 0 ? lId : this.$route.params.listId
			}

			// Separate closure because we need to wait for the results of the user search if users were entered in the
			// task create request. Because _that_ happens in a promise, we'll need something to call when it resolves.
			const createTask = () => {
				const task = new TaskModel({
					title: parsedTask.text,
					listId: listId,
					dueDate: parsedTask.date !== null ? formatISO(parsedTask.date) : null, // I don't know why, but it all goes up in flames when I just pass in the date normally.
					priority: parsedTask.priority,
					assignees: assignees,
					bucketId: bucketId,
				})
				return this.taskService.create(task)
					.then(task => {

						if (parsedTask.labels.length > 0) {

							const labelAddsToWaitFor = []

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
			}

			if (parsedTask.assignees.length > 0) {
				const searches = []
				parsedTask.assignees.forEach(a => {
					searches.push(this.userService.getAll({}, {s: a})
						.then(users => {
							const user = users.find(u => u.username.toLowerCase() === a.toLowerCase())
							if (typeof user !== 'undefined') {
								assignees.push(user)
							}
							return Promise.resolve(users)
						})
					)
				})

				return Promise.all(searches)
					.then(() => createTask())
			}

			return createTask()
		},
	},
}
