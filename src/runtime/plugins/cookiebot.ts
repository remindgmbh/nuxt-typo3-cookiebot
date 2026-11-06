import {
    defineNuxtPlugin,
    useCookie,
    useHead,
    useLogger,
    useRuntimeConfig,
    useT3CookieConsent,
} from '#imports'
import type { Cookiebot } from '../types/cookiebot'

interface CookieConsent {
    stamp: string
    necessary: boolean
    preferences: boolean
    statistics: boolean
    marketing: boolean
    ver: number
    utc: number
    region: string
}

export default defineNuxtPlugin((nuxt) => {
    const logger = useLogger()

    const config = useRuntimeConfig().public.typo3Cookiebot

    if (!config.cbid) {
        logger.warn('Cookiebot disabled: Cookiebot ID not configured')
        return
    }

    const { cookieCategories } = useT3CookieConsent()

    setCookieCategories()

    nuxt.hook('app:beforeMount', () => {
        window.addEventListener('CookiebotOnAccept', setCookieCategories)
        window.addEventListener('CookiebotOnDecline', setCookieCategories)
    })

    nuxt.hook('typo3:cookieConsent:acceptCookies', (category) => {
        if (!import.meta.client || !window.Cookiebot) {
            return
        }

        const cookiebot = window.Cookiebot as Cookiebot
        cookiebot.submitCustomConsent(
            category === 'preferences' ||
                (cookiebot.consent.preferences ?? false),
            category === 'statistics' ||
                (cookiebot.consent.statistics ?? false),
            category === 'marketing' || (cookiebot.consent.marketing ?? false),
        )
    })

    nuxt.hook('typo3:cookieConsent:showBanner', () => {
        if (import.meta.client && window.Cookiebot) {
            const cookiebot = window.Cookiebot as Cookiebot
            cookiebot.renew()
        }
    })

    useHead({
        script: [
            {
                'data-cbid': config.cbid,
                id: 'Cookiebot',
                src: 'https://consent.cookiebot.com/uc.js',
            },
        ],
    })

    function setCookieCategories() {
        // required due to SSR, because window is not available
        const cookieConsent = useCookie<CookieConsent>('CookieConsent', {
            decode: (value) =>
                // use regex from https://www.cookiebot.com/en/developer/ (Server side usage - PHP)
                JSON.parse(
                    decodeURIComponent(value ?? '')
                        .replaceAll("'", '"')
                        .replaceAll(/([{[,])\s*(\w+):/g, '$1"$2":'),
                ),
        })

        if (cookieConsent.value) {
            cookieCategories.value.necessary = cookieConsent.value.necessary
            cookieCategories.value.marketing = cookieConsent.value.marketing
            cookieCategories.value.preferences = cookieConsent.value.preferences
            cookieCategories.value.statistics = cookieConsent.value.statistics
        }
    }
})
