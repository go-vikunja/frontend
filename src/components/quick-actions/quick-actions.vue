<template>
	<modal v-if="active">
		<div class="card p-4">
			<multiselect
				placeholder="What do you want to do?"
				:search-results="results"
				label="title"
				@search="search"
				:inline="true"
				:show-empty="false"
				@select="select"
				:search-delay="0"
			/>
		</div>
	</modal>
</template>

<script>
import Multiselect from '@/components/input/multiselect'

import TaskService from '@/services/task'

const TYPE_LIST = 'list'
const TYPE_TASK = 'task'
const TYPE_ACTION = 'action'

export default {
	name: 'quick-actions',
	components: {
		Multiselect,
	},
	data() {
		return {
			query: '',
			availableActions: [
				{
					title: 'New task',
				},
				{
					title: 'New list',
				},
				{
					title: 'New namespace',
				},
				{
					title: 'New Team',
				},
			],
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
				.map(l => {
					l.type = TYPE_LIST
					return l
				})

			const actions = this.availableActions
				.filter(a => a.title.includes(this.query.toLowerCase()))
				.map(a => {
					a.type = TYPE_ACTION
					return a
				})

			return [...actions, ...lists, ...this.foundTasks, ...this.foundTeams]
		},
		nothing() {
			return this.search === '' || Object.keys(this.results).length === 0
		},
	},
	created() {
		this.taskService = new TaskService()
	},
	methods: {
		search(query) {
			this.query = query
			this.searchTasks(query)
		},
		searchTasks(query) {
			if (this.taskSearchTimeout !== null) {
				clearTimeout(this.taskSearchTimeout)
				this.taskSearchTimeout = null
			}

			this.taskSearchTimeout = setTimeout(() => {
				this.taskService.getAll({}, {s: query})
					.then(r => {
						r = r.map(t => {
							t.type = TYPE_TASK
							return t
						})
						this.$set(this, 'foundTasks', r)
					})
			}, 150)
		},
		select(e) {
			switch (e.type) {
				case TYPE_LIST:
					this.$router.push({name: 'list.index', params: {listId: e.id}})
					break
				case TYPE_TASK:
					this.$router.push({name: 'task.detail', params: {id: e.id}})
					break
				case TYPE_ACTION:
					break
			}
		},
	},
}
</script>
