import type { Module } from 'vuex'
import router from '@/router'
import {formatISO} from 'date-fns'

import TaskService from '@/services/task'
import TaskAssigneeService from '@/services/taskAssignee'
import LabelTaskService from '@/services/labelTask'

import {HAS_TASKS} from '../mutation-types'
import {setLoading} from '../helper'
import {getQuickAddMagicMode} from '@/helpers/quickAddMagicMode'
import {parseTaskText} from '@/modules/parseTaskText'

import TaskAssigneeModel from '@/models/taskAssignee'
import LabelTaskModel from '@/models/labelTask'
import TaskModel from '@/models/task'
import LabelTask from '@/models/labelTask'
import LabelModel from '@/models/label'

import type {ILabel} from '@/modelTypes/ILabel'
import type {ITask} from '@/modelTypes/ITask'
import type { IUser } from '@/modelTypes/IUser'
import type { IAttachment } from '@/modelTypes/IAttachment'
import type { IList } from '@/modelTypes/IList'

import type { RootStoreState, TaskState } from '@/store/types'
import {useLabelStore} from '@/stores/labels'
import {useListStore} from '@/stores/lists'
import {playPop} from '@/helpers/playPop'
import {findPropertyByValue} from '@/helpers/findPropertyByValue'
import {findAssignees} from '@/helpers/findAssignees'

// Check if the label exists
function validateLabel(labels: ILabel[], label: ILabel) {
	return findPropertyByValue(labels, 'title', label)
}

async function addLabelToTask(task: ITask, label: ILabel) {
	const labelTask = new LabelTask({
		taskId: task.id,
		labelId: label.id,
	})
	const labelTaskService = new LabelTaskService()
	const response = await labelTaskService.create(labelTask)
	task.labels.push(label)
	return response
}

const tasksStore : Module<TaskState, RootStoreState>= {
	namespaced: true,
	state: () => ({}),
	actions: {
		async loadTasks(ctx, params) {
			const taskService = new TaskService()

			const cancel = setLoading(ctx, 'tasks')
			try {
				const tasks = await taskService.getAll({}, params)
				ctx.commit(HAS_TASKS, tasks.length > 0, {root: true})
				return tasks
			} finally {
				cancel()
			}
		},

		async update(ctx, task: ITask) {
			const cancel = setLoading(ctx, 'tasks')

			const taskService = new TaskService()
			try {
				const updatedTask = await taskService.update(task)
				ctx.commit('kanban/setTaskInBucket', updatedTask, {root: true})
				if (task.done) {
					playPop()
				}
				return updatedTask
			} finally {
				cancel()
			}
		},

		async delete(ctx, task: ITask) {
			const taskService = new TaskService()
			const response = await taskService.delete(task)
			ctx.commit('kanban/removeTaskInBucket', task, {root: true})
			return response
		},

		// Adds a task attachment in store.
		// This is an action to be able to commit other mutations
		addTaskAttachment(ctx, {
			taskId,
			attachment,
		}: {
			taskId: ITask['id']
			attachment: IAttachment
		}) {
			const t = ctx.rootGetters['kanban/getTaskById'](taskId)
			if (t.task !== null) {
				const attachments = [
					...t.task.attachments,
					attachment,
				]

				const newTask = {
					...t,
					task: {
						...t.task,
						attachments,
					},
				}
				ctx.commit('kanban/setTaskInBucketByIndex', newTask, {root: true})
			}
			ctx.commit('attachments/add', attachment, {root: true})
		},

		async addAssignee(ctx, {
			user,
			taskId,
		}: {
			user: IUser,
			taskId: ITask['id']
		}) {
			const taskAssignee = new TaskAssigneeModel({userId: user.id, taskId: taskId})

			const taskAssigneeService = new TaskAssigneeService()
			const r = await taskAssigneeService.create(taskAssignee)
			const t = ctx.rootGetters['kanban/getTaskById'](taskId)
			if (t.task === null) {
				// Don't try further adding a label if the task is not in kanban
				// Usually this means the kanban board hasn't been accessed until now.
				// Vuex seems to have its difficulties with that, so we just log the error and fail silently.
				console.debug('Could not add assignee to task in kanban, task not found', t)
				return r
			}

			const assignees = [
				...t.task.assignees,
				user,
			]

			ctx.commit('kanban/setTaskInBucketByIndex', {
				...t,
				task: {
					...t.task,
					assignees,
				},
			}, {root: true})
			return r
		},

		async removeAssignee(ctx, {
			user,
			taskId,
		}: {
			user: IUser,
			taskId: ITask['id']
		}) {
			const taskAssignee = new TaskAssigneeModel({userId: user.id, taskId: taskId})

			const taskAssigneeService = new TaskAssigneeService()
			const response = await taskAssigneeService.delete(taskAssignee)
			const t = ctx.rootGetters['kanban/getTaskById'](taskId)
			if (t.task === null) {
				// Don't try further adding a label if the task is not in kanban
				// Usually this means the kanban board hasn't been accessed until now.
				// Vuex seems to have its difficulties with that, so we just log the error and fail silently.
				console.debug('Could not remove assignee from task in kanban, task not found', t)
				return response
			}

			const assignees = t.task.assignees.filter(({ id }) => id !== user.id)

			ctx.commit('kanban/setTaskInBucketByIndex', {
				...t,
				task: {
					...t.task,
					assignees,
				},
			}, {root: true})
			return response

		},

		async addLabel(ctx, {
			label,
			taskId,
		} : {
			label: ILabel,
			taskId: ITask['id']
		}) {
			const labelTask = new LabelTaskModel({taskId, labelId: label.id})

			const labelTaskService = new LabelTaskService()
			const r = await labelTaskService.create(labelTask)
			const t = ctx.rootGetters['kanban/getTaskById'](taskId)
			if (t.task === null) {
				// Don't try further adding a label if the task is not in kanban
				// Usually this means the kanban board hasn't been accessed until now.
				// Vuex seems to have its difficulties with that, so we just log the error and fail silently.
				console.debug('Could not add label to task in kanban, task not found', t)
				return r
			}

			const labels = [
				...t.task.labels,
				label,
			]

			ctx.commit('kanban/setTaskInBucketByIndex', {
				...t,
				task: {
					...t.task,
					labels,
				},
			}, {root: true})

			return r
		},

		async removeLabel(ctx, {label, taskId}) {
			const labelTask = new LabelTaskModel({taskId, labelId: label.id})

			const labelTaskService = new LabelTaskService()
			const response = await labelTaskService.delete(labelTask)
			const t = ctx.rootGetters['kanban/getTaskById'](taskId)
			if (t.task === null) {
				// Don't try further adding a label if the task is not in kanban
				// Usually this means the kanban board hasn't been accessed until now.
				// Vuex seems to have its difficulties with that, so we just log the error and fail silently.
				console.debug('Could not remove label from task in kanban, task not found', t)
				return response
			}

			// Remove the label from the list
			const labels = t.task.labels.filter(({ id }) => id !== label.id)

			ctx.commit('kanban/setTaskInBucketByIndex', {
				...t,
				task: {
					...t.task,
					labels,
				},
			}, {root: true})

			return response
		},

		// Do everything that is involved in finding, creating and adding the label to the task
		async addLabelsToTask(_, { task, parsedLabels }) {
			if (parsedLabels.length <= 0) {
				return task
			}

			const labelStore = useLabelStore()

			const labelAddsToWaitFor = parsedLabels.map(async labelTitle => {
				let label = validateLabel(labelStore.labels, labelTitle)
				if (typeof label === 'undefined') {
					// label not found, create it
					const labelModel = new LabelModel({title: labelTitle})
					label = await labelStore.createLabel(labelModel)
				}

				return addLabelToTask(task, label)
			})

			// This waits until all labels are created and added to the task
			await Promise.all(labelAddsToWaitFor)
			return task
		},

		findListId(_, { list: listName, listId }: {
			list: string,
			listId: IList['id']
		}) {
			let foundListId = null
			
			// Uses the following ways to get the list id of the new task:
			//  1. If specified in quick add magic, look in store if it exists and use it if it does
			if (listName !== null) {
				const listStore = useListStore()
				const list = listStore.findListByExactname(listName)
				foundListId = list === null ? null : list.id
			}
			
			//  2. Else check if a list was passed as parameter
			if (foundListId === null && listId !== 0) {
				foundListId = listId
			}
		
			//  3. Otherwise use the id from the route parameter
			if (typeof router.currentRoute.value.params.listId !== 'undefined') {
				foundListId = parseInt(router.currentRoute.value.params.listId)
			}
			
			//  4. If none of the above worked, reject the promise with an error.
			if (typeof foundListId === 'undefined' || listId === null) {
				throw new Error('NO_LIST')
			}
		
			return foundListId
		},

		async createNewTask(ctx, { 
			title,
			bucketId,
			listId,
			position,
		} : 
			Partial<ITask>,
		) {
			const cancel = setLoading(ctx, 'tasks')
			const parsedTask = parseTaskText(title, getQuickAddMagicMode())
		
			const foundListId = await ctx.dispatch('findListId', {
				list: parsedTask.list,
				listId: listId || 0,
			})
			
			if(foundListId === null || foundListId === 0) {
				throw new Error('NO_LIST')
			}
		
			const assignees = await findAssignees(parsedTask.assignees)
			
			// I don't know why, but it all goes up in flames when I just pass in the date normally.
			const dueDate = parsedTask.date !== null ? formatISO(parsedTask.date) : null
		
			const task = new TaskModel({
				title: parsedTask.text,
				listId: foundListId,
				dueDate,
				priority: parsedTask.priority,
				assignees,
				bucketId: bucketId || 0,
				position,
			})
			task.repeatAfter = parsedTask.repeats
		
			const taskService = new TaskService()
			const createdTask = await taskService.create(task)
			const result = await ctx.dispatch('addLabelsToTask', {
				task: createdTask,
				parsedLabels: parsedTask.labels,
			})
			cancel()
			return result
		},
	},
}

export default tasksStore