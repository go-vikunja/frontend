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
	</CreateEdit>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import CreateEdit from '@/components/misc/create-edit.vue'
import type {ITask} from '@/modelTypes/ITask'
import TaskModel from '@/models/task'
import Editor from '@/components/input/AsyncEditor'
import BaseButton from '@/components/base/BaseButton.vue'
import TaskService from '@/services/task'
import {useRouter} from 'vue-router'
import {useListStore} from '@/stores/lists'

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

const descriptionFormVisible = ref(false)
const newTask = ref<ITask>(new TaskModel({}))
const taskService = ref(new TaskService())

async function create() {
	newTask.value.listId = props.listId
	const task = await taskService.value.create(newTask.value)
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
