<template>
	<migration
		:identifier="identifier"
		:name="name"
	/>
</template>

<script>
import Migration from '../../components/migrator/migration'
import router from '../../router'

export default {
	name: 'migrateService',
	components: {
		Migration,
	},
	data() {
		return {
			name: '',
			identifier: '',
		}
	},
	mounted() {
		this.setTitle(this.$t('migrate.titleService', {name: this.name}))
	},
	created() {
		switch (this.$route.params.service) {
			case 'wunderlist':
				this.name = 'Wunderlist'
				this.identifier = 'wunderlist'
				break
			case 'todoist':
				this.name = 'Todoist'
				this.identifier = 'todoist'
				break
			case 'trello':
				this.name = 'Trello'
				this.identifier = 'trello'
				break
			case 'microsoft-todo':
				this.name = 'Microsoft Todo'
				this.identifier = 'microsoft-todo'
				break
			default:
				router.push({name: '404'})
		}
	},
}
</script>

