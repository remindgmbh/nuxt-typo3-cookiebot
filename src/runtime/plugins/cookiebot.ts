import {
    defineNuxtPlugin,
    useCookie,
    useHead,
    useLogger,
    useRuntimeConfig,
    useT3CookieConsent,
} from '#imports'

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

    nuxt.hook('typo3:cookieConsent:acceptCookies', (category) =>
        window.Cookiebot?.submitCustomConsent(
            category === 'preferences' || window.Cookiebot.consent.preferences,
            category === 'statistics' || window.Cookiebot.consent.statistics,
            category === 'marketing' || window.Cookiebot.consent.marketing,
        ),
    )

    nuxt.hook('typo3:cookieConsent:showBanner', () => window.Cookiebot?.renew())

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
                    decodeURIComponent(value)
                        .replaceAll("'", '"')
                        .replaceAll(/([{[,])\s*([a-zA-Z0-9_]+?):/g, '$1"$2":'),
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
