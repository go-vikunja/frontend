<template>
	<create-edit
		:title="$t('list.edit.header')"
		primary-icon=""
		:primary-label="$t('misc.save')"
		@primary="save"
		:tertary="$t('misc.delete')"
		@tertary="$router.push({ name: 'list.list.settings.delete', params: { id: $route.params.listId } })"
	>
		<div class="field">
			<label class="label" for="listtext">{{ $t('list.title') }}</label>
			<div class="control">
				<input
					:class="{ 'disabled': listService.loading}"
					:disabled="listService.loading"
					@keyup.enter="save"
					class="input"
					id="listtext"
					:placeholder="$t('list.edit.titlePlaceholder')"
					type="text"
					v-focus
					v-model="list.title"/>
			</div>
		</div>
		<div class="field">
			<label
				class="label"
				for="listtext"
				v-tooltip="$t('list.edit.identifierTooltip')">
				{{ $t('list.edit.identifier') }}
			</label>
			<div class="control">
				<input
					:class="{ 'disabled': listService.loading}"
					:disabled="listService.loading"
					@keyup.enter="save"
					class="input"
					id="listtext"
					:placeholder="$t('list.edit.identifierPlaceholder')"
					type="text"
					v-focus
					v-model="list.identifier"/>
			</div>
		</div>
		<div class="field">
			<label class="label" for="listdescription">{{ $t('list.edit.description') }}</label>
			<div class="control">
				<editor
					:class="{ 'disabled': listService.loading}"
					:disabled="listService.loading"
					:preview-is-default="false"
					id="listdescription"
					:placeholder="$t('list.edit.descriptionPlaceholder')"
					v-model="list.description"
				/>
			</div>
		</div>
		<div class="field">
			<label class="label">{{ $t('list.edit.color') }}</label>
			<div class="control">
				<color-picker v-model="list.hexColor"/>
			</div>
		</div>

	</create-edit>
</template>

<script>
import ListModel from '@/models/list'
import ListService from '@/services/list'
import ColorPicker from '@/components/input/colorPicker'
import LoadingComponent from '@/components/misc/loading'
import ErrorComponent from '@/components/misc/error'
import ListDuplicateService from '@/services/listDuplicateService'
import {CURRENT_LIST} from '@/store/mutation-types'
import CreateEdit from '@/components/misc/create-edit'

export default {
	name: 'list-setting-edit',
	data() {
		return {
			list: ListModel,
			listService: ListService,
		}
	},
	components: {
		CreateEdit,
		ColorPicker,
		editor: () => ({
			component: import(/* webpackChunkName: "editor" */ '@/components/input/editor'),
			loading: LoadingComponent,
			error: ErrorComponent,
			timeout: 60000,
		}),
	},
	created() {
		this.listService = new ListService()
		this.listDuplicateService = new ListDuplicateService()
		this.loadList()
	},
	methods: {
		loadList() {
			const list = new ListModel({id: this.$route.params.listId})

			this.listService.get(list)
				.then(r => {
					this.$set(this, 'list', r)
					this.$store.commit(CURRENT_LIST, r)
					this.setTitle(this.$t('list.edit.title', {list: this.list.title}))
				})
				.catch(e => {
					this.error(e)
				})
		},
		save() {
			this.$store.dispatch('lists/updateList', this.list)
				.then(() => {
					this.success({message: this.$t('list.edit.success')})
					this.$router.back()
				})
				.catch(e => {
					this.error(e)
				})
		},
	},
}
</script>
