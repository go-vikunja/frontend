/* eslint-disable no-console */
/* eslint-disable no-undef */

import {getFullBaseUrl} from './helpers/getFullBaseUrl'

import {useTaskStore} from '@/stores/tasks'
import {useAuthStore} from '@/stores/auth'

declare let self: ServiceWorkerGlobalScope

const fullBaseUrl = getFullBaseUrl()
const authStore = useAuthStore()
const taskStore = useTaskStore()
const workboxVersion = 'v7.0.0'


const shareTargetHandler = async ({event}) => {	
	console.log('share-target()  ', event)

	// Form extraction works fine...
	const formData = await event.request.formData()
	console.log('FormData:()  ', formData)
	const title = formData.get('name')
	const description = formData.get('description')

	console.log('shareTargetHandler(), title: ', title)
	console.log('shareTargetHandler(), description: ', description)

	const defaultProjectId = authStore?.settings?.defaultProjectId
	console.log('shareTargetHandler(), defaultProjectId: ', defaultProjectId)

	if (defaultProjectId) {
		const task = await taskStore.createNewTask({
			title,
			projectId: defaultProjectId,
		})

		if (description) {
			task.description = description
		}

		console.log('Created task with ID: ', task.id)
	
		// After Task creation succeeds, redirect to show the task.
		const redirectionUrl = `${fullBaseUrl}tasks/${task.id}`
		return Response.redirect(redirectionUrl, 303)
	}
	else {
		// ToDo: improve handling of undefined default projectID
		const redirectionUrl = `${fullBaseUrl}unspecified_default_project_id`
		return Response.redirect(redirectionUrl, 303)
	}
}

importScripts(`${fullBaseUrl}workbox-${workboxVersion}/workbox-sw.js`)
workbox.setConfig({
	modulePathPrefix: `${fullBaseUrl}workbox-${workboxVersion}`,
	debug: Boolean(import.meta.env.VITE_WORKBOX_DEBUG),
})

import { precacheAndRoute } from 'workbox-precaching'
precacheAndRoute(self.__WB_MANIFEST)

// Cache assets
workbox.routing.registerRoute(
	// This regexp matches all files in precache-manifest
	new RegExp('.+\\.(css|json|js|svg|woff2|png|html|txt|wav)$'),
	new workbox.strategies.StaleWhileRevalidate(),
)

// Always send api reqeusts through the network
workbox.routing.registerRoute(
	new RegExp('api\\/v1\\/.*$'),
	new workbox.strategies.NetworkOnly(),
)

workbox.routing.registerRoute(
	'/_share-target',
	shareTargetHandler,
	'POST',
)

// This code listens for the user's confirmation to update the app.
self.addEventListener('message', (e) => {
	if (!e.data) {
		return
	}

	switch (e.data) {
		case 'skipWaiting':
			self.skipWaiting()
			break
		default:
			// NOOP
			break
	}
})

// Notification action
self.addEventListener('notificationclick', function (event) {
	const taskId = event.notification.data.taskId
	event.notification.close()

	switch (event.action) {
		case 'show-task':
			clients.openWindow(`${fullBaseUrl}tasks/${taskId}`)
			break
	}
})

workbox.core.clientsClaim()
// The precaching code provided by Workbox.
self.__precacheManifest = [].concat(self.__precacheManifest || [])
workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

