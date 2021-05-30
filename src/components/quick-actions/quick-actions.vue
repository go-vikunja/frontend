<template>
	<modal v-if="active" class="quick-actions">
		<div class="card">
			<div class="action-input" :class="{'has-action': selectedAction !== null}">
				<div class="selected-action tag" v-if="selectedAction !== null">
					{{ selectedAction.title }}
				</div>
				<input
					v-focus
					class="input"
					:class="{'is-loading': loading}"
					v-model="query"
					:placeholder="placeholder"
					@keyup="search"
					ref="searchInput"
					@keydown.down.prevent="() => select(0, 0)"
					@keyup.prevent.delete="() => selectedAction = null"
				/>
			</div>

			<div class="results">
				<div v-for="(r, k) in results" :key="k" class="result">
					<span class="result-title">
						{{ r.title }}
					</span>
					<div class="result-items">
						<button
							v-for="(i, key) in r.items"
							:key="key"
							:ref="`result-${k}_${key}`"
							@keydown.up.prevent="() => select(k, key - 1)"
							@keydown.down.prevent="() => select(k, key + 1)"
							@click.prevent.stop="() => doAction(r.type, i)"
							@keyup.prevent.enter="() => doAction(r.type, i)"
							@keyup.prevent.esc="() => $refs.searchInput.focus()"
						>
							{{ i.title }}
						</button>
					</div>
				</div>
			</div>
		</div>
	</modal>
</template>

<script>
import TaskService from '@/services/task'

const TYPE_LIST = 'list'
const TYPE_TASK = 'task'
const TYPE_ACTION = 'action'
const TYPE_TEAM = 'team'

const ACTION_NEW_TASK = 'newTask'
const ACTION_NEW_LIST = 'newList'
const ACTION_NEW_NAMESPACE = 'newNamespace'
const ACTION_NEW_TEAM = 'newTeam'

export default {
	name: 'quick-actions',
	data() {
		return {
			query: '',
			availableActions: [
				{
					title: 'New task',
					action: ACTION_NEW_TASK,
				},
				{
					title: 'New list',
					action: ACTION_NEW_LIST,
				},
				{
					title: 'New namespace',
					action: ACTION_NEW_NAMESPACE,
				},
				{
					title: 'New Team',
					action: ACTION_NEW_TEAM,
				},
			],
			selectedAction: null,

			foundTasks: [],
			taskSearchTimeout: null,
			taskService: null,

			foundTeams: [],
		}
	},
	computed: {
		active: () => true, // TODO: use state + keyboard shortcut
		results() {
			const lists = (Object.values(this.$store.state.lists).filter(l => {
				return l.title.toLowerCase().includes(this.query.toLowerCase())
			}) ?? [])

			const actions = this.availableActions
				.filter(a => a.title.toLowerCase().includes(this.query.toLowerCase()))

			return [
				{
					type: TYPE_ACTION,
					title: 'Actions',
					items: actions,
				},
				{
					type: TYPE_TASK,
					title: 'Tasks',
					items: this.foundTasks,
				},
				{
					type: TYPE_LIST,
					title: 'Lists',
					items: lists,
				},
				{
					type: TYPE_TEAM,
					title: 'Teams',
					items: this.foundTeams,
				},
			].filter(i => i.items.length > 0)
		},
		nothing() {
			return this.search === '' || Object.keys(this.results).length === 0
		},
		loading() {
			return this.taskService.loading
		},
		placeholder() {
			if (this.selectedAction !== null) {
				switch (this.selectedAction.action) {
					case ACTION_NEW_TASK:
						return 'Enter the title of the new task...'
					case ACTION_NEW_LIST:
						return 'Enter the title of the new list...'
					case ACTION_NEW_TEAM:
						return 'Enter the title of the new team...'
					case ACTION_NEW_NAMESPACE:
						return 'Enter the title of the new namespace...'
				}
			}

			return 'Type a command or search...'
		},
	},
	created() {
		this.taskService = new TaskService()
	},
	methods: {
		search() {
			this.searchTasks()
		},
		searchTasks() {
			if (this.query === '') {
				return
			}

			if (this.taskSearchTimeout !== null) {
				clearTimeout(this.taskSearchTimeout)
				this.taskSearchTimeout = null
			}

			this.taskSearchTimeout = setTimeout(() => {
				this.taskService.getAll({}, {s: this.query})
					.then(r => {
						r = r.map(t => {
							t.type = TYPE_TASK
							return t
						})
						this.$set(this, 'foundTasks', r)
					})
			}, 150)
		},
		doAction(type, item) {
			switch (type) {
				case TYPE_LIST:
					this.$router.push({name: 'list.index', params: {listId: item.id}})
					break
				case TYPE_TASK:
					this.$router.push({name: 'task.detail', params: {id: item.id}})
					break
				case TYPE_ACTION:
					this.query = ''
					this.selectedAction = item
					this.$refs.searchInput.focus()
					break
			}
		},
		select(parentIndex, index) {

			if (index < 0 && parentIndex === 0) {
				this.$refs.searchInput.focus()
				return
			}

			if (index < 0) {
				parentIndex--
				index = this.results[parentIndex].items.length - 1
			}

			let elems = this.$refs[`result-${parentIndex}_${index}`]

			if (this.results[parentIndex].items.length === index) {
				elems = this.$refs[`result-${parentIndex + 1}_0`]
			}

			if (typeof elems === 'undefined' || elems.length === 0) {
				return
			}

			if (Array.isArray(elems)) {
				elems[0].focus()
				return
			}

			elems.focus()
		},
	},
}
</script>
