<template>
	<CreateEdit
		:padding="false"
		:title="heading"
		@primary="create"
		:loading="taskService.loading"
	>
		<input
			:placeholder="$t('task.create.title')"
			class="task-title input"
			@keyup.enter="create"
			v-model="newTask.title"
			v-focus
		/>
		<p class="help is-danger ml-4" v-if="errorMessage !== ''">
			{{ errorMessage }}
		</p>
		<QuickAddMagic class="ml-4" v-else/>
		<BaseButton
			v-if="!descriptionFormVisible"
			@click="() => descriptionFormVisible = true"
			class="toggle-description-button"
		>
			{{ $t('task.create.description') }}
		</BaseButton>
		<editor
			v-if="descriptionFormVisible"
			v-model="newTask.description"
			:placeholder="$t('task.create.descriptionPlaceholder')"
			:preview-is-default="false"
			class="m-4"
		/>
		<div class="px-4">
			<Datepicker 
				v-model="newTask.dueDate" 
				v-slot="{ date, openPopup }"
			>
				<XButton variant="secondary" @click.stop="openPopup()">
					{{ date ? formatDateShort(date) : t('task.attributes.dueDate') }}
				</XButton>
			</Datepicker>
		</div>
	</CreateEdit>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {formatISO} from 'date-fns'

import CreateEdit from '@/components/misc/create-edit.vue'
import Editor from '@/components/input/AsyncEditor'
import BaseButton from '@/components/base/BaseButton.vue'
import QuickAddMagic from '@/components/tasks/partials/quick-add-magic.vue'
import XButton from '@/components/input/button.vue'
import Datepicker from '@/components/input/datepicker.vue'

import type {ITask} from '@/modelTypes/ITask'
import TaskModel from '@/models/task'
import TaskService from '@/services/task'
import {useRouter} from 'vue-router'
import {useListStore} from '@/stores/lists'
import {getQuickAddMagicMode} from '@/helpers/quickAddMagicMode'
import {parseTaskText} from '@/modules/parseTaskText'
import {findAssignees} from '@/helpers/findAssignees'
import {formatDateShort} from '@/helpers/time/formatDate'

const listStore = useListStore()
const router = useRouter()
const {t} = useI18n()
const props = defineProps<{
	listId: number,
}>()

const heading = computed(() => {
	const listTitle = listStore.getListById(props.listId)?.title || ''
	return listTitle !== ''
		? t('task.create.heading', {list: listTitle})
		: t('task.new')
})

const errorMessage = ref('')
const taskService = ref(new TaskService())
const descriptionFormVisible = ref(false)
const newTask = ref<ITask>(new TaskModel({}))

const parsedTask = computed(() => parseTaskText(newTask.value.title, getQuickAddMagicMode()))
watch(
	() => parsedTask.value.date,
	date => newTask.value.dueDate = date
)

async function create() {
	if (newTask.value.title === '') {
		errorMessage.value = t('list.create.addTitleRequired')
		return
	}
	errorMessage.value = ''

	newTask.value.listId = props.listId
	newTask.value.title = parsedTask.value.text
	const assignees = await findAssignees(parsedTask.value.assignees)
	
	const finalTask = new TaskModel({
		...newTask.value,
		title: parsedTask.value.text,
		dueDate: newTask.value.dueDate !== null ? formatISO(newTask.value.dueDate) : null,
		priority: parsedTask.value.priority,
		assignees: parsedTask.value.assignees,
	})

	const task = await taskService.value.create(finalTask)
	return router.push({name: 'task.detail', params: {id: task.id}})
}
</script>

<style scoped>
.task-title {
	width: 100%;
	font-size: 1.5rem;
	border: 0;
	padding: 1rem;
}

.toggle-description-button {
	padding: 1rem;
	color: var(--grey-400);
	width: 100%;
	text-align: left;
}
</style>
