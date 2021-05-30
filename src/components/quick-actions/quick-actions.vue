<template>
	<modal v-if="active">
		<div class="card p-4">
			<input
				type="text"
				class="input"
				placeholder="What do you want to do?"
				v-focus
				@keyup="run"
				v-model="search"/>

			<div v-if="search !== ''">
				<ul>
					<li v-for="l in lists" :key="l.id">{{ l.title }}</li>
				</ul>
				<nothing v-if="nothing">
					No results found.
				</nothing>
			</div>
		</div>
	</modal>
</template>

<script>

import Nothing from '@/components/misc/nothing'
export default {
	name: 'quick-actions',
	components: {Nothing},
	data() {
		return {
			search: '',
			results: [],
		}
	},
	computed: {
		active: () => true, // TODO: use state + keyboard shortcut
		lists() {
			return Object.fromEntries(Object.entries(this.$store.state.lists).filter(l => {
				return l[1].title.toLowerCase().includes(this.search.toLowerCase())
			}))
		},
		nothing() {
			return this.search === '' || Object.keys(this.lists).length === 0
		},
	},
	methods: {
		run() {
			console.log('run', this.search)
		}
	},
}
</script>
