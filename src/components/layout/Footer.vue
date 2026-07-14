<template>
  <footer id="footer" class="mt-5">
    <div class="container">
      <div class="row d-flex flex-wrap justify-content-between py-5">
        <div class="col-md-4 col-sm-6">
          <div class="footer-menu footer-menu-001">
            <div class="footer-intro mb-4">
              <router-link to="/">
                <img :src="mainLogo" alt="Sigyn" style="max-width: 150px; height: auto;">
              </router-link>
            </div>
            <p class="mb-3">
              <strong>Sigyn</strong> adalah platform aggregator yang menghubungkan Anda dengan vendor jasa kreatif terkurasi — fotografi, makeup artist, nail art, dan bouquet flowers. <em>Where Art Meets Every Occasion.</em>
            </p>
            <div class="social-links">
              <ul class="list-unstyled d-flex flex-wrap gap-3">
                <li>
                  <a href="#" class="text-secondary" aria-label="Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#instagram"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary" aria-label="Facebook">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#facebook"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary" aria-label="Twitter">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#twitter"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary" aria-label="YouTube">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#youtube"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary" aria-label="Pinterest">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#pinterest"></use>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="col-md-2 col-sm-6">
          <div class="footer-menu footer-menu-002">
            <h5 class="widget-title text-uppercase mb-4">Quick Links</h5>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6">
              <li class="menu-item"><router-link to="/" class="item-anchor">Beranda</router-link></li>
              <li class="menu-item"><router-link to="/about" class="item-anchor">Tentang</router-link></li>
              <li class="menu-item"><router-link to="/shop" class="item-anchor">Explore</router-link></li>
              <li class="menu-item"><router-link to="/photography" class="item-anchor">Photography</router-link></li>
              <li class="menu-item"><router-link to="/mua" class="item-anchor">MUA</router-link></li>
              <li class="menu-item"><router-link to="/bouquet" class="item-anchor">Bouquet</router-link></li>
            </ul>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-003">
            <h5 class="widget-title text-uppercase mb-4">Layanan</h5>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6">
              <li class="menu-item"><router-link to="/photography" class="item-anchor">Photography</router-link></li>
              <li class="menu-item"><router-link to="/mua" class="item-anchor">Makeup Artist</router-link></li>
              <li class="menu-item"><router-link to="/photography" class="item-anchor">Nail Art</router-link></li>
              <li class="menu-item"><router-link to="/bouquet" class="item-anchor">Bouquet Flowers</router-link></li>
              <li class="menu-item"><router-link to="/booking" class="item-anchor">Booking</router-link></li>
            </ul>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-004 border-animation-left">
            <h5 class="widget-title text-uppercase mb-4">Contact Us</h5>
            <p class="mb-2">Punya pertanyaan atau saran?</p>
            <p><a href="mailto:hello@sigyn.id" class="item-anchor">hello@sigyn.id</a></p>
            <p class="mb-2">Butuh bantuan?</p>
            <p><a href="tel:+62123456789" class="item-anchor">+62 123 4567 890</a></p>
          </div>
        </div>
      </div>
    </div>
    <div class="border-top py-4">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <p class="mb-0">&copy; {{ new Date().getFullYear() }} Sigyn. All rights reserved.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <p class="mb-0">Where Art Meets Every Occasion</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import mainLogo from '@/assets/kaira/images/logosigyn.png'
</script>
