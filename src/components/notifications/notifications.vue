<template>
	<div class="notifications">
		<a @click.stop="showNotifications = !showNotifications" class="trigger">
			<icon icon="bell"/>
		</a>

		<transition name="fade">
			<div class="notifications-list" v-if="showNotifications" ref="popup">
				<span class="head">Notifications</span>
				<div class="single-notification" v-for="n in notifications" :key="n.id">
					<user
						:user="n.notification.doer"
						:show-username="true"
						:avatar-size="16"
						v-if="n.notification.doer"/>
					<span class="detail">
						<router-link :to="to(n)">
							{{ n.toText(userInfo) }}
						</router-link>
						<span class="created" v-tooltip="formatDate(n.created)">
							{{ formatDateSince(n.created) }}
						</span>
					</span>
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
import {mapState} from 'vuex'

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
	computed: mapState({
		userInfo: state => state.auth.info,
	}),
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
		to(n) {
			const to = {
				name: '',
				params: {},
			}

			switch (n.name) {
				case names.TASK_COMMENT:
				case names.TASK_ASSIGNED:
					to.name = 'task.detail'
					to.params.id = n.notification.task.id
					break
				case names.TASK_DELETED:
					// Nothing
					break
				case names.LIST_CREATED:
					to.name = 'task.index'
					to.params.listId = n.notification.list.id
					break
				case names.TEAM_MEMBER_ADDED:
					to.name = 'teams.edit'
					to.params.id = n.notification.team.id
					break
			}

			return to
		},
	},
}
</script>
