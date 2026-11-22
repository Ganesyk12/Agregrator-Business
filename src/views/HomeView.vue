<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import CelebrationSection from '@/components/home/CelebrationSection.vue'
import InspirationSection from '@/components/home/InspirationSection.vue'
import CategorySectionView from '@/components/home/CategorySectionView.vue'
import VendorSectionView from '@/components/home/VendorSectionView.vue'
import WhyChooseUs from '@/components/home/WhyChooseUs.vue'
import HowItWorks from '@/components/home/HowItWorks.vue'
import PartnerSection from '@/components/home/PartnerSection.vue'

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

    <CelebrationSection
      :selected="selectedCelebration"
      @select="onCelebrationSelect"
    />

    <InspirationSection
      :celebration-filter="selectedCelebration"
    />

    <CategorySectionView
      :celebration-filter="selectedCelebration"
    />

    <VendorSectionView />

    <WhyChooseUs />
    <HowItWorks />
    <PartnerSection />

    <Footer />
  </div>
</template>

<style scoped>
.product-occasion-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 2px 0 4px;
}

.product-occasion-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid rgba(184, 156, 123, 0.35);
  border-radius: 999px;
  background: rgba(184, 156, 123, 0.12);
  color: #8a6d4b;
  font-family: 'Jost', sans-serif;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: capitalize;
  white-space: nowrap;
}
</style>


