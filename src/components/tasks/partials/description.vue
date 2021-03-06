<template>
	<div>
		<h3>
			<span class="icon is-grey">
				<icon icon="align-left"/>
			</span>
			{{ $t('task.attributes.description') }}
			<transition name="fade">
				<span class="is-small is-inline-flex" v-if="loading && saving">
					<span class="loader is-inline-block mr-2"></span>
					{{ $t('misc.saving') }}
				</span>
				<span class="is-small has-text-success" v-if="!loading && saved">
					<icon icon="check"/>
					{{ $t('misc.saved') }}
				</span>
			</transition>
		</h3>
		<editor
			:is-edit-enabled="canWrite"
			:upload-callback="attachmentUpload"
			:upload-enabled="true"
			@change="save"
			:placeholder="$t('task.description.placeholder')"
			:empty-text="$t('task.description.empty')"
			v-model="task.description"/>
	</div>
</template>

<script>
import LoadingComponent from '@/components/misc/loading'
import ErrorComponent from '@/components/misc/error'

import {LOADING} from '@/store/mutation-types'
import {mapState} from 'vuex'

export default {
	name: 'description',
	components: {
		editor: () => ({
			component: import(/* webpackChunkName: "editor" */ '@/components/input/editor'),
			loading: LoadingComponent,
			error: ErrorComponent,
			timeout: 60000,
		}),
	},
	data() {
		return {
			task: {description: ''},
			saved: false,
			saving: false, // Since loading is global state, this variable ensures we're only showing the saving icon when saving the description.
		}
	},
	computed: mapState({
		loading: LOADING,
	}),
	props: {
		value: {
			required: true,
		},
		attachmentUpload: {
			required: true,
		},
		canWrite: {
			required: true,
		},
	},
	watch: {
		value(newVal) {
			this.task = newVal
		},
	},
	mounted() {
		this.task = this.value
	},
	methods: {
		save() {
			this.saving = true

			this.$store.dispatch('tasks/update', this.task)
				.then(() => {
					this.$emit('input', this.task)
					this.saved = true
					setTimeout(() => {
						this.saved = false
					}, 2000)
				})
				.catch(e => {
					this.error(e)
				})
				.finally(() => {
					this.saving = false
				})
		}
	},
}
</script>

