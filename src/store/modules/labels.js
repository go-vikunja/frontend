import LabelService from '@/services/label'
import Vue from 'vue'
import {setLoading} from '@/store/helper'

export default {
	namespaced: true,
	// The state is an object which has the label ids as keys.
	state: () => ({
		labels: {},
		loaded: false,
	}),
	mutations: {
		setLabels(state, labels) {
			labels.forEach(l => {
				Vue.set(state.labels, l.id, l)
			})
		},
		setLabel(state, label) {
			Vue.set(state.labels, label.id, label)
		},
		removeLabelById(state, label) {
			Vue.delete(state.labels, label.id)
		},
		setLoaded(state, loaded) {
			state.loaded = loaded
		},
	},
	actions: {
		loadAllLabels(ctx, {forceLoad} = {}) {
			if (ctx.state.loaded && !forceLoad) {
				return Promise.resolve()
			}

			const cancel = setLoading(ctx, 'labels')
			const labelService = new LabelService()

			const getAllLabels = (page = 1) => {
				return labelService.getAll({}, {}, page)
					.then(labels => {
						if (page < labelService.totalPages) {
							return getAllLabels(page + 1)
								.then(nextLabels => {
									return labels.concat(nextLabels)
								})
						} else {
							return labels
						}
					})
					.catch(e => {
						return Promise.reject(e)
					})
			}

			return getAllLabels()
				.then(r => {
					ctx.commit('setLabels', r)
					ctx.commit('setLoaded', true)
					return Promise.resolve(r)
				})
				.catch(e => Promise.reject(e))
				.finally(() => cancel())
		},
		deleteLabel(ctx, label) {
			const cancel = setLoading(ctx, 'labels')
			const labelService = new LabelService()

			return labelService.delete(label)
				.then(r => {
					ctx.commit('removeLabelById', label)
					return Promise.resolve(r)
				})
				.catch(e => Promise.reject(e))
				.finally(() => cancel())
		},
		updateLabel(ctx, label) {
			const cancel = setLoading(ctx, 'labels')
			const labelService = new LabelService()

			return labelService.update(label)
				.then(r => {
					ctx.commit('setLabel', r)
					return Promise.resolve(r)
				})
				.catch(e => Promise.reject(e))
				.finally(() => cancel())
		},
		createLabel(ctx, label) {
			const cancel = setLoading(ctx, 'labels')
			const labelService = new LabelService()

			return labelService.create(label)
				.then(r => {
					ctx.commit('setLabel', r)
					return Promise.resolve(r)
				})
				.catch(e => Promise.reject(e))
				.finally(() => cancel())
		},
	},
}
