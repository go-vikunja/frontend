import UserService from '@/services/user'
import {findPropertyByValue} from '@/helpers/findPropertyByValue'

// Check if the user exists
function validateUsername(users: IUser[], username: IUser['username']) {
	return findPropertyByValue(users, 'username', username)
}

export async function findAssignees(parsedTaskAssignees: string[]) {
	if (parsedTaskAssignees.length <= 0) {
		return []
	}

	const userService = new UserService()
	const assignees = parsedTaskAssignees.map(async a => {
		const users = await userService.getAll({}, {s: a})
		return validateUsername(users, a)
	})

	const validatedUsers = await Promise.all(assignees)
	return validatedUsers.filter((item) => Boolean(item))
}

