<template>
	<div>
		<div :class="{'is-hidden': !online}">
			<!-- This is a workaround to get the sw to "see" the to-be-cached version of the offline background image -->
			<div class="offline" style="height: 0;width: 0;"></div>
			<top-navigation v-if="authUser"/>
			<content-auth v-if="authUser"/>
			<content-link-share v-else-if="authLinkShare"/>
			<content-no-auth v-else/>
			<notification/>
		</div>
		<div class="app offline" v-if="!online">
			<div class="offline-message">
				<h1>You are offline.</h1>
				<p>Please check your network connection and try again.</p>
			</div>
		</div>

		<transition name="fade">
			<keyboard-shortcuts v-if="keyboardShortcutsActive"/>
		</transition>
	</div>
</template>

<script>
import {mapState} from 'vuex'

import authTypes from './models/authTypes'

import Notification from './components/misc/notification'
import {KEYBOARD_SHORTCUTS_ACTIVE, ONLINE} from './store/mutation-types'
import KeyboardShortcuts from './components/misc/keyboard-shortcuts'
import TopNavigation from '@/components/home/topNavigation'
import ContentAuth from '@/components/home/contentAuth'
import ContentLinkShare from '@/components/home/contentLinkShare'
import ContentNoAuth from '@/components/home/contentNoAuth'
import {setLanguage} from '@/i18n/setup'

export default {
	name: 'app',
	components: {
		ContentNoAuth,
		ContentLinkShare,
		ContentAuth,
		TopNavigation,
		KeyboardShortcuts,
		Notification,
	},
	beforeMount() {
		this.setupOnlineStatus()
		this.setupPasswortResetRedirect()
		this.setupEmailVerificationRedirect()
	},
	beforeCreate() {
		this.$store.dispatch('config/update')
		this.$store.dispatch('auth/checkAuth')

		setLanguage()
	},
	created() {
		// Make sure to always load the home route when running with electron
		if (this.$route.fullPath.endsWith('frontend/index.html')) {
			this.$router.push({name: 'home'})
		}
	},
	computed: mapState({
		authUser: state => state.auth.authenticated && (state.auth.info && state.auth.info.type === authTypes.USER),
		authLinkShare: state => state.auth.authenticated && (state.auth.info && state.auth.info.type === authTypes.LINK_SHARE),
		online: ONLINE,
		keyboardShortcutsActive: KEYBOARD_SHORTCUTS_ACTIVE,
	}),
	methods: {
		setupOnlineStatus() {
			this.$store.commit(ONLINE, navigator.onLine)
			window.addEventListener('online', () => this.$store.commit(ONLINE, navigator.onLine))
			window.addEventListener('offline', () => this.$store.commit(ONLINE, navigator.onLine))
		},
		setupPasswortResetRedirect() {
			if (typeof this.$route.query.userPasswordReset !== 'undefined') {
				localStorage.removeItem('passwordResetToken') // Delete an eventually preexisting old token
				localStorage.setItem('passwordResetToken', this.$route.query.userPasswordReset)
				this.$router.push({name: 'user.password-reset.reset'})
			}
		},
		setupEmailVerificationRedirect() {
			if (typeof this.$route.query.userEmailConfirm !== 'undefined') {
				localStorage.removeItem('emailConfirmToken') // Delete an eventually preexisting old token
				localStorage.setItem('emailConfirmToken', this.$route.query.userEmailConfirm)
				this.$router.push({name: 'user.login'})
			}
		},
	},
}
</script>
