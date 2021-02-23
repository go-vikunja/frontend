const {createVuePlugin} = require('vite-plugin-vue2')
const path = require('path')

module.exports = {
	plugins: [createVuePlugin()],
	resolve: {
		alias: [
			{
				find: '@',
				replacement: path.resolve(__dirname, 'src'),
			},
		],
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
	},
	build: {
		target: 'es2015',
		manifest: true,
		rollupOptions: {
			output: {
				manualChunks:{
					'user-settings': [
						'./src/views/user/PasswordReset',
						'./src/views/user/RequestPasswordReset',
						'./src/views/user/Settings',
					],
					'settings': [
						'./src/views/list/NewList',
						'./src/views/namespaces/NewNamespace',
						'./src/views/teams/EditTeam',
						'./src/views/teams/NewTeam',
					],
				},
			},
		},
	},
}
