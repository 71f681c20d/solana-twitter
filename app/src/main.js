// Import CSS styling
import 'solana-wallets-vue/styles.css'
import './main.css'

// Day.js for date formatting
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

// Router configuration
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(router).mount('#app')
