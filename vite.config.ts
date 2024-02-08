/// <reference types="vitest" />
import {defineConfig, type PluginOption, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import legacyFn from '@vitejs/plugin-legacy'
import {URL, fileURLToPath} from 'node:url'
import {dirname, resolve} from 'node:path'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import {VitePWA} from 'vite-plugin-pwa'
import VitePluginInjectPreload from 'vite-plugin-inject-preload'
import {visualizer} from 'rollup-plugin-visualizer'

import viteSentry, {type ViteSentryPluginOptions} from 'vite-plugin-sentry'
import svgLoader from 'vite-svg-loader'
import postcssPresetEnv from 'postcss-preset-env'
import postcssEasings from 'postcss-easings'
import postcssEasingGradients from 'postcss-easing-gradients'


const pathSrc = fileURLToPath(new URL('./src', import.meta.url))

import {VERSION} from './src/version.json'

// the @use rules have to be the first in the compiled stylesheets
const PREFIXED_SCSS_STYLES = `@use "sass:math";
@import "${pathSrc}/styles/common-imports";`

const isModernBuild = Boolean(process.env.BUILD_MODERN_ONLY)
const legacy = isModernBuild
	? undefined
	: legacyFn()

console.log(isModernBuild
	? 'Building "modern-only" build'
	: 'Building "legacy" build with "@vitejs/plugin-legacy"',
)

/*
** Configure sentry plugin
*/
function getSentryConfig(env: ImportMetaEnv): ViteSentryPluginOptions {
	return {
		skipEnvironmentCheck: true,

		url: 'https://sentry.io',
		authToken: env.SENTRY_AUTH_TOKEN,
		org: env.SENTRY_ORG,
		project: env.SENTRY_PROJECT,
		release: VERSION,
		cleanSourcemapsAfterUpload: true,
		legacyErrorHandlingMode: true,
		deploy: {
			env: env.MODE,
		},
		setCommits: {
			auto: true,
			ignoreMissing: true,
		},
		sourceMaps: {
			include: ['./dist/assets'],
			ignore: ['node_modules'],
			urlPrefix: '~/assets',
		},
	}
}

/**
 * @param fontNames Array of the file names of the fonts without axis and hash suffixes
 */
function createFontMatcher(fontNames: string[]) {
	// The `match` option for the files of VitePluginInjectPreload
	// matches the _output_ files.
	// Since we only want to mach variable fonts, we exploit here the fact
	// that we added the `wght` term to indicate the variable weight axis.
	// The format is something like:
	// `/assets/OpenSans-Italic_wght__c9a8fe68-5f21f1e7.woff2`
	// see: https://regex101.com/r/UgUWr1/1
	return new RegExp(`^.+\\/(${fontNames.join('|')})_wght__[a-z1-9]{8}-[a-z1-9]{8}\\.woff2$`)
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	// https://vitejs.dev/config/#environment-variables
	const env = loadEnv(mode, process.cwd(), '')

	return {
		base: env.VIKUNJA_FRONTEND_BASE,
		// https://vitest.dev/config/
		test: {
			environment: 'happy-dom',
			'vitest.commandLine': 'pnpm test:unit',
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: PREFIXED_SCSS_STYLES,
					charset: false, // fixes  "@charset" must be the first rule in the file" warnings
				},
			},
			postcss: {
				plugins: [
					postcssEasings(),
					postcssEasingGradients(),
					postcssPresetEnv({
						// Since postcss-preset-env v8.0.0 the 'enableClientSidePolyfills' option is disabled by default.
						// This is the list of features that require a client side library:
						// https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#plugins-that-need-client-library
						// Since we only use 'focus-within-pseudo-class' we have to force enable
						// that plugin now manually in order to keep the browser support as it was.
						// See also './src/polyfills.ts'
						features: {
							'focus-within-pseudo-class': true,
							'has-pseudo-class': true,
						},
					}),
				],
			},
		},
		plugins: [
			vue({
				reactivityTransform: true,
				script: {
					propsDestructure: true,
				},
			}),
			legacy,
			svgLoader({
				// Since the svgs are already manually optimized via https://jakearchibald.github.io/svgomg/
				// we don't need to optimize them again.
				svgo: false,
			}),
			VueI18nPlugin({
				// TODO: only install needed stuff
				// Whether to install the full set of APIs, components, etc. provided by Vue I18n.
				// By default, all of them will be installed.
				fullInstall: true,
				include: resolve(dirname(pathSrc), './src/i18n/lang/**'),
			}),
			// https://github.com/Applelo/vite-plugin-inject-preload
			VitePluginInjectPreload({
				files: [{
					match: createFontMatcher(['Quicksand', 'OpenSans', 'OpenSans-Italic']),
					attributes: {crossorigin: 'anonymous'},
				}],
				injectTo: 'custom',
			}),
			VitePWA({
				srcDir: 'src',
				filename: 'sw.ts',
				strategies: 'injectManifest',
				injectRegister: false,
				manifest: {
					name: 'Vikunja',
					short_name: 'Vikunja',
					theme_color: '#1973ff',
					icons: [
						{
							src: './images/icons/android-chrome-192x192.png',
							sizes: '192x192',
							type: 'image/png',
						},
						{
							src: './images/icons/android-chrome-512x512.png',
							sizes: '512x512',
							type: 'image/png',
						},
						{
							src: './images/icons/icon-maskable.png',
							sizes: '1024x1024',
							type: 'image/png',
							purpose: 'maskable',
						},
					],
					start_url: '.',
					display: 'standalone',
					background_color: '#000000',
					shortcuts: [
						{
							name: 'Overview',
							url: '/',
						},
						{
							name: 'Namespaces And Projects Overview',
							short_name: 'Namespaces & Projects',
							url: '/namespaces',
						},
						{
							name: 'Tasks Next Week',
							short_name: 'Next Week',
							url: '/tasks/by/week',
						},
						{
							name: 'Tasks Next Month',
							short_name: 'Next Month',
							url: '/tasks/by/month',
						},
						{
							name: 'Teams Overview',
							short_name: 'Teams',
							url: '/teams',
						},
					],
					share_target: {
						action: '/tasks/create',
						enctype: 'application/x-www-form-urlencoded',
						method: 'GET',
						params: {
							title: 'title',
							text: 'description',
						},
					},
				},
			}),
			viteSentry(getSentryConfig(env)),
		],
		resolve: {
			alias: [
				{
					find: '@',
					replacement: pathSrc,
				},
			],
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
		},
		server: {
			host: '127.0.0.1', // see: https://github.com/vitejs/vite/pull/8543
			port: 4173,
			strictPort: true,
		},
		output: {
			manualChunks: {
				// by putting tracking related stuff in a separated file we try to prevent unwanted blocking from ad-blockers
				sentry: ['./src/sentry.ts', '@sentry/vue', '@sentry/tracing'],
			},
		},
		build: {
			target: 'esnext',
			// required for sentry debugging: tells vite to create source maps
			sourcemap: true,
			rollupOptions: {
				plugins: [
					visualizer({
						filename: 'stats.html',
						gzipSize: true,
						// template: 'sunburst',
						// brotliSize: true,
					}) as PluginOption,
				],
			},
		},
	}
})
