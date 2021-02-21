<template>
	<div class="notifications">
		<a @click="showNotifications = !showNotifications" class="trigger">
			<icon icon="bell"/>
		</a>

		<transition name="fade">
			<div class="notifications-list" v-if="showNotifications">
				notifcias
			</div>
		</transition>
	</div>
</template>

<script>
import NotificationService from '@/services/notification'

export default {
	name: 'notifications',
	data() {
		return {
			notificationService: NotificationService,
			notifications: [],
			showNotifications: false,
		}
	},
	created() {
		this.notificationService = new NotificationService()
	},
	mounted() {
		this.loadNotifications()
	},
	methods: {
		loadNotifications() {
			this.notificationService.getAll()
				.then(r => {
					this.$set(this, 'notifications', r)
				})
				.catch(e => {
					this.error(e, this)
				})
		},
	},
}
</script>
