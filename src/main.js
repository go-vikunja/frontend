import Vue from 'vue'
import App from './App.vue'
import router from './router'

import {formatDate, formatDateSince} from '@/helpers/time/formatDate'
import {VERSION} from './version.json'

// Register the modal
import Modal from './components/modal/modal'
// Add CSS
import './styles/vikunja.scss'
// Notifications
import Notifications from 'vue-notification'
// Icons
import {library} from '@fortawesome/fontawesome-svg-core'
import {
	faAlignLeft,
	faAngleRight,
	faBars,
	faCalendar,
	faCalendarWeek,
	faCheck,
	faCheckDouble,
	faChevronDown,
	faCloudDownloadAlt,
	faCloudUploadAlt,
	faCog,
	faEllipsisV,
	faExclamation,
	faFillDrip,
	faFilter,
	faHistory,
	faKeyboard,
	faLayerGroup,
	faList,
	faListOl,
	faLock,
	faPaperclip,
	faPaste,
	faPen,
	faPencilAlt,
	faPercent,
	faPlus,
	faPowerOff,
	faSearch,
	faSignOutAlt,
	faSort,
	faSortUp,
	faStar as faStarSolid,
	faTachometerAlt,
	faTags,
	faTasks,
	faTh,
	faTimes,
	faTrashAlt,
	faUser,
	faUsers,
	faForward,
	faChessKnight,
	faCoffee,
	faCocktail,
	faEllipsisH,
	faArchive,
	faShareAlt,
	faImage,
	faBell,
} from '@fortawesome/free-solid-svg-icons'
import {
	faCalendarAlt,
	faClock,
	faComments,
	faSave,
	faStar,
	faTimesCircle,
	faSun,
	faBellSlash
} from '@fortawesome/free-regular-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
// PWA
import './registerServiceWorker'

// Shortcuts
import vueShortkey from 'vue-shortkey'
// Mixins
import message from './message'
import {colorIsDark} from './helpers/color/colorIsDark'
import {setTitle} from './helpers/setTitle'
import {getNamespaceTitle} from './helpers/getNamespaceTitle'
import {getListTitle} from './helpers/getListTitle'
// Vuex
import {store} from './store'
// i18n
import {i18n} from './i18n/setup'

console.info(`Vikunja frontend version ${VERSION}`)

// Check if we have an api url in local storage and use it if that's the case
const apiUrlFromStorage = localStorage.getItem('API_URL')
if (apiUrlFromStorage !== null) {
	window.API_URL = apiUrlFromStorage
}

// Make sure the api url does not contain a / at the end
if (window.API_URL.substr(window.API_URL.length - 1, window.API_URL.length) === '/') {
	window.API_URL = window.API_URL.substr(0, window.API_URL.length - 1)
}

Vue.component('modal', Modal)

Vue.config.productionTip = false

Vue.use(Notifications)

library.add(faSignOutAlt)
library.add(faPlus)
library.add(faListOl)
library.add(faTasks)
library.add(faCog)
library.add(faAngleRight)
library.add(faLayerGroup)
library.add(faTrashAlt)
library.add(faUsers)
library.add(faUser)
library.add(faLock)
library.add(faPen)
library.add(faTimes)
library.add(faTachometerAlt)
library.add(faCalendar)
library.add(faTimesCircle)
library.add(faBars)
library.add(faPowerOff)
library.add(faCalendarWeek)
library.add(faCalendarAlt)
library.add(faExclamation)
library.add(faTags)
library.add(faChevronDown)
library.add(faCheck)
library.add(faPaste)
library.add(faPencilAlt)
library.add(faCloudDownloadAlt)
library.add(faCloudUploadAlt)
library.add(faPercent)
library.add(faStar)
library.add(faAlignLeft)
library.add(faPaperclip)
library.add(faClock)
library.add(faHistory)
library.add(faSearch)
library.add(faCheckDouble)
library.add(faComments)
library.add(faTh)
library.add(faSort)
library.add(faSortUp)
library.add(faList)
library.add(faEllipsisV)
library.add(faFilter)
library.add(faFillDrip)
library.add(faKeyboard)
library.add(faSave)
library.add(faStarSolid)
library.add(faForward)
library.add(faSun)
library.add(faChessKnight)
library.add(faCoffee)
library.add(faCocktail)
library.add(faEllipsisH)
library.add(faArchive)
library.add(faShareAlt)
library.add(faImage)
library.add(faBell)
library.add(faBellSlash)

Vue.component('icon', FontAwesomeIcon)

Vue.use(vueShortkey, {prevent: ['input', 'textarea', '.input']})

import focus from '@/directives/focus'

Vue.directive('focus', focus)

import tooltip from '@/directives/tooltip'

Vue.directive('tooltip', tooltip)

import Button from '@/components/input/button'

Vue.component('x-button', Button)

import Card from '@/components/misc/card'

Vue.component('card', Card)

Vue.mixin({
	methods: {
		formatDateSince(date) {
			return formatDateSince(date, (p, params) => this.$t(p, params))
		},
		formatDate(date) {
			return formatDate(date, 'PPPPpppp', this.$t('date.locale'))
		},
		formatDateShort(date) {
			return formatDate(date, 'PPpp', this.$t('date.locale'))
		},
		getNamespaceTitle(n) {
			return getNamespaceTitle(n, p => this.$t(p))
		},
		getListTitle(l) {
			return getListTitle(l, p => this.$t(p))
		},
		error(e, actions = []) {
			return message.error(e, this, p => this.$t(p), actions)
		},
		success(s, actions = []) {
			return message.success(s, this, p => this.$t(p), actions)
		},
		colorIsDark: colorIsDark,
		setTitle: setTitle,
	},
})

new Vue({
	router,
	store,
	i18n,
	render: h => h(App),
}).$mount('#app')
