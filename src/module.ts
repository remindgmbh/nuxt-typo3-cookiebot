import {
    addPlugin,
    createResolver,
    defineNuxtModule,
    hasNuxtModule,
    installModule,
} from '@nuxt/kit'
import { name, version } from '../package.json'
import { defu } from 'defu'

export const CONFIG_KEY = 'typo3Cookiebot'

export interface ModuleOptions {
    // Cookiebot ID
    // https://support.cookiebot.com/hc/en-us/articles/4405643234194-Your-CBID-or-Domain-group-ID-and-where-to-find-it
    cbid: string
}

export default defineNuxtModule<ModuleOptions>({
    defaults: {
        cbid: '',
    },
    meta: {
        configKey: CONFIG_KEY,
        name,
        version,
    },
    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)

        nuxt.options.alias['#nuxt-typo3-cookiebot'] =
            resolver.resolve('runtime')

        nuxt.options.runtimeConfig.public[CONFIG_KEY] = defu(
            nuxt.options.runtimeConfig.public[CONFIG_KEY],
            options,
        )

        nuxt.hook('prepare:types', (options) => {
            options.references.push({
                path: resolver.resolve('runtime/types/schema.d.ts'),
            })
        })

        if (!hasNuxtModule('@remindgmbh/nuxt-typo3')) {
            installModule('@remindgmbh/nuxt-typo3')
        }

        addPlugin({
            src: resolver.resolve('./runtime/plugins/cookiebot'),
        })
    },
})
