<template>
	<create-edit
		:title="title"
		primary-icon=""
		:primary-label="$t('misc.save')"
		@primary="save"
		:tertary="$t('misc.delete')"
		@tertary="$router.push({ name: 'namespace.settings.delete', params: { id: $route.params.id } })"
	>
		<form @submit.prevent="save()">
			<div class="field">
				<label class="label" for="namespacetext">{{ $t('namespace.attributes.title') }}</label>
				<div class="control">
					<input
						:class="{ 'disabled': namespaceService.loading}"
						:disabled="namespaceService.loading"
						class="input"
						id="namespacetext"
						:placeholder="$t('namespace.attributes.titlePlaceholder')"
						type="text"
						v-focus
						v-model="namespace.title"/>
				</div>
			</div>
			<div class="field">
				<label class="label" for="namespacedescription">{{ $t('namespace.attributes.description') }}</label>
				<div class="control">
					<editor
						:class="{ 'disabled': namespaceService.loading}"
						:disabled="namespaceService.loading"
						:preview-is-default="false"
						id="namespacedescription"
						:placeholder="$t('namespace.attributes.descriptionPlaceholder')"
						v-if="editorActive"
						v-model="namespace.description"
					/>
				</div>
			</div>
			<div class="field">
				<label class="label" for="isArchivedCheck">{{ $t('namespace.attributes.archived') }}</label>
				<div class="control">
					<fancycheckbox
						v-model="namespace.isArchived"
						v-tooltip="$t('namespace.archive.description')">
						{{ $t('namespace.attributes.isArchived') }}
					</fancycheckbox>
				</div>
			</div>
			<div class="field">
				<label class="label">{{ $t('namespace.attributes.color') }}</label>
				<div class="control">
					<color-picker v-model="namespace.hexColor"/>
				</div>
			</div>
		</form>
	</create-edit>
</template>

<script>
import NamespaceService from '@/services/namespace'
import NamespaceModel from '@/models/namespace'
import Fancycheckbox from '@/components/input/fancycheckbox'
import ColorPicker from '@/components/input/colorPicker'
import LoadingComponent from '@/components/misc/loading'
import ErrorComponent from '@/components/misc/error'
import CreateEdit from '@/components/misc/create-edit'

export default {
	name: 'namespace-setting-edit',
	data() {
		return {
			namespaceService: NamespaceService,
			namespace: NamespaceModel,
			editorActive: false,
			title: '',
		}
	},
	components: {
		CreateEdit,
		ColorPicker,
		Fancycheckbox,
		editor: () => ({
			component: import(/* webpackChunkName: "editor" */ '@/components/input/editor'),
			loading: LoadingComponent,
			error: ErrorComponent,
			timeout: 60000,
		}),
	},
	beforeMount() {
		this.namespace.id = this.$route.params.id
	},
	created() {
		this.namespaceService = new NamespaceService()
		this.namespace = new NamespaceModel()
		this.loadNamespace()
	},
	watch: {
		// call again the method if the route changes
		'$route': 'loadNamespace',
	},
	methods: {
		loadNamespace() {
			// This makes the editor trigger its mounted function again which makes it forget every input
			// it currently has in its textarea. This is a counter-hack to a hack inside of vue-easymde
			// which made it impossible to detect change from the outside. Therefore the component would
			// not update if new content from the outside was made available.
			// See https://github.com/NikulinIlya/vue-easymde/issues/3
			this.editorActive = false
			this.$nextTick(() => this.editorActive = true)

			const namespace = new NamespaceModel({id: this.$route.params.id})
			this.namespaceService.get(namespace)
				.then(r => {
					this.$set(this, 'namespace', r)
					// This will trigger the dynamic loading of components once we actually have all the data to pass to them
					this.manageTeamsComponent = 'manageSharing'
					this.manageUsersComponent = 'manageSharing'
					this.title = this.$t('namespace.edit.title', {namespace: r.title})
					this.setTitle(this.title)
				})
				.catch(e => {
					this.error(e)
				})
		},
		save() {
			this.namespaceService.update(this.namespace)
				.then(r => {
					// Update the namespace in the parent
					this.$store.commit('namespaces/setNamespaceById', r)
					this.success({message: this.$t('namespace.edit.success')})
					this.$router.back()
				})
				.catch(e => {
					this.error(e)
				})
		},
	},
}
</script>