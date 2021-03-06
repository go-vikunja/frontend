import Vue from 'vue'

import {CONFIG} from '../mutation-types'
import {HTTPFactory} from '@/http-common'
import {objectToCamelCase} from '@/helpers/case'

export default {
	namespaced: true,
	state: () => ({
		// These are the api defaults.
		version: '',
		frontendUrl: '',
		motd: '',
		linkSharingEnabled: true,
		maxFileSize: '20MB',
		registrationEnabled: true,
		availableMigrators: [],
		taskAttachmentsEnabled: true,
		totpEnabled: true,
		enabledBackgroundProviders: [],
		legal: {
			imprintUrl: '',
			privacyPolicyUrl: '',
		},
		caldavEnabled: false,
		auth: {
			local: {
				enabled: true,
			},
			openidConnect: {
				enabled: false,
				redirectUrl: '',
				providers: [],
			},
		},
	}),
	mutations: {
		[CONFIG](state, config) {
			state.version = config.version
			state.frontendUrl = config.frontend_url
			state.motd = config.motd
			state.linkSharingEnabled = config.link_sharing_enabled
			state.maxFileSize = config.max_file_size
			state.registrationEnabled = config.registration_enabled
			state.availableMigrators = config.available_migrators
			state.taskAttachmentsEnabled = config.task_attachments_enabled
			state.totpEnabled = config.totp_enabled
			state.enabledBackgroundProviders = config.enabled_background_providers
			state.legal.imprintUrl = config.legal.imprint_url
			state.legal.privacyPolicyUrl = config.legal.privacy_policy_url
			state.caldavEnabled = config.caldav_enabled
			const auth = objectToCamelCase(config.auth)
			state.auth.local.enabled = auth.local.enabled
			state.auth.openidConnect.enabled = auth.openidConnect.enabled
			state.auth.openidConnect.redirectUrl = auth.openidConnect.redirectUrl
			Vue.set(state.auth.openidConnect, 'providers', auth.openidConnect.providers)
		},
	},
	actions: {
		update(ctx) {
			const HTTP = HTTPFactory()

			return HTTP.get('info')
				.then(r => {
					ctx.commit(CONFIG, r.data)
					return Promise.resolve(r)
				})
				.catch(e => Promise.reject(e))
		},
	},
}