<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import BrandStorySection from '@/components/home/BrandStorySection.vue'
import ServiceCategorySection from '@/components/home/ServiceCategorySection.vue'
import HowItWorks from '@/components/home/HowItWorks.vue'
import FeaturedVendors from '@/components/home/FeaturedVendors.vue'
import WhyChooseUs from '@/components/home/WhyChooseUs.vue'
import TestimonialSection from '@/components/home/TestimonialSection.vue'
import BookingCTA from '@/components/home/BookingCTA.vue'
import BlogSection from '@/components/home/BlogSection.vue'
import NewsletterSection from '@/components/home/NewsletterSection.vue'
import InstagramSection from '@/components/home/InstagramSection.vue'
</script>

<template>
  <div class="homepage">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <HeroBanner />
    <BrandStorySection />
    <ServiceCategorySection />
    <HowItWorks />
    <FeaturedVendors />
    <WhyChooseUs />
    <TestimonialSection />
    <BookingCTA />
    <BlogSection />
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
