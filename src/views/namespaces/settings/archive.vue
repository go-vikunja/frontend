<template>
	<modal
		@close="$router.back()"
		@submit="archiveNamespace()"
	>
		<span slot="header">{{ title }}</span>
		<p slot="text" v-if="namespace.isArchived">
			{{ $t('namespace.archive.unarchiveText') }}
		</p>
		<p slot="text" v-else>
			{{ $t('namespace.archive.archiveText') }}
		</p>
	</modal>
</template>

<script>
import NamespaceService from '@/services/namespace'

export default {
	name: 'namespace-setting-archive',
	data() {
		return {
			namespaceService: NamespaceService,
			namespace: null,
			title: ''
		}
	},
	created() {
		this.namespaceService = new NamespaceService()
		this.namespace = this.$store.getters['namespaces/getNamespaceById'](this.$route.params.id)
		this.title = this.namespace.isArchived ?
			this.$t('namespace.archive.titleUnarchive', { namespace: this.namespace.title }) :
			this.$t('namespace.archive.titleArchive', { namespace: this.namespace.title })
		this.setTitle(this.title)
	},
	methods: {
		archiveNamespace() {

			this.namespace.isArchived = !this.namespace.isArchived

			this.namespaceService.update(this.namespace)
				.then(r => {
					this.$store.commit('namespaces/setNamespaceById', r)
					this.success({message: this.$t('namespace.archive.success')})
				})
				.catch(e => {
					this.error(e)
				})
				.finally(() => {
					this.$router.back()
				})
		},
	},
}
</script>
