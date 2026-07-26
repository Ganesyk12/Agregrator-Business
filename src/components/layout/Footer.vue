<template>
  <footer id="footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <router-link to="/">
              <img :src="mainLogo" alt="Sigyn" class="footer-logo" />
            </router-link>
            <p class="footer-description">
              <strong>Sigyn</strong> is a premier inspiration-driven creative booking platform connecting you with trusted creative vendors for your most important celebrations. <em>Where Art Meets Every Occasion.</em>
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
              <a href="#" class="social-link" aria-label="Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="footer-links">
            <h5 class="footer-heading">Quick Links</h5>
            <ul class="footer-menu">
              <li><router-link to="/">Home</router-link></li>
              <li><router-link to="/explore">Explore</router-link></li>
              <li><router-link to="/inspiration">Inspiration</router-link></li>
              <li><router-link to="/partner">Become Partner</router-link></li>
              <li><router-link to="/contact">Contact</router-link></li>
              <li><router-link to="/about">About</router-link></li>
            </ul>
          </div>

          <div class="footer-links">
            <h5 class="footer-heading">Services</h5>
            <ul class="footer-menu">
              <li><router-link to="/explore">Photography</router-link></li>
              <li><router-link to="/explore">Makeup Artist</router-link></li>
              <li><router-link to="/explore">Bouquet Flowers</router-link></li>
              <li><router-link to="/booking">Booking</router-link></li>
            </ul>
          </div>

          <div class="footer-contact">
            <h5 class="footer-heading">Contact Us</h5>
            <p>Have questions or need assistance?</p>
            <p><a href="mailto:hello@sigyn.id" class="contact-link">hello@sigyn.id</a></p>
            <p>Need help with your booking?</p>
            <p><a href="tel:+62123456789" class="contact-link">+62 123 4567 890</a></p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} SIGYN. All rights reserved. <span class="tagline">Where Art Meets Every Occasion.</span></p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import mainLogo from '@/assets/kaira/images/logosigyn.png'
</script>

<style scoped>
footer {
  background: #1a1a1a;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Jost', sans-serif;
}

.footer-main {
  padding: 80px 0 60px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 48px;
}

.footer-logo {
  height: 48px;
  width: auto;
  margin-bottom: 20px;
  filter: brightness(0) invert(1);
}

.footer-description {
  font-size: 0.9rem;
  line-height: 1.7;
  margin-bottom: 24px;
  max-width: 340px;
}

.footer-description strong {
  color: #fff;
}

.footer-description em {
  color: var(--bs-secondary, #B89C7B);
  font-style: normal;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
  transform: translateY(-2px);
}

.footer-heading {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 24px;
  font-weight: 400;
}

.footer-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-menu a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
}

.footer-menu a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--bs-secondary, #B89C7B);
  transition: width 0.3s ease;
}

.footer-menu a:hover {
  color: var(--bs-secondary, #B89C7B);
}

.footer-menu a:hover::after {
  width: 100%;
}

.footer-contact p {
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 8px;
}

.contact-link {
  color: var(--bs-secondary, #B89C7B);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #fff;
}

.footer-bottom {
  padding: 24px 0;
  text-align: center;
}

.footer-bottom p {
  font-size: 0.85rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.4);
}

.tagline {
  color: var(--bs-secondary, #B89C7B);
}

@media (max-width: 992px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 576px) {
  .footer-main {
    padding: 60px 0 40px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .container {
    padding: 0 16px;
  }
}
</style>