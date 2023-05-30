<template>
	<li
		class="list-menu loader-container is-loading-small"
		:class="{'is-loading': isLoading}"
	>
		<div>
			<BaseButton
				v-if="canCollapse && childProjects?.length > 0"
				@click="childProjectsOpen = !childProjectsOpen"
				class="collapse-project-button"
			>
				<icon icon="chevron-down" :class="{ 'project-is-collapsed': !childProjectsOpen }"/>
			</BaseButton>
			<BaseButton
				:to="{ name: 'project.index', params: { projectId: project.id} }"
				class="list-menu-link"
				:class="{'router-link-exact-active': currentProject?.id === project.id}"
			>
				<span
					v-if="!canCollapse || childProjects?.length === 0"
					class="collapse-project-button-placeholder"
				></span>
				<div class="color-bubble-handle-wrapper">
					<ColorBubble
						v-if="project.hexColor !== ''"
						:color="project.hexColor"
					/>
					<span
						class="icon menu-item-icon handle lines-handle"
						:class="{'has-color-bubble': project.hexColor !== ''}"
					>
						<icon icon="grip-lines"/>
					</span>
				</div>
				<span class="list-menu-title">{{ getProjectTitle(project) }}</span>
			</BaseButton>
			<BaseButton
				v-if="project.id > 0"
				class="favorite"
				:class="{'is-favorite': project.isFavorite}"
				@click="projectStore.toggleProjectFavorite(project)"
			>
				<icon :icon="project.isFavorite ? 'star' : ['far', 'star']"/>
			</BaseButton>
			<ProjectSettingsDropdown
				v-if="project.id > 0"
				class="menu-list-dropdown"
				:project="project"
				:level="level"
			>
				<template #trigger="{toggleOpen}">
					<BaseButton class="menu-list-dropdown-trigger" @click="toggleOpen">
						<icon icon="ellipsis-h" class="icon"/>
					</BaseButton>
				</template>
			</ProjectSettingsDropdown>
			<span class="list-setting-spacer" v-else></span>
		</div>
		<ProjectsNavigation
			v-if="canNestDeeper && childProjectsOpen && canCollapse"
			:model-value="childProjects"
			:can-edit-order="true"
			:can-collapse="canCollapse"
			:level="level + 1"
		/>
	</li>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {useProjectStore} from '@/stores/projects'
import {useBaseStore} from '@/stores/base'

import type {IProject} from '@/modelTypes/IProject'

import BaseButton from '@/components/base/BaseButton.vue'
import ProjectSettingsDropdown from '@/components/project/project-settings-dropdown.vue'
import {getProjectTitle} from '@/helpers/getProjectTitle'
import ColorBubble from '@/components/misc/colorBubble.vue'
import ProjectsNavigation from '@/components/home/ProjectsNavigation.vue'
import {canNestProjectDeeper} from '@/helpers/canNestProjectDeeper'

const props = withDefaults(defineProps<{
	project: IProject,
	isLoading?: boolean,
	canCollapse?: boolean,
	level?: number,
}>(), {
	level: 0,
})

const projectStore = useProjectStore()
const baseStore = useBaseStore()
const currentProject = computed(() => baseStore.currentProject)

const childProjectsOpen = ref(true)

const childProjects = computed(() => {
	if (!canNestDeeper.value) {
		return []
	}

	return projectStore.getChildProjects(props.project.id)
		.sort((a, b) => a.position - b.position)
})

const canNestDeeper = computed(() => canNestProjectDeeper(props.level))
</script>

<style lang="scss" scoped>
.list-setting-spacer {
	width: 5rem;
	flex-shrink: 0;
}

.project-is-collapsed {
	transform: rotate(-90deg);
}

.favorite {
	transition: opacity $transition, color $transition;
	opacity: 0;

	&:hover,
	&.is-favorite {
		opacity: 1;
		color: var(--warning);
	}
}

.list-menu:hover > div > .favorite {
	opacity: 1;
}

.list-menu:hover > div > a > .color-bubble-handle-wrapper > .color-bubble {
	opacity: 0;
}

.color-bubble-handle-wrapper {
	position: relative;
	width: 1rem;
	height: 1rem;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-right: .25rem;

	.color-bubble, .icon {
		transition: all $transition;
		position: absolute;
		width: 12px;
		margin: 0 !important;
		padding: 0 !important;
	}
}
</style>