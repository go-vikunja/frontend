const {createVuePlugin} = require('vite-plugin-vue2')

module.exports = {
	plugins: [createVuePlugin(/*options*/)],
	resolve: {
		alias: {'@': './src'},
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
	},
}
