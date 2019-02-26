require('dotenv').config();
const HOST_IP = process.env.DEVICE_HOST;

module.exports = {
  env: {
    DEVICE_HOST: HOST_IP,

    // Default to mainnet explorers
    BITCOIN_EXPLORER: process.env.BITCOIN_EXPLORER || 'https://blockstream.info/tx/',
    LIGHTNING_EXPLORER: process.env.LIGHTNING_EXPLORER || 'https://explore.casa/nodes/'
  },
  mode: 'universal',

  /* HTML Page Headers */
  head: {
    title: 'Casa Node',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Casa Lightning Node' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /* Customize progress-bar color */
  loading: { color: '#572bf9' },

  /* Global CSS */
  css: ['~/css/main.css'],

  /* Plugins to load before mounting the App */
  plugins: [
    { src: '~/plugins/vue-slideout', ssr: false },
    { src: '~/plugins/vue-qr-code', ssr: false },
    { src: '~/plugins/vue-moment', ssr: false },
    { src: '~/plugins/vue-clipboard.js', ssr: false },
    { src: '~/plugins/vue-offline.js', ssr: false },
    { src: '~/plugins/filters.js', ssr: false },
    { src: '~/plugins/interceptor', ssr: false },
    { src: '~/plugins/vee-validate.js', ssr: false }
  ],

  /* Load Modules */
  modules: [
    // Docs: https://github.com/samtgarson/nuxt-env
    ['nuxt-env', {keys: ['DEVICE_HOST']}],
    // Docs: https://auth.nuxtjs.org/middleware.html
    '@nuxtjs/auth',
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc: https://buefy.github.io/#/documentation
    ['nuxt-buefy', { css: true, materialDesignIcons: false }],
    // Doc: https://github.com/vaso2/nuxt-fontawesome
    'nuxt-fontawesome'
  ],

  /* Axios module configuration */
  axios: {
    // baseUrl: HOST_IP
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: false, // Configure at layout level
          user: false,  // Configure at layout level
          logout: false
        },
        tokenType: 'JWT'
      }
    },
    redirect: {
      login: '/login',
      logout: '/login',
      user: '/',
      home: '/'
    },
    resetOnError: true,
    watchLoggedIn: false
  },

  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: ['faChevronRight', 'faChevronLeft', 'faExternalLinkAlt']
      }
    ]
  },

  /* Build configuration */
  build: {
    // You can extend webpack config here
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  /* Register middleware */
  router: {
    // middleware: ['user-agent']
  }
}
