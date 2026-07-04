// src/types/swiper.d.ts
declare module 'swiper' {
  import { Swiper as SwiperClass } from 'swiper/types'
  const Swiper: typeof SwiperClass
  export default Swiper
}

declare module 'swiper/css' {
  const content: string
  export default content
}

declare module 'swiper/css/navigation' {
  const content: string
  export default content
}

declare module 'swiper/css/pagination' {
  const content: string
  export default content
}

declare module 'swiper/modules' {
  export const Navigation: any
  export const Pagination: any
  export const Autoplay: any
}