<template>
  <footer id="footer" class="mt-5">
    <div class="container">
      <div class="row d-flex flex-wrap justify-content-between py-5">
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-001">
            <div class="footer-intro mb-4">
              <a href="/">
                <img :src="mainLogo" alt="Sigyn" style="max-width: 150px; height: auto;">
              </a>
            </div>
            <p>Solusi terpercaya untuk menghadirkan vendor terbaik di setiap momen spesial Anda. Dari fotografi, MUA, hingga dekorasi, semua kebutuhan acara Anda ada di sini.</p>
            <div class="social-links">
              <ul class="list-unstyled d-flex flex-wrap gap-3">
                <li>
                  <a href="#" class="text-secondary">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#facebook"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#twitter"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#instagram"></use>
                    </svg>
                  </a>
                </li>

              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-002">
            <h5 class="widget-title text-uppercase mb-4">Quick Links</h5>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6">
              <li class="menu-item"><a href="/" class="item-anchor">Home</a></li>
              <li class="menu-item"><a href="/photography" class="item-anchor">Photography</a></li>
              <li class="menu-item"><a href="/mua" class="item-anchor">MUA</a></li>
              <li class="menu-item"><a href="/bouquet" class="item-anchor">Bouquet Flowers</a></li>
              <li class="menu-item"><a href="/services" class="item-anchor">More Service</a></li>
              <li class="menu-item"><a href="/contact" class="item-anchor">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-004 border-animation-left">
            <h5 class="widget-title text-uppercase mb-4">Contact Us</h5>
            <p v-if="company.email">Do you have any questions or suggestions? <a :href="'mailto:' + company.email" class="item-anchor">{{ company.email }}</a></p>
            <p v-if="company.phone">Do you need support? Give us a call. <a :href="'tel:' + company.phone" class="item-anchor">{{ company.phone }}</a></p>
            <p v-if="company.address" class="mt-2">{{ company.address }}</p>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6 mt-3">
              <li class="menu-item"><a href="/faqs" class="item-anchor">FAQs</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="border-top py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-6 d-flex flex-wrap">
          </div>
          <div class="col-md-6 text-end">
            <p>@ 2026 {{ (company.company_name || 'SIGYN').toUpperCase() }} . All Right Reserved</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import mainLogo from '@/assets/kaira/images/logosigyn.png'

interface CompanyInfo {
  company_name: string
  address: string
  phone: string
  email: string
  website: string
  footer_text: string
  logo_url: string
}

const company = ref<CompanyInfo>({
  company_name: 'Sigyn',
  address: '',
  phone: '',
  email: '',
  website: '',
  footer_text: '',
  logo_url: '',
})

onMounted(async () => {
  try {
    const res = await fetch('/api/company-info')
    const json = await res.json()
    if (res.ok && json.data) {
      company.value = { ...company.value, ...json.data }
    }
  } catch {
    // fallback
  }
})
</script>