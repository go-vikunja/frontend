<template>
	<notifications position="bottom left" :max="2" class="global-notification">
		<template slot="body" slot-scope="props">
			<div
				:class="[
					'vue-notification-template',
					'vue-notification',
					props.item.type,
				]"
				@click="close(props)"
			>
				<div
					class="notification-title"
					v-if="props.item.title"
				>
					{{ props.item.title }}
				</div>
				<div
					class="notification-content"
				>
					<template v-for="(t, k) in props.item.text">
						{{ t }}<br :key="k"/>
					</template>
				</div>
				<div
					class="buttons is-right"
					v-if="
						props.item.data &&
						props.item.data.actions &&
						props.item.data.actions.length > 0
					"
				>
					<x-button
						:key="'action_' + i"
						@click="action.callback"
						:shadow="false"
						class="is-small"
						type="secondary"
						v-for="(action, i) in props.item.data.actions"
					>
						{{ action.title }}
					</x-button>
				</div>
			</div>
		</template>
	</notifications>
</template>

<script>
export default {
	name: 'notification',
	methods: {
		close(props) {
			props.close()
		},
	},
}
</script>

<style scoped>
.vue-notification {
	z-index: 9999;
}

.buttons {
	margin-top: 0.5rem;
}
</style>