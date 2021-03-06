import AbstractService from './abstractService'
import TeamListModel from '../models/teamList'
import TeamModel from '../models/team'
import {formatISO} from 'date-fns'

export default class TeamListService extends AbstractService {
	constructor() {
		super({
			create: '/lists/{listId}/teams',
			getAll: '/lists/{listId}/teams',
			update: '/lists/{listId}/teams/{teamId}',
			delete: '/lists/{listId}/teams/{teamId}',
		})
	}

	processModel(model) {
		model.created = formatISO(new Date(model.created))
		model.updated = formatISO(new Date(model.updated))
		return model
	}

	modelFactory(data) {
		return new TeamListModel(data)
	}

	modelGetAllFactory(data) {
		return new TeamModel(data)
	}
}