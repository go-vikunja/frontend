<template>
	<div
		:class="{ 'is-loading': taskCollectionService.loading}"
		class="loader-container is-max-width-desktop list-view">
		<div class="filter-container" v-if="list.isSavedFilter && !list.isSavedFilter()">
			<div class="items">
				<div class="search">
					<div :class="{ 'hidden': !showTaskSearch }" class="field has-addons">
						<div class="control has-icons-left has-icons-right">
							<input
								@blur="hideSearchBar()"
								@keyup.enter="searchTasks"
								class="input"
								:placeholder="$t('misc.search')"
								type="text"
								v-focus
								v-model="searchTerm"/>
							<span class="icon is-left">
								<icon icon="search"/>
							</span>
						</div>
						<div class="control">
							<x-button
								:loading="taskCollectionService.loading"
								@click="searchTasks"
								:shadow="false"
							>
								{{ $t('misc.search') }}
							</x-button>
						</div>
					</div>
					<x-button
						@click="showTaskSearch = !showTaskSearch"
						icon="search"
						type="secondary"
						v-if="!showTaskSearch"
					/>
				</div>
				<x-button
					@click.prevent.stop="showTaskFilter = !showTaskFilter"
					type="secondary"
					icon="filter"
				>
					{{ $t('filters.title') }}
				</x-button>
			</div>
			<filter-popup
				@change="loadTasks(1)"
				:visible="showTaskFilter"
				v-model="params"
			/>
		</div>

		<card :padding="false" :has-content="false" class="has-overflow">
			<div class="field task-add" v-if="!list.isArchived && canWrite && list.id > 0">
				<div class="field is-grouped">
					<p :class="{ 'is-loading': taskService.loading}" class="control has-icons-left is-expanded">
						<input
							:class="{ 'disabled': taskService.loading}"
							@keyup.enter="addTask()"
							class="input"
							:placeholder="$t('list.list.addPlaceholder')"
							type="text"
							v-focus
							v-model="newTaskText"
							ref="newTaskInput"
						/>
						<span class="icon is-small is-left">
						<icon icon="tasks"/>
					</span>
					</p>
					<p class="control">
						<x-button
							:disabled="newTaskText.length === 0"
							@click="addTask()"
							icon="plus"
						>
							{{ $t('list.list.add') }}
						</x-button>
					</p>
				</div>
				<p class="help is-danger" v-if="showError && newTaskText === ''">
					{{ $t('list.list.addTitleRequired') }}
				</p>
			</div>

			<nothing v-if="ctaVisible && tasks.length === 0 && !taskCollectionService.loading">
				{{ $t('list.list.empty') }}
				<a @click="$refs.newTaskInput.focus()">
					{{ $t('list.list.newTaskCta') }}
				</a>
			</nothing>

			<div class="tasks-container">
				<div :class="{'short': isTaskEdit}" class="tasks mt-0" v-if="tasks && tasks.length > 0">
					<single-task-in-list
						:show-list-color="false"
						:disabled="!canWrite"
						:key="t.id"
						:the-task="t"
						@taskUpdated="updateTasks"
						task-detail-route="task.detail"
						v-for="t in tasks"
					>
						<div @click="editTask(t.id)" class="icon settings" v-if="!list.isArchived && canWrite">
							<icon icon="pencil-alt"/>
						</div>
					</single-task-in-list>
				</div>
				<card
					v-if="isTaskEdit"
					class="taskedit mt-0" :title="$t('list.list.editTask')" :has-close="true"
					@close="() => isTaskEdit = false"
					:shadow="false">
					<edit-task :task="taskEditTask"/>
				</card>
			</div>

			<nav
				aria-label="pagination"
				class="pagination is-centered p-4"
				role="navigation"
				v-if="taskCollectionService.totalPages > 1">
				<router-link
					:disabled="currentPage === 1"
					:to="getRouteForPagination(currentPage - 1)"
					class="pagination-previous"
					tag="button">
					{{ $t('misc.previous') }}
				</router-link>
				<router-link
					:disabled="currentPage === taskCollectionService.totalPages"
					:to="getRouteForPagination(currentPage + 1)"
					class="pagination-next"
					tag="button">
					{{ $t('misc.next') }}
				</router-link>
				<ul class="pagination-list">
					<template v-for="(p, i) in pages">
						<li :key="'page'+i" v-if="p.isEllipsis"><span class="pagination-ellipsis">&hellip;</span></li>
						<li :key="'page'+i" v-else>
							<router-link
								:aria-label="'Goto page ' + p.number"
								:class="{'is-current': p.number === currentPage}"
								:to="getRouteForPagination(p.number)"
								class="pagination-link">
								{{ p.number }}
							</router-link>
						</li>
					</template>
				</ul>
			</nav>
		</card>

		<!-- This router view is used to show the task popup while keeping the kanban board itself -->
		<transition name="modal">
			<router-view/>
		</transition>

	</div>
</template>

<script>
import TaskService from '../../../services/task'
import TaskModel from '../../../models/task'
import LabelTaskService from '../../../services/labelTask'
import LabelTask from '../../../models/labelTask'
import LabelModel from '../../../models/label'
import UserModel from '@/models/user'

import EditTask from '../../../components/tasks/edit-task'
import SingleTaskInList from '../../../components/tasks/partials/singleTaskInList'
import taskList from '../../../components/tasks/mixins/taskList'
import {saveListView} from '@/helpers/saveListView'
import Rights from '../../../models/rights.json'
import {mapState} from 'vuex'
import FilterPopup from '@/components/list/partials/filter-popup'
import Nothing from '@/components/misc/nothing'
import {parseTaskText} from '@/helpers/parseTaskText'
import {formatISO} from 'date-fns'

export default {
	name: 'List',
	data() {
		return {
			taskService: TaskService,
			isTaskEdit: false,
			taskEditTask: TaskModel,
			newTaskText: '',

			showError: false,
			labelTaskService: LabelTaskService,

			ctaVisible: false,
		}
	},
	mixins: [
		taskList,
	],
	components: {
		Nothing,
		FilterPopup,
		SingleTaskInList,
		EditTask,
	},
	created() {
		this.taskService = new TaskService()
		this.labelTaskService = new LabelTaskService()

		// Save the current list view to local storage
		// We use local storage and not vuex here to make it persistent across reloads.
		saveListView(this.$route.params.listId, this.$route.name)
	},
	computed: mapState({
		canWrite: state => state.currentList.maxRight > Rights.READ,
		list: state => state.currentList,
	}),
	mounted() {
		this.$nextTick(() => this.ctaVisible = true)
	},
	methods: {
		// This function initializes the tasks page and loads the first page of tasks
		initTasks(page, search = '') {
			this.taskEditTask = null
			this.isTaskEdit = false
			this.loadTasks(page, search)
		},
		addTask() {
			if (this.newTaskText === '') {
				this.showError = true
				return
			}
			this.showError = false

			const parsedTask = parseTaskText(this.newTaskText)

			const task = new TaskModel({
				title: parsedTask.text,
				listId: this.$route.params.listId,
				dueDate: formatISO(parsedTask.date), // I don't know why, but it all goes up in flames when I just pass in the date normally.
				priority: parsedTask.priority,
				assignees: parsedTask.assignees.map(a => new UserModel({username: a}))
			})
			this.taskService.create(task)
				.then(task => {
					this.tasks.push(task)
					this.sortTasks()
					this.newTaskText = ''

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

						// Then do everything that is involved in finding, creating and adding the label to the task
						parsedTask.labels.forEach((labelTitle, index) => {
							// Check if the label exists
							const label = Object.values(this.$store.state.labels.labels).find(l => {
								return l.title.toLowerCase() === labelTitle.toLowerCase()
							})

							// Label found, use it
							if (typeof label !== 'undefined') {
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
							} else {
								// label not found, create it
								const label = new LabelModel({title: labelTitle})
								this.$store.dispatch('labels/createLabel', label)
									.then(res => {
										const labelTask = new LabelTask({
											taskId: task.id,
											labelId: res.id,
										})
										this.labelTaskService.create(labelTask)
											.then(result => {
												task.labels.push(res)
												// Make the promise done (the one with the index 0 does not exist)
												labelAddings[index - 1].resolve(result)
											})
											.catch(e => {
												this.error(e)
											})
									})
									.catch(e => {
										this.error(e)
									})
							}
						})

						// This waits until all labels are created and added to the task
						Promise.all(labelAddsToWaitFor)
					}
				})
				.catch(e => {
					this.error(e)
				})
		},
		editTask(id) {
			// Find the selected task and set it to the current object
			let theTask = this.getTaskById(id) // Somehow this does not work if we directly assign this to this.taskEditTask
			this.taskEditTask = theTask
			this.isTaskEdit = true
		},
		getTaskById(id) {
			for (const t in this.tasks) {
				if (this.tasks[t].id === parseInt(id)) {
					return this.tasks[t]
				}
			}
			return {} // FIXME: This should probably throw something to make it clear to the user noting was found
		},
		updateTasks(updatedTask) {
			for (const t in this.tasks) {
				if (this.tasks[t].id === updatedTask.id) {
					this.$set(this.tasks, t, updatedTask)
					break
				}
			}
			this.sortTasks()
		},
	},
}
</script>