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
            <p>Gravida massa volutpat aenean odio. Amet, turpis erat nullam fringilla elementum diam in. Nisi, purus
              vitae, ultrices nunc. Sit ac sit suscipit hendrerit.</p>
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
                      <use xlink:href="#youtube"></use>
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" class="text-secondary">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <use xlink:href="#pinterest"></use>
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
              <li class="menu-item"><a href="/about" class="item-anchor">About</a></li>
              <li class="menu-item"><a href="/blog" class="item-anchor">Services</a></li>
              <li class="menu-item"><a href="/styles" class="item-anchor">Single item</a></li>
              <li class="menu-item"><a href="/contact" class="item-anchor">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-003">
            <h5 class="widget-title text-uppercase mb-4">Help & Info</h5>
            <ul class="menu-list list-unstyled text-uppercase border-animation-left fs-6">
              <li class="menu-item"><a href="#" class="item-anchor">Track Your Order</a></li>
              <li class="menu-item"><a href="#" class="item-anchor">Returns + Exchanges</a></li>
              <li class="menu-item"><a href="#" class="item-anchor">Shipping + Delivery</a></li>
              <li class="menu-item"><a href="/contact" class="item-anchor">Contact Us</a></li>
              <li class="menu-item"><a href="#" class="item-anchor">Find us easy</a></li>
              <li class="menu-item"><a href="/faqs" class="item-anchor">Faqs</a></li>
            </ul>
          </div>
        </div>
        <div class="col-md-3 col-sm-6">
          <div class="footer-menu footer-menu-004 border-animation-left">
            <h5 class="widget-title text-uppercase mb-4">Contact Us</h5>
            <p>Do you have any questions or suggestions? <a href="mailto:contact@yourcompany.com" class="item-anchor">contact@yourcompany.com</a></p>
            <p>Do you need support? Give us a call. <a href="tel:+43 720 11 52 78" class="item-anchor">+43 720 11 52 78</a></p>
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
            <p>@ 2026 SISYN CORPORATION . All Right Reserved</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import mainLogo from '@/assets/kaira/images/logosigyn.png'
</script>