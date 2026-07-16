<template>
  <footer id="footer" class="mt-5">
    <div class="container">
      <div class="row py-5">
        <div class="col-md-5 col-sm-6 mb-4 mb-md-0">
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
        <div class="col-md-2 col-sm-6 mb-4 mb-md-0">
          <div class="footer-menu footer-menu-002">
            <h5 class="widget-title text-uppercase mb-4">Quick Links</h5>
            <ul class="menu-list list-unstyled text-uppercase fs-6">
              <li class="menu-item mb-2"><a href="/" class="item-anchor">Home</a></li>
              <li class="menu-item mb-2"><a href="/photography" class="item-anchor">Photography</a></li>
              <li class="menu-item mb-2"><a href="/mua" class="item-anchor">MUA</a></li>
              <li class="menu-item mb-2"><a href="/bouquet" class="item-anchor">Bouquet Flowers</a></li>
              <li class="menu-item mb-2"><a href="/services" class="item-anchor">More Service</a></li>
              <li class="menu-item"><a href="/contact" class="item-anchor">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-4 offset-md-1 col-sm-6">
          <div class="footer-menu footer-menu-004">
            <h5 class="widget-title text-uppercase mb-4">Contact Us</h5>
            <div class="contact-item" v-if="company.address">
              <div class="contact-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Address</span>
                <span class="contact-value">{{ company.address }}</span>
              </div>
            </div>
            <div class="contact-item" v-if="company.phone">
              <div class="contact-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Phone</span>
                <a :href="'tel:' + company.phone" class="contact-value">{{ company.phone }}</a>
              </div>
            </div>
            <div class="contact-item" v-if="company.email">
              <div class="contact-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="contact-text">
                <span class="contact-label">Email</span>
                <a :href="'mailto:' + company.email" class="contact-value">{{ company.email }}</a>
              </div>
            </div>
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

<style scoped>
.contact-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.contact-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #666;
}

.contact-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
}

.contact-value {
  font-size: 0.9rem;
  color: #555;
  text-decoration: none;
}

.contact-value:hover {
  color: #000;
}
</style>