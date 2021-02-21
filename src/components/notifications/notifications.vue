<template>
	<div class="notifications">
		<a @click.stop="showNotifications = !showNotifications" class="trigger">
			<icon icon="bell"/>
		</a>

		<transition name="fade">
			<div class="notifications-list" v-if="showNotifications" ref="popup">
				<span class="head">Notifications</span>
				<div class="single-notification" v-for="n in notifications" :key="n.id">
					{{ n.name }}
					{{ formatDateSince(n.created) }}
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
import NotificationService from '@/services/notification'
import User from '@/components/misc/user'
import names from '@/models/notificationNames.json'
import {closeWhenClickedOutside} from '@/helpers/closeWhenClickedOutside'

export default {
	name: 'notifications',
	components: {User},
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
		document.addEventListener('click', this.hidePopup)
	},
	beforeDestroy() {
		document.removeEventListener('click', this.hidePopup)
	},
	methods: {
		hidePopup(e) {
			if (this.showNotifications) {
				closeWhenClickedOutside(e, this.$refs.popup, () => this.showNotifications = false)
			}
		},
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
