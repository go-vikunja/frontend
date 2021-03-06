<template>
	<div class="modal-mask hint-modal">
		<div @click.self="$router.back()" class="modal-container">
			<div class="modal-content">
				<card class="has-background-white has-no-shadow" :title="$t('filters.create.title')">
					<p>
						{{ $t('filters.create.description') }}
					</p>
					<div class="field">
						<label class="label" for="title">{{ $t('filters.attributes.title') }}</label>
						<div class="control">
							<input
								v-model="savedFilter.title"
								:class="{ 'disabled': savedFilterService.loading}"
								:disabled="savedFilterService.loading"
								class="input"
								id="Title"
								:placeholder="$t('filters.attributes.titlePlaceholder')"
								type="text"
								v-focus
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="description">{{ $t('filters.attributes.description') }}</label>
						<div class="control">
							<editor
								v-model="savedFilter.description"
								:class="{ 'disabled': savedFilterService.loading}"
								:disabled="savedFilterService.loading"
								:preview-is-default="false"
								id="description"
								:placeholder="$t('filters.attributes.descriptionPlaceholder')"
								v-if="editorActive"
							/>
						</div>
					</div>
					<div class="field">
						<label class="label" for="filters">{{ $t('filters.title') }}</label>
						<div class="control">
							<filters
								:class="{ 'disabled': savedFilterService.loading}"
								:disabled="savedFilterService.loading"
								class="has-no-shadow has-no-border"
								v-model="filters"
							/>
						</div>
					</div>
					<x-button
						:loading="savedFilterService.loading"
						:disabled="savedFilterService.loading"
						@click="create()"
						class="is-fullwidth"
					>
						{{ $t('filters.create.action') }}
					</x-button>
				</card>
			</div>
		</div>
	</div>
</template>

<script>
import LoadingComponent from '@/components/misc/loading'
import ErrorComponent from '@/components/misc/error'
import Filters from '@/components/list/partials/filters'
import SavedFilterService from '@/services/savedFilter'
import SavedFilterModel from '@/models/savedFilter'

export default {
	name: 'CreateSavedFilter',
	data() {
		return {
			editorActive: false,
			filters: {
				sort_by: ['done', 'id'],
				order_by: ['asc', 'desc'],
				filter_by: ['done'],
				filter_value: ['false'],
				filter_comparator: ['equals'],
				filter_concat: 'and',
				filter_include_nulls: true,
			},
			savedFilterService: SavedFilterService,
			savedFilter: SavedFilterModel,
		}
	},
	components: {
		Filters,
		editor: () => ({
			component: import(/* webpackChunkName: "editor" */ '../../components/input/editor'),
			loading: LoadingComponent,
			error: ErrorComponent,
			timeout: 60000,
		}),
	},
	created() {
		this.editorActive = false
		this.$nextTick(() => this.editorActive = true)

		this.savedFilterService = new SavedFilterService()
		this.savedFilter = new SavedFilterModel()
	},
	methods: {
		create() {
			this.savedFilter.filters = this.filters
			this.savedFilterService.create(this.savedFilter)
				.then(r => {
					this.$store.dispatch('namespaces/loadNamespaces')
					this.$router.push({name: 'list.index', params: {listId: r.getListId()}})
				})
				.catch(e => this.error(e))
		},
	},
}
</script>
