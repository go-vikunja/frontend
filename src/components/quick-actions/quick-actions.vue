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

export default {
	name: 'quick-actions',
	components: {
		Multiselect,
	},
	data() {
		return {
			query: '',
		}
	},
	computed: {
		active: () => true, // TODO: use state + keyboard shortcut
		results() {
			return Object.values(this.$store.state.lists).filter(l => {
				return l.title.toLowerCase().includes(this.query.toLowerCase())
			}) ?? []
		},
		nothing() {
			return this.search === '' || Object.keys(this.results).length === 0
		},
	},
	methods: {
		search(query) {
			this.query = query
		},
		select(e) {
			console.log('select', e)
		},
	},
}
</script>
