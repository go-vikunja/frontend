import {HTTPFactory} from '@/http-common'
import {ERROR_MESSAGE, LOADING} from '../mutation-types'
import UserModel from '../../models/user'

export default {
	namespaced: true,
	state: () => ({
		authenticated: false,
		isLinkShareAuth: false,
		info: null,
		needsTotpPasscode: false,
		avatarUrl: '',
		lastUserInfoRefresh: null,
		settings: {},
	}),
	mutations: {
		info(state, info) {
			state.info = info
			if (info !== null) {
				state.avatarUrl = info.getAvatarUrl()
			}
			if (info.settings) {
				state.settings = info.settings
			}
		},
		setUserSettings(state, settings) {
			state.settings = settings
		},
		authenticated(state, authenticated) {
			state.authenticated = authenticated
		},
		isLinkShareAuth(state, is) {
			state.isLinkShareAuth = is
		},
		needsTotpPasscode(state, needs) {
			state.needsTotpPasscode = needs
		},
		reloadAvatar(state) {
			state.avatarUrl = `${state.info.getAvatarUrl()}&=${+new Date()}`
		},
		lastUserRefresh(state) {
			state.lastUserInfoRefresh = new Date()
		},
	},
	actions: {
		// Logs a user in with a set of credentials.
		login(ctx, credentials) {
			const HTTP = HTTPFactory()
			ctx.commit(LOADING, true, {root: true})

			// Delete an eventually preexisting old token
			localStorage.removeItem('token')

			const data = {
				username: credentials.username,
				password: credentials.password,
			}

			if (credentials.totpPasscode) {
				data.totp_passcode = credentials.totpPasscode
			}

			return HTTP.post('login', data)
				.then(response => {
					// Save the token to local storage for later use
					localStorage.setItem('token', response.data.token)

					// Tell others the user is autheticated
					ctx.commit('isLinkShareAuth', false)
					console.log('login')
					ctx.dispatch('checkAuth')
					return Promise.resolve()
				})
				.catch(e => {
					if (e.response) {
						if (e.response.data.code === 1017 && !credentials.totpPasscode) {
							ctx.commit('needsTotpPasscode', true)
							return Promise.reject()
						}

						let errorMsg = e.response.data.message
						if (e.response.status === 401) {
							errorMsg = 'Wrong username or password.'
						}
						ctx.commit(ERROR_MESSAGE, errorMsg, {root: true})
					}
					return Promise.reject()
				})
				.finally(() => {
					ctx.commit(LOADING, false, {root: true})
				})
		},
		// Registers a new user and logs them in.
		// Not sure if this is the right place to put the logic in, maybe a seperate js component would be better suited.
		register(ctx, credentials) {
			const HTTP = HTTPFactory()
			return HTTP.post('register', {
				username: credentials.username,
				email: credentials.email,
				password: credentials.password,
			})
				.then(() => {
					return ctx.dispatch('login', credentials)
				})
				.catch(e => {
					if (e.response) {
						ctx.commit(ERROR_MESSAGE, e.response.data.message, {root: true})
					}
					return Promise.reject()
				})
				.finally(() => {
					ctx.commit(LOADING, false, {root: true})
				})
		},
		openIdAuth(ctx, {provider, code}) {
			const HTTP = HTTPFactory()
			ctx.commit(LOADING, true, {root: true})

			const data = {
				code: code,
			}

			// Delete an eventually preexisting old token
			localStorage.removeItem('token')
			return HTTP.post(`/auth/openid/${provider}/callback`, data)
				.then(response => {
					// Save the token to local storage for later use
					localStorage.setItem('token', response.data.token)

					// Tell others the user is autheticated
					ctx.commit('isLinkShareAuth', false)
					ctx.dispatch('checkAuth')
					return Promise.resolve()
				})
				.catch(e => {
					if (e.response) {
						let errorMsg = e.response.data.message
						if (e.response.status === 401) {
							errorMsg = 'Wrong username or password.'
						}
						ctx.commit(ERROR_MESSAGE, errorMsg, {root: true})
					}
					return Promise.reject()
				})
				.finally(() => {
					ctx.commit(LOADING, false, {root: true})
				})
		},

		linkShareAuth(ctx, hash) {
			const HTTP = HTTPFactory()
			return HTTP.post('/shares/' + hash + '/auth')
				.then(r => {
					localStorage.setItem('token', r.data.token)
					ctx.dispatch('checkAuth')
					return Promise.resolve(r.data)
				}).catch(e => {
					return Promise.reject(e)
				})
		},
		// Populates user information from jwt token saved in local storage in store
		checkAuth(ctx) {

			// This function can be called from multiple places at the same time and shortly after one another.
			// To prevent hitting the api too frequently or race conditions, we check at most once per minute.
			if (ctx.state.lastUserInfoRefresh !== null && ctx.state.lastUserInfoRefresh > (new Date()).setMinutes((new Date()).getMinutes() + 1)) {
				return Promise.resolve()
			}

			const jwt = localStorage.getItem('token')
			let authenticated = false
			if (jwt) {
				const base64 = jwt
					.split('.')[1]
					.replace('-', '+')
					.replace('_', '/')
				const info = new UserModel(JSON.parse(window.atob(base64)))
				const ts = Math.round((new Date()).getTime() / 1000)
				authenticated = info.exp >= ts
				ctx.commit('info', info)

				if (authenticated) {
					const HTTP = HTTPFactory()
					// We're not returning the promise here to prevent blocking the initial ui render if the user is
					// accessing the site with a token in local storage
					HTTP.get('user', {
						headers: {
							Authorization: `Bearer ${jwt}`,
						},
					})
						.then(r => {
							const info = new UserModel(r.data)
							info.type = ctx.state.info.type
							info.email = ctx.state.info.email
							info.exp = ctx.state.info.exp

							ctx.commit('info', info)
							ctx.commit('authenticated', authenticated)
							ctx.commit('lastUserRefresh')
						})
						.catch(e => {
							console.error('Error while refreshing user info:', e)
						})
				}
			}

			ctx.commit('authenticated', authenticated)
			if (!authenticated) {
				ctx.commit('info', null)
			}

			return Promise.resolve()
		},
		// Renews the api token and saves it to local storage
		renewToken(ctx) {
			const HTTP = HTTPFactory()
			if (!ctx.state.authenticated) {
				return
			}

			HTTP.post('user/token', null, {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			})
				.then(r => {
					localStorage.setItem('token', r.data.token)
					ctx.dispatch('checkAuth')
				})
				.catch(e => {
					// eslint-disable-next-line
					console.log('Error renewing token: ', e)

					// Don't logout on network errors as the user would then get logged out if they don't have
					// internet for a short period of time - such as when the laptop is still reconnecting
					if (e.request.status) {
						ctx.dispatch('logout')
					}
				})
		},
		logout(ctx) {
			localStorage.removeItem('token')
			ctx.dispatch('checkAuth')
		},
	},
}