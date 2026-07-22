<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import BrandStorySection from '@/components/home/BrandStorySection.vue'
import CelebrationSection from '@/components/home/CelebrationSection.vue'
import InspirationSection from '@/components/home/InspirationSection.vue'
import VendorCategoryShowcase from '@/components/home/VendorCategoryShowcase.vue'
import FeaturedVendors from '@/components/home/FeaturedVendors.vue'
import ServiceCategorySection from '@/components/home/ServiceCategorySection.vue'
import WhyChooseUs from '@/components/home/WhyChooseUs.vue'
import HowItWorks from '@/components/home/HowItWorks.vue'
import PartnerSection from '@/components/home/PartnerSection.vue'
import TestimonialSection from '@/components/home/TestimonialSection.vue'
import BookingCTA from '@/components/home/BookingCTA.vue'
import BlogSection from '@/components/home/BlogSection.vue'
import NewsletterSection from '@/components/home/NewsletterSection.vue'
import InstagramSection from '@/components/home/InstagramSection.vue'

const selectedCelebration = ref<string | null>(null)

function onCelebrationSelect(celebration: string | null) {
  selectedCelebration.value = celebration
}
</script>

<template>
  <div class="homepage">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <HeroBanner />
    <BrandStorySection />

    <CelebrationSection
      :selected="selectedCelebration"
      @select="onCelebrationSelect"
    />

    <InspirationSection
      :celebration-filter="selectedCelebration"
    />

    <VendorCategoryShowcase
      :celebration-filter="selectedCelebration"
    />

    <FeaturedVendors />
    <ServiceCategorySection />
    <WhyChooseUs />
    <HowItWorks />
    <PartnerSection />
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
