<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import FeaturesSection from '@/components/home/FeaturesSection.vue'
import CategorySection from '@/components/home/CategorySection.vue'
import PackageSection from '@/components/home/PackageSection.vue'
import ProductSection from '@/components/home/ProductSection.vue'
import VideoSection from '@/components/home/VideoSection.vue'
import TestimonialSection from '@/components/home/TestimonialSection.vue'
import BlogSection from '@/components/home/BlogSection.vue'
import LogoBar from '@/components/home/LogoBar.vue'
import InstagramSection from '@/components/home/InstagramSection.vue'
import NewsletterSection from '@/components/home/NewsletterSection.vue'

import imgProduct1 from '@/assets/kaira/images/product-item-1.jpg'
import imgProduct2 from '@/assets/kaira/images/product-item-2.jpg'
import imgProduct3 from '@/assets/kaira/images/product-item-3.jpg'
import imgProduct4 from '@/assets/kaira/images/product-item-4.jpg'
import imgProduct5 from '@/assets/kaira/images/product-item-5.jpg'
import imgProduct6 from '@/assets/kaira/images/product-item-6.jpg'
import imgProduct7 from '@/assets/kaira/images/product-item-7.jpg'
import imgProduct8 from '@/assets/kaira/images/product-item-8.jpg'
import imgProduct9 from '@/assets/kaira/images/product-item-9.jpg'
import imgProduct10 from '@/assets/kaira/images/product-item-10.jpg'

interface Product {
  id: number
  image: string
  name: string
  price: string
}

const newArrivals: Product[] = [
  { id: 1, image: imgProduct1, name: 'Dark florish onepiece', price: '$95.00' },
  { id: 2, image: imgProduct2, name: 'Baggy Shirt', price: '$55.00' },
  { id: 3, image: imgProduct3, name: 'Cotton off-white shirt', price: '$65.00' },
  { id: 4, image: imgProduct4, name: 'Crop sweater', price: '$50.00' },
  { id: 5, image: imgProduct10, name: 'Crop sweater', price: '$70.00' }
]

const bestSellers: Product[] = [
  { id: 1, image: imgProduct4, name: 'Dark florish onepiece', price: '$95.00' },
  { id: 2, image: imgProduct3, name: 'Baggy Shirt', price: '$55.00' },
  { id: 3, image: imgProduct5, name: 'Cotton off-white shirt', price: '$65.00' },
  { id: 4, image: imgProduct6, name: 'Handmade crop sweater', price: '$50.00' },
  { id: 5, image: imgProduct9, name: 'Dark florish onepiece', price: '$70.00' },
  { id: 6, image: imgProduct10, name: 'Cotton off-white shirt', price: '$70.00' }
]

const relatedProducts: Product[] = [
  { id: 1, image: imgProduct5, name: 'Dark florish onepiece', price: '$95.00' },
  { id: 2, image: imgProduct6, name: 'Baggy Shirt', price: '$55.00' },
  { id: 3, image: imgProduct7, name: 'Cotton off-white shirt', price: '$65.00' },
  { id: 4, image: imgProduct8, name: 'Handmade crop sweater', price: '$50.00' },
  { id: 5, image: imgProduct1, name: 'Handmade crop sweater', price: '$70.00' }
]
</script>

<template>
  <div class="homepage">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />
    
    <HeroBanner />
    <FeaturesSection />
    <CategorySection />
    
    <PackageSection />
    
    <ProductSection 
      title="Our New Arrivals"
      :products="newArrivals"
      swiper-class="product-swiper"
      view-all-link="/shop"
    />
    
    
    <ProductSection 
      title="Best Selling Items"
      :products="bestSellers"
      swiper-class="best-sellers-swiper"
      view-all-link="/shop"
    />
    
    <VideoSection />
    <TestimonialSection />
    
    <ProductSection 
      title="You May Also Like"
      :products="relatedProducts"
      swiper-class="related-products-swiper"
      view-all-link="/shop"
    />
    
    <BlogSection />
    <LogoBar />
    <NewsletterSection />
    <InstagramSection />
    
    <Footer />
  </div>
</template>

<style scoped>
.homepage {
  background: #fff;
}
</style>