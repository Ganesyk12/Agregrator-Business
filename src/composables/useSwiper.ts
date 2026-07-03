// src/composables/useSwiper.ts
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
// IMPORT Swiper dari NPM (BUKAN CDN)
import Swiper from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import AOS from 'aos'

export interface SwiperOptions {
  slidesPerView?: number | 'auto'
  spaceBetween?: number
  loop?: boolean
  autoplay?: {
    delay: number
    disableOnInteraction?: boolean
  }
  navigation?: {
    nextEl: string
    prevEl: string
  }
  pagination?: {
    el: string
    clickable?: boolean
  }
  breakpoints?: Record<number, any>
  on?: Record<string, (...args: any[]) => void>
}

export function useSwiper(selector: string, options: SwiperOptions = {}) {
  const swiperInstance = ref<any>(null)
  const isInitialized = ref(false)

  const defaultOptions: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.icon-arrow-right',
      prevEl: '.icon-arrow-left'
    },
    breakpoints: {
      576: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 3, spaceBetween: 20 },
      992: { slidesPerView: 4, spaceBetween: 20 }
    }
  }

  const mergedOptions = { ...defaultOptions, ...options }

  const initSwiper = async () => {
    await nextTick()
    const element = document.querySelector(selector)
    if (!element) {
      console.warn(`Swiper element "${selector}" not found`)
      return
    }

    if (swiperInstance.value) {
      swiperInstance.value.destroy(true, true)
      swiperInstance.value = null
    }

    // LANGSUNG pake Swiper dari import
    swiperInstance.value = new Swiper(selector, mergedOptions)
    isInitialized.value = true

    // Refresh AOS setelah Swiper memodifikasi DOM
    AOS.refresh()
  }

  const destroySwiper = () => {
    if (swiperInstance.value) {
      swiperInstance.value.destroy(true, true)
      swiperInstance.value = null
      isInitialized.value = false
    }
  }

  const updateSwiper = () => {
    if (swiperInstance.value) {
      swiperInstance.value.update()
    }
  }

  onMounted(() => {
    initSwiper()
  })

  onBeforeUnmount(() => {
    destroySwiper()
  })

  return {
    swiperInstance,
    isInitialized,
    initSwiper,
    destroySwiper,
    updateSwiper
  }
}