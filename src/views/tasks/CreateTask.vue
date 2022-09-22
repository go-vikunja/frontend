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
		<div class="px-4 pb-4 task-attributes">
			<Datepicker
				v-model="newTask.dueDate"
				v-slot="{ date, openPopup }"
			>
				<XButton variant="secondary" @click.stop="openPopup()" class="datepicker-button">
					{{ date ? formatDateShort(date) : t('task.attributes.dueDate') }}
				</XButton>
			</Datepicker>
			<div class="is-flex pl-2">
				<span
					v-for="label in realLabels"
					:style="{'background': label.hexColor, 'color': label.textColor}"
					class="tag mr-2">
					<span>{{ label.title }}</span>
					<BaseButton @click="removeLabel(label)" class="delete is-small"/>
				</span>
			</div>
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
import {useLabelStore} from '@/stores/labels'
import {useStore} from '@/store'
import type {ILabel} from '@/modelTypes/ILabel'
import LabelModel from '@/models/label'

const listStore = useListStore()
const labelStore = useLabelStore()
const store = useStore()
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
	date => newTask.value.dueDate = date,
)

const labels = ref<string[]>([])
watch(
	() => parsedTask.value.labels,
	labelTitles => labels.value = labelTitles,
)
const realLabels = computed<ILabel[]>(() => {
	const existingLabels = labelStore.getLabelsByExactTitles(labels.value)

	const newLabels = labels.value
		.filter(l => l !== '' && !(existingLabels.map(le => le.title).includes(l)))
		.map(newLabel => new LabelModel({title: newLabel}))

	return [
		...existingLabels,
		...newLabels,
	]
})

function removeLabel(label: ILabel) {
	while (true) { // Using a loop to remove all labels, including possible duplicates added via quick add magic
		const index = labels.value.findIndex(el => el.toLowerCase() === label.title.toLowerCase())
		if (index === -1) {
			break
		}
		labels.value.splice(index, 1)
	}
}

async function create() {
	if (newTask.value.title === '') {
		errorMessage.value = t('list.create.addTitleRequired')
		return
	}
	errorMessage.value = ''

	const assignees = await findAssignees(parsedTask.value.assignees)

	const finalTask = new TaskModel({
		...newTask.value,
		listId: props.listId,
		title: parsedTask.value.text,
		dueDate: newTask.value.dueDate !== null ? formatISO(newTask.value.dueDate) : null,
		priority: parsedTask.value.priority,
		assignees: parsedTask.value.assignees,
	})

	const task = await taskService.value.create(finalTask)

	await store.dispatch('tasks/addLabelsToTask', {
		task,
		parsedLabels: labels.value,
	})

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

.datepicker-button {
	white-space: nowrap;
}

.task-attributes {
	display: flex;
	align-items: center;
	overflow-y: auto;
}
</style>
