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
}
