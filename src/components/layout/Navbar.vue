<template>
  <nav ref="navRef" class="sigyn-navbar" :class="{ 'nav-scrolled': scrolled, 'nav-transparent': !scrolled, 'nav-dark-hero': isDarkHeroPage }">
    <div class="nav-container">
      <div class="nav-left">
        <router-link class="nav-brand" to="/">
          <img :src="mainLogo" alt="Sigyn" class="nav-logo" />
        </router-link>
      </div>

      <div class="nav-center">
        <ul class="nav-menu">
          <li class="nav-item"><router-link class="nav-link" to="/" :class="{ active: $route.path === '/' }">Home</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/explore" :class="{ active: $route.path.startsWith('/explore') }">Explore</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/inspiration" :class="{ active: $route.path.startsWith('/inspiration') }">Inspiration</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/partner" :class="{ active: $route.path === '/partner' }">Become Partner</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/contact" :class="{ active: $route.path === '/contact' }">Contact</router-link></li>
        </ul>
      </div>

      <div class="nav-right">
        <router-link to="/wishlist" class="nav-icon-btn" title="Wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span v-if="auth.wishlistCount > 0" class="nav-badge">{{ auth.wishlistCount }}</span>
        </router-link>

        <a href="#" class="nav-icon-btn" title="Cart" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span v-if="cart.count > 0" class="nav-badge">{{ cart.count }}</span>
        </a>

        <div v-if="!auth.isLoggedIn" class="nav-auth">
          <router-link to="/login" class="nav-btn-login">Sign In</router-link>
        </div>
        <div v-else class="nav-user-dropdown">
          <button class="nav-user-btn" @click="toggleDropdown">
            <span class="nav-avatar">{{ auth.user?.full_name?.charAt(0) || 'U' }}</span>
            <span class="nav-username">{{ auth.user?.full_name?.split(' ')[0] }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="showDropdown" class="nav-dropdown-menu">
              <router-link to="/booking-history" class="dropdown-link">My Bookings</router-link>
              <router-link to="/wishlist" class="dropdown-link">Wishlist</router-link>
              <hr class="dropdown-divider" />
              <a href="#" class="dropdown-link" @click.prevent="handleLogout">Sign Out</a>
            </div>
          </Transition>
        </div>

        <button class="nav-hamburger" @click="toggleMobileMenu" aria-label="Menu">
          <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
          <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
          <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="mobile-menu">
        <div v-if="mobileOpen" class="nav-mobile-overlay">
          <div class="nav-mobile-panel">
            <div class="mobile-header">
              <img :src="mainLogo" alt="Sigyn" class="mobile-logo" />
              <button class="mobile-close" @click="mobileOpen = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <ul class="mobile-menu-list">
              <li><router-link class="mobile-link" to="/" @click="mobileOpen = false">Home</router-link></li>
              <li><router-link class="mobile-link" to="/explore" @click="mobileOpen = false">Explore</router-link></li>
              <li><router-link class="mobile-link" to="/inspiration" @click="mobileOpen = false">Inspiration</router-link></li>
              <li><router-link class="mobile-link" to="/partner" @click="mobileOpen = false">Become Partner</router-link></li>
              <li><router-link class="mobile-link" to="/contact" @click="mobileOpen = false">Contact</router-link></li>
            </ul>
            <div class="mobile-footer">
              <router-link v-if="!auth.isLoggedIn" to="/login" class="mobile-btn-primary" @click="mobileOpen = false">Sign In</router-link>
              <template v-else>
                <router-link to="/booking-history" class="mobile-btn-secondary" @click="mobileOpen = false">My Bookings</router-link>
                <a href="#" class="mobile-btn-secondary" @click.prevent="handleLogout">Sign Out</a>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import mainLogo from '@/assets/kaira/images/logosigyn.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

const isDarkHeroPage = computed(() => route.path === '/partner')

const scrolled = ref(false)
const showDropdown = ref(false)
const mobileOpen = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 60
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function toggleMobileMenu() {
  mobileOpen.value = !mobileOpen.value
}

function handleLogout() {
  showDropdown.value = false
  mobileOpen.value = false
  auth.logout()
  router.push('/')
}

function closeDropdown(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.nav-user-dropdown')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', closeDropdown)
  if (auth.isLoggedIn) {
    auth.refreshWishlistCount()
    cart.fetchCart()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.sigyn-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0 40px;
  height: 72px;
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(0px);
}

.sigyn-navbar.nav-transparent {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.sigyn-navbar.nav-scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.06);
  height: 64px;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.nav-left {
  flex-shrink: 0;
}

.nav-logo {
  height: 48px;
  width: auto;
  transition: height 0.4s ease;
}

.nav-scrolled .nav-logo {
  height: 42px;
}

.nav-center {
  display: flex;
  align-items: center;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bs-black, #2a2a2a);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-transparent .nav-link {
  color: var(--bs-black, #2a2a2a);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 2px;
  background: var(--bs-secondary, #B89C7B);
  border-radius: 2px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: translateX(-50%) scaleX(1);
}

.nav-link:hover {
  background: rgba(184, 156, 123, 0.08);
}

.nav-transparent .nav-link:hover {
  background: rgba(184, 156, 123, 0.08);
  color: var(--bs-secondary, #B89C7B);
}

.nav-link.active {
  font-weight: 600;
  color: var(--bs-secondary, #B89C7B);
}

.nav-transparent .nav-link.active {
  color: var(--bs-secondary, #B89C7B);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nav-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--bs-black, #2a2a2a);
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-transparent .nav-icon-btn {
  color: var(--bs-black, #2a2a2a);
}

.nav-icon-btn:hover {
  background: rgba(184, 156, 123, 0.1);
  color: var(--bs-secondary, #B89C7B);
}

.nav-transparent .nav-icon-btn:hover {
  background: rgba(184, 156, 123, 0.1);
  color: var(--bs-secondary, #B89C7B);
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.nav-auth {
  margin-left: 8px;
}

.nav-btn-login {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  background: var(--bs-black, #2a2a2a);
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-transparent .nav-btn-login {
  background: var(--bs-black, #2a2a2a);
  color: #fff;
}

.nav-btn-login:hover {
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
  transform: translateY(-1px);
}

.nav-user-dropdown {
  position: relative;
  margin-left: 8px;
}

.nav-user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 6px;
  border: none;
  background: rgba(184, 156, 123, 0.1);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--bs-black, #2a2a2a);
}

.nav-transparent .nav-user-btn {
  background: rgba(184, 156, 123, 0.1);
  color: var(--bs-black, #2a2a2a);
}

.nav-user-btn:hover {
  background: rgba(184, 156, 123, 0.2);
}

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.nav-username {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
}

.nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 100;
}

.dropdown-link {
  display: block;
  padding: 10px 16px;
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-black, #2a2a2a);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dropdown-link:hover {
  background: rgba(184, 156, 123, 0.08);
  color: var(--bs-secondary, #B89C7B);
}

.dropdown-divider {
  margin: 4px 0;
  border: none;
  border-top: 1px solid #f0f0f0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.nav-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--bs-black, #2a2a2a);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.nav-transparent .hamburger-line {
  background: var(--bs-black, #2a2a2a);
}

.hamburger-line.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Menu */
.nav-mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1001;
  display: flex;
  justify-content: flex-end;
}

.nav-mobile-panel {
  width: 320px;
  max-width: 85vw;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-logo {
  height: 40px;
}

.mobile-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--bs-black, #2a2a2a);
}

.mobile-close:hover {
  background: #e8e8e8;
}

.mobile-menu-list {
  list-style: none;
  padding: 16px;
  margin: 0;
  flex: 1;
}

.mobile-link {
  display: block;
  padding: 14px 16px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: var(--bs-black, #2a2a2a);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.mobile-link:hover {
  background: rgba(184, 156, 123, 0.08);
  color: var(--bs-secondary, #B89C7B);
}

.mobile-footer {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #f0f0f0;
}

.mobile-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: var(--bs-black, #2a2a2a);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: background 0.2s;
}

.mobile-btn-primary:hover {
  background: var(--bs-secondary, #B89C7B);
  color: #fff;
}

.mobile-btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: #f5f5f5;
  color: var(--bs-black, #2a2a2a);
  border: none;
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: background 0.2s;
}

.mobile-btn-secondary:hover {
  background: #e8e8e8;
}

.mobile-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mobile-menu-leave-active {
  transition: all 0.25s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .nav-mobile-panel,
.mobile-menu-leave-to .nav-mobile-panel {
  transform: translateX(100%);
}

.nav-mobile-panel {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (max-width: 992px) {
  .sigyn-navbar {
    padding: 0 20px;
  }

  .nav-center {
    display: none;
  }

  .nav-hamburger {
    display: flex;
  }

  .nav-auth {
    display: none;
  }

  .nav-user-dropdown {
    display: none;
  }
}

@media (max-width: 576px) {
  .sigyn-navbar {
    padding: 0 16px;
    height: 64px;
  }

  .sigyn-navbar.nav-scrolled {
    height: 56px;
  }

  .nav-logo {
    height: 40px;
  }

  .nav-scrolled .nav-logo {
    height: 36px;
  }

  .nav-icon-btn {
    width: 36px;
    height: 36px;
  }
}

/* Dark Hero Page Navbar Overrides */
.nav-dark-hero.nav-transparent .nav-link {
  color: #fff;
}

.nav-dark-hero.nav-transparent .nav-link::after {
  background: #fff;
}

.nav-dark-hero.nav-transparent .nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-dark-hero.nav-transparent .nav-icon-btn {
  color: rgba(255, 255, 255, 0.9);
}

.nav-dark-hero.nav-transparent .nav-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-dark-hero.nav-transparent .nav-username {
  color: #fff;
}

.nav-dark-hero.nav-transparent .hamburger-line {
  background: #fff;
}
</style>