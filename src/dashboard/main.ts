import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/assets/css/bootstrap-noglyph.min.css'
import 'font-awesome/css/font-awesome.min.css'
import '@/assets/css/custom.min.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
