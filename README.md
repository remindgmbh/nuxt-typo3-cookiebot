# REMIND - Nuxt TYPO3 Cookiebot

## Requirements

Nuxt3 project with [@remindgmbh/nuxt-typo3](https://github.com/remindgmbh/nuxt-typo3).

## Installation

1. install using `npm install @remindgmbh/nuxt-typo3-cookiebot`

2. add module in nuxt.config.js

    ```javascript
    export default defineNuxtConfig({
        ...
        modules: [
            ...
            '@remindgmbh/nuxt-typo3-cookiebot',
            ...
        ]
        ...
    })
    ```

## Configuration

Module options are described in `ModuleOptions` Interface in [module.ts](src/module.ts) and can be set using the config key `typo3Cookiebot`. Public runtimeConfig can be used as well to set module options.
