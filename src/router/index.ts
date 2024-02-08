import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocation } from 'vue-router'
import {saveLastVisited} from '@/helpers/saveLastVisited'

import {saveProjectView, getProjectView} from '@/helpers/projectView'
import {parseDateOrString} from '@/helpers/time/parseDateOrString'
import {getNextWeekDate} from '@/helpers/time/getNextWeekDate'
import {setTitle} from '@/helpers/setTitle'
import {LINK_SHARE_HASH_PREFIX} from '@/constants/linkShareHash'

import {useProjectStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'
import {useBaseStore} from '@/stores/base'
import {useTaskStore} from '@/stores/tasks'

import HomeComponent from '@/views/Home.vue'
import NotFoundComponent from '@/views/404.vue'
const About = () => import('@/views/About.vue')
// User Handling
import LoginComponent from '@/views/user/Login.vue'
import RegisterComponent from '@/views/user/Register.vue'
import OpenIdAuth from '@/views/user/OpenIdAuth.vue'
const DataExportDownload = () => import('@/views/user/DataExportDownload.vue')
// Tasks
import UpcomingTasksComponent from '@/views/tasks/ShowTasks.vue'
import LinkShareAuthComponent from '@/views/sharing/LinkSharingAuth.vue'
const TaskDetailView = () => import('@/views/tasks/TaskDetailView.vue')

// Team Handling
const ListTeamsComponent = () => import('@/views/teams/ListTeams.vue')
// Label Handling
const ListLabelsComponent = () => import('@/views/labels/ListLabels.vue')
const NewLabelComponent = () => import('@/views/labels/NewLabel.vue')
// Migration
const MigrationComponent = () => import('@/views/migrate/Migration.vue')
const MigrationHandlerComponent = () => import('@/views/migrate/MigrationHandler.vue')
// Project Views
const ProjectList = () => import('@/views/project/ProjectList.vue')
const ProjectGantt = () => import('@/views/project/ProjectGantt.vue')
const ProjectTable = () => import('@/views/project/ProjectTable.vue')
// If we load the component async, using it as a backdrop view will not work. Instead, everything explodes
// with an error from the core saying "Cannot read properties of undefined (reading 'parentNode')"
// Of course, with no clear indicator of where the problem comes from.
// const ProjectKanban = () => import('@/views/project/ProjectKanban.vue')
import ProjectKanban from '@/views/project/ProjectKanban.vue'
const ProjectInfo = () => import('@/views/project/ProjectInfo.vue')

// Project Settings
const ListProjects = () => import('@/views/project/ListProjects.vue')
const ProjectSettingEdit = () => import('@/views/project/settings/edit.vue')
const ProjectSettingBackground = () => import('@/views/project/settings/background.vue')
const ProjectSettingDuplicate = () => import('@/views/project/settings/duplicate.vue')
const ProjectSettingShare = () => import('@/views/project/settings/share.vue')
const ProjectSettingWebhooks = () => import('@/views/project/settings/webhooks.vue')
const ProjectSettingDelete = () => import('@/views/project/settings/delete.vue')
const ProjectSettingArchive = () => import('@/views/project/settings/archive.vue')

// Saved Filters
const FilterNew = () => import('@/views/filters/FilterNew.vue')
const FilterEdit = () => import('@/views/filters/FilterEdit.vue')
const FilterDelete = () => import('@/views/filters/FilterDelete.vue')

const PasswordResetComponent = () => import('@/views/user/PasswordReset.vue')
const GetPasswordResetComponent = () => import('@/views/user/RequestPasswordReset.vue')
const UserSettingsComponent = () => import('@/views/user/Settings.vue')
const UserSettingsAvatarComponent = () => import('@/views/user/settings/Avatar.vue')
const UserSettingsCaldavComponent = () => import('@/views/user/settings/Caldav.vue')
const UserSettingsDataExportComponent = () => import('@/views/user/settings/DataExport.vue')
const UserSettingsDeletionComponent = () => import('@/views/user/settings/Deletion.vue')
const UserSettingsEmailUpdateComponent = () => import('@/views/user/settings/EmailUpdate.vue')
const UserSettingsGeneralComponent = () => import('@/views/user/settings/General.vue')
const UserSettingsPasswordUpdateComponent = () => import('@/views/user/settings/PasswordUpdate.vue')
const UserSettingsTOTPComponent = () => import('@/views/user/settings/TOTP.vue')
const UserSettingsApiTokensComponent = () => import('@/views/user/settings/ApiTokens.vue')

// Project Handling
const NewProjectComponent = () => import('@/views/project/NewProject.vue')

const EditTeamComponent = () => import('@/views/teams/EditTeam.vue')
const NewTeamComponent = () =>  import('@/views/teams/NewTeam.vue')

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	scrollBehavior(to, from, savedPosition) {
		// If the user is using their forward/backward keys to navigate, we want to restore the scroll view
		if (savedPosition) {
			return savedPosition
		}

		// Scroll to anchor should still work
		if (to.hash && !to.hash.startsWith(LINK_SHARE_HASH_PREFIX)) {
			return {el: to.hash}
		}

		// Otherwise just scroll to the top
		return {left: 0, top: 0}
	},
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeComponent,
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'not-found',
			component: NotFoundComponent,
		},
		// if you omit the last `*`, the `/` character in params will be encoded when resolving or pushing
		{
			path: '/:pathMatch(.*)',
			name: 'bad-not-found',
			component: NotFoundComponent,
		},
		{
			path: '/login',
			name: 'user.login',
			component: LoginComponent,
			meta: {
				title: 'user.auth.login',
			},
		},
		{
			path: '/get-password-reset',
			name: 'user.password-reset.request',
			component: GetPasswordResetComponent,
			meta: {
				title: 'user.auth.resetPassword',
			},
		},
		{
			path: '/password-reset',
			name: 'user.password-reset.reset',
			component: PasswordResetComponent,
			meta: {
				title: 'user.auth.resetPassword',
			},
		},
		{
			path: '/register',
			name: 'user.register',
			component: RegisterComponent,
			meta: {
				title: 'user.auth.createAccount',
			},
		},
		{
			path: '/user/settings',
			name: 'user.settings',
			component: UserSettingsComponent,
			redirect: {name: 'user.settings.general'},
			children: [
				{
					path: '/user/settings/avatar',
					name: 'user.settings.avatar',
					component: UserSettingsAvatarComponent,
				},
				{
					path: '/user/settings/caldav',
					name: 'user.settings.caldav',
					component: UserSettingsCaldavComponent,
				},
				{
					path: '/user/settings/data-export',
					name: 'user.settings.data-export',
					component: UserSettingsDataExportComponent,
				},
				{
					path: '/user/settings/deletion',
					name: 'user.settings.deletion',
					component: UserSettingsDeletionComponent,
				},
				{
					path: '/user/settings/email-update',
					name: 'user.settings.email-update',
					component: UserSettingsEmailUpdateComponent,
				},
				{
					path: '/user/settings/general',
					name: 'user.settings.general',
					component: UserSettingsGeneralComponent,
				},
				{
					path: '/user/settings/password-update',
					name: 'user.settings.password-update',
					component: UserSettingsPasswordUpdateComponent,
				},
				{
					path: '/user/settings/totp',
					name: 'user.settings.totp',
					component: UserSettingsTOTPComponent,
				},
				{
					path: '/user/settings/api-tokens',
					name: 'user.settings.apiTokens',
					component: UserSettingsApiTokensComponent,
				},
			],
		},
		{
			path: '/user/export/download',
			name: 'user.export.download',
			component: DataExportDownload,
		},
		{
			path: '/share/:share/auth',
			name: 'link-share.auth',
			component: LinkShareAuthComponent,
		},
		{
			path: '/tasks/:id',
			name: 'task.detail',
			component: TaskDetailView,
			props: route => ({ taskId: Number(route.params.id as string) }),
		},
		{
			path: '/tasks/create',
			name: 'task.create',
			beforeEnter: async (to, from, next) => {
				const taskStore = useTaskStore()
				const authStore = useAuthStore()
				// Need to get settings populated first!
				await authStore.checkAuth()

				const defaultProjectId = authStore.settings.defaultProjectId
				if(!defaultProjectId) {
					return false
				}

				const title = to.query.title || 'Share'
				const description = to.query.description || ''
				
				const task = await taskStore.createNewTask({
					title,
					description,
					projectId: defaultProjectId,
				})
			
				// After Task creation succeeds, redirect to show the task.
				return next({name: 'task.detail', params: {id: task.id}})
			},
			component: TaskDetailView,
		},
		{
			path: '/tasks/by/upcoming',
			name: 'tasks.range',
			component: UpcomingTasksComponent,
			props: route => ({
				dateFrom: parseDateOrString(route.query.from as string, new Date()),
				dateTo: parseDateOrString(route.query.to as string, getNextWeekDate()),
				showNulls: route.query.showNulls === 'true',
				showOverdue: route.query.showOverdue === 'true',
			}),
		},
		{
			// Redirect old list routes to the respective project routes
			// see: https://router.vuejs.org/guide/essentials/dynamic-matching.html#catch-all-404-not-found-route
			path: '/lists:pathMatch(.*)*',
			name: 'lists',
			redirect(to) {
				return {
					path: to.path.replace('/lists', '/projects'),
					query: to.query,
					hash: to.hash,
				}
			},
		},
		{
			path: '/projects',
			name: 'projects.index',
			component: ListProjects,
		},
		{
			path: '/projects/new',
			name: 'project.create',
			component: NewProjectComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:parentProjectId/new',
			name: 'project.createFromParent',
			component: NewProjectComponent,
			props: route => ({ parentProjectId: Number(route.params.parentProjectId as string) }),
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/edit',
			name: 'project.settings.edit',
			component: ProjectSettingEdit,
			props: route => ({ projectId: Number(route.params.projectId as string) }),
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/background',
			name: 'project.settings.background',
			component: ProjectSettingBackground,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/duplicate',
			name: 'project.settings.duplicate',
			component: ProjectSettingDuplicate,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/share',
			name: 'project.settings.share',
			component: ProjectSettingShare,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/webhooks',
			name: 'project.settings.webhooks',
			component: ProjectSettingWebhooks,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/delete',
			name: 'project.settings.delete',
			component: ProjectSettingDelete,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/archive',
			name: 'project.settings.archive',
			component: ProjectSettingArchive,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/settings/edit',
			name: 'filter.settings.edit',
			component: FilterEdit,
			meta: {
				showAsModal: true,
			},
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId/settings/delete',
			name: 'filter.settings.delete',
			component: FilterDelete,
			meta: {
				showAsModal: true,
			},
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId/info',
			name: 'project.info',
			component: ProjectInfo,
			meta: {
				showAsModal: true,
			},
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId',
			name: 'project.index',
			redirect(to) {
				// Redirect the user to list view by default
				const savedProjectView = getProjectView(Number(to.params.projectId as string))

				if (savedProjectView) {
					console.log('Replaced list view with', savedProjectView)
				}

				return {
					name: savedProjectView || 'project.list',
					params: {projectId: to.params.projectId},
				}
			},
		},
		{
			path: '/projects/:projectId/list',
			name: 'project.list',
			component: ProjectList,
			beforeEnter: (to) => saveProjectView(to.params.projectId, to.name),
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId/gantt',
			name: 'project.gantt',
			component: ProjectGantt,
			beforeEnter: (to) => saveProjectView(to.params.projectId, to.name),
			// FIXME: test if `useRoute` would be the same. If it would use it instead.
			props: route => ({route}),
		},
		{
			path: '/projects/:projectId/table',
			name: 'project.table',
			component: ProjectTable,
			beforeEnter: (to) => saveProjectView(to.params.projectId, to.name),
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId/kanban',
			name: 'project.kanban',
			component: ProjectKanban,
			beforeEnter: (to) => {
				saveProjectView(to.params.projectId, to.name)
				// Properly set the page title when a task popup is closed
				const projectStore = useProjectStore()
				const projectFromStore = projectStore.projects[Number(to.params.projectId)]
				if(projectFromStore) {
					setTitle(projectFromStore.title)
				}
			},
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/teams',
			name: 'teams.index',
			component: ListTeamsComponent,
		},
		{
			path: '/teams/new',
			name: 'teams.create',
			component: NewTeamComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/teams/:id/edit',
			name: 'teams.edit',
			component: EditTeamComponent,
		},
		{
			path: '/labels',
			name: 'labels.index',
			component: ListLabelsComponent,
		},
		{
			path: '/labels/new',
			name: 'labels.create',
			component: NewLabelComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/migrate',
			name: 'migrate.start',
			component: MigrationComponent,
		},
		{
			path: '/migrate/:service',
			name: 'migrate.service',
			component: MigrationHandlerComponent,
			props: route => ({
				service: route.params.service as string,
				code: route.query.code as string,
			}),
		},
		{
			path: '/filters/new',
			name: 'filters.create',
			component: FilterNew,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/auth/openid/:provider',
			name: 'openid.auth',
			component: OpenIdAuth,
		},
		{
			path: '/about',
			name: 'about',
			component: About,
		},
	],
})

export async function getAuthForRoute(to: RouteLocation, authStore) {
	if (authStore.authUser || authStore.authLinkShare) {
		return
	}
	
	// Check if the route the user wants to go to is a route which needs authentication. We use this to 
	// redirect the user after successful login.
	const isValidUserAppRoute = ![
			'user.login',
			'user.password-reset.request',
			'user.password-reset.reset',
			'user.register',
			'link-share.auth',
			'openid.auth',
		].includes(to.name as string) &&
		localStorage.getItem('passwordResetToken') === null &&
		localStorage.getItem('emailConfirmToken') === null &&
		!(to.name === 'home' && (typeof to.query.userPasswordReset !== 'undefined' || typeof to.query.userEmailConfirm !== 'undefined'))
	
	if (isValidUserAppRoute) {
		saveLastVisited(to.name as string, to.params, to.query)
	}
	
	const baseStore = useBaseStore()
	// When trying this before the current user was fully loaded we might get a flash of the login screen 
	// in the user shell. To make sure this does not happen we check if everything is ready before trying.
	if (!baseStore.ready) {
		return
	}

	if (isValidUserAppRoute) {
		return {name: 'user.login'}
	}
	
	if(localStorage.getItem('passwordResetToken') !== null && to.name !== 'user.password-reset.reset') {
		return {name: 'user.password-reset.reset'}
	}
	
	if(localStorage.getItem('emailConfirmToken') !== null && to.name !== 'user.login') {
		return {name: 'user.login'}
	}
}

router.beforeEach(async (to, from) => {
	const authStore = useAuthStore()

	if(from.hash && from.hash.startsWith(LINK_SHARE_HASH_PREFIX)) {
		to.hash = from.hash
	}

	if (to.hash.startsWith(LINK_SHARE_HASH_PREFIX) && !authStore.authLinkShare) {
		saveLastVisited(to.name as string, to.params, to.query)
		return {
			name: 'link-share.auth',
			params: {
				share: to.hash.replace(LINK_SHARE_HASH_PREFIX, ''),
			},
		}
	}

	const newRoute = await getAuthForRoute(to, authStore)
	if(newRoute) {
		return {
			...newRoute,
			hash: to.hash,
		}
	}
	
	if(!to.fullPath.endsWith(to.hash)) {
		return to.fullPath + to.hash
	}
})

export default router