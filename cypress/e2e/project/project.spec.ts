import {createFakeUserAndLogin} from '../../support/authenticateUser'

import {TaskFactory} from '../../factories/task'
import {prepareProjects} from './prepareProjects'

describe('Projects', () => {
	createFakeUserAndLogin()

	let projects
	prepareProjects((newProjects) => (projects = newProjects))

	it('Should create a new project', () => {
		cy.visit('/projects')
		cy.get('.project-header [data-cy=new-project]')
			.click()
		cy.url()
			.should('contain', '/projects/new')
		cy.get('.card-header-title')
			.contains('New project')
		cy.get('input.input')
			.type('New Project')
		cy.get('.button')
			.contains('Create')
			.click()

		cy.get('.global-notification', { timeout: 1000 }) // Waiting until the request to create the new project is done
			.should('contain', 'Success')
		cy.url()
			.should('contain', '/projects/')
		cy.get('.project-title')
			.should('contain', 'New Project')
	})

	it('Should redirect to a specific project view after visited', () => {
		cy.intercept(Cypress.env('API_URL') + '/projects/*/buckets*').as('loadBuckets')
		cy.visit('/projects/1/kanban')
		cy.url()
			.should('contain', '/projects/1/kanban')
		cy.wait('@loadBuckets')
		cy.visit('/projects/1')
		cy.url()
			.should('contain', '/projects/1/kanban')
	})

	it('Should rename the project in all places', () => {
		TaskFactory.create(5, {
			id: '{increment}',
			project_id: 1,
		})
		const newProjectName = 'New project name'

		cy.visit('/projects/1')
		cy.get('.project-title')
			.should('contain', 'First Project')

		cy.get('.menu-container .menu-list li:first-child .dropdown .menu-list-dropdown-trigger')
			.click()
		cy.get('.menu-container .menu-list li:first-child .dropdown .dropdown-content')
			.contains('Edit')
			.click()
		cy.get('#title')
			.type(`{selectall}${newProjectName}`)
		cy.get('footer.card-footer .button')
			.contains('Save')
			.click()

		cy.get('.global-notification')
			.should('contain', 'Success')
		cy.get('.project-title')
			.should('contain', newProjectName)
			.should('not.contain', projects[0].title)
		cy.get('.menu-container .menu-list li:first-child')
			.should('contain', newProjectName)
			.should('not.contain', projects[0].title)
		cy.visit('/')
		cy.get('.project-grid')
			.should('contain', newProjectName)
			.should('not.contain', projects[0].title)
	})

	it('Should remove a project', () => {
		cy.visit(`/projects/${projects[0].id}`)

		cy.get('.menu-container .menu-list li:first-child .dropdown .menu-list-dropdown-trigger')
			.click()
		cy.get('.menu-container .menu-list li:first-child .dropdown .dropdown-content')
			.contains('Delete')
			.click()
		cy.url()
			.should('contain', '/settings/delete')
		cy.get('[data-cy="modalPrimary"]')
			.contains('Do it')
			.click()

		cy.get('.global-notification')
			.should('contain', 'Success')
		cy.get('.menu-container .menu-list')
			.should('not.contain', projects[0].title)
		cy.location('pathname')
			.should('equal', '/')
	})
	
	it('Should archive a project', () => {
		cy.visit(`/projects/${projects[0].id}`)
		
		cy.get('.project-title-dropdown')
			.click()
		cy.get('.project-title-dropdown .dropdown-menu .dropdown-item')
			.contains('Archive')
			.click()
		cy.get('.modal-content')
			.should('contain.text', 'Archive this project')
		cy.get('.modal-content [data-cy=modalPrimary]')
			.click()
		
		cy.get('.menu-container .menu-list')
			.should('not.contain', projects[0].title)
		cy.get('main.app-content')
			.should('contain.text', 'This project is archived. It is not possible to create new or edit tasks for it.')
	})
})
