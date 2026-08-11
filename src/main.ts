import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import AOS
import AOS from 'aos'
import 'aos/dist/aos.css'

// Import semua CSS dari template
import '@/assets/kaira/css/normalize.css'
import '@/assets/kaira/css/vendor.css'
import '@/assets/kaira/css/swiper-bundle.min.css'
import '@/assets/kaira/style.css'
import 'font-awesome/css/font-awesome.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')

// Init AOS setelah app di-mount
nextTick(() => {
  AOS.init({
    duration: 800,
    once: true,
    offset: 100
  })
})