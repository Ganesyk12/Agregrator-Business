<template>
  <nav class="navbar navbar-expand-lg bg-light text-uppercase fs-6 p-3 border-bottom align-items-center">
    <div class="container-fluid">
      <div class="row justify-content-between align-items-center w-100">
        <div class="col-auto">
          <a class="navbar-brand text-white" href="/">
            <img :src="mainLogo" alt="Sigyn" style="height: 60px; width: auto;">
          </a>
        </div>

        <div class="col-auto">
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Menu</h5>
              <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 gap-1 gap-md-5 pe-3">
                <li class="nav-item"><a class="nav-link active" href="/">Home</a></li>

                <li class="nav-item"><a class="nav-link" href="/photography">Photography</a></li>
                <li class="nav-item"><a class="nav-link" href="/mua">MUA</a></li>
                <li class="nav-item"><a class="nav-link" href="/bouquet">Bouquet Flowers</a></li>
                <li class="nav-item"><a class="nav-link" href="/services">More Service</a></li>
                <li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li>
                <li v-if="!auth.isLoggedIn" class="nav-item d-lg-none">
                  <a class="nav-link" href="/login">Sign In</a>
                </li>
                <li v-if="auth.isLoggedIn" class="nav-item d-lg-none">
                  <span class="nav-link fw-bold">{{ auth.user?.full_name }}</span>
                </li>
                <li v-if="auth.isLoggedIn && !auth.isCustomer" class="nav-item d-lg-none">
                  <a class="nav-link" href="/dashboard">Dashboard</a>
                </li>
                <li v-if="auth.isLoggedIn" class="nav-item d-lg-none">
                  <a class="nav-link" href="/booking-history">Booking History</a>
                </li>
                <li v-if="auth.isLoggedIn" class="nav-item d-lg-none">
                  <a class="nav-link" href="#" @click.prevent="handleLogout">Logout</a>
                </li>
                <li class="nav-item d-lg-none"><a class="nav-link" href="/wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span class="icon-label ms-1">Wishlist</span>
                  <span v-if="auth.wishlistCount > 0" class="badge bg-danger ms-1">{{ auth.wishlistCount }}</span>
                </a></li>
                <li class="nav-item d-lg-none">
                  <a class="nav-link" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
                    <span class="icon-label ms-1">Cart</span>
                    <span class="badge bg-danger ms-1">0</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-3 col-lg-auto">
          <ul class="list-unstyled d-flex m-0 align-items-center">
            <li class="d-none d-lg-block position-relative mx-2">
              <a href="/wishlist" class="text-uppercase" title="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span v-if="auth.wishlistCount > 0" class="badge-icon bg-danger">{{ auth.wishlistCount }}</span>
              </a>
            </li>
            <li class="d-none d-lg-block position-relative mx-2">
              <a href="#" class="text-uppercase" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart" title="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span class="badge-icon bg-danger">0</span>
              </a>
            </li>
            <li class="d-none d-lg-block ms-3 dropdown">
              <a href="#" class="text-uppercase" data-bs-toggle="dropdown" title="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </a>
              <ul class="dropdown-menu dropdown-menu-end text-uppercase">
                <li v-if="!auth.isLoggedIn">
                  <a class="dropdown-item fw-bold" href="/login">Sign In</a>
                </li>
                <li v-else>
                  <span class="dropdown-item-text fw-bold">{{ auth.user?.full_name }}</span>
                </li>
                <li v-if="auth.isLoggedIn"><hr class="dropdown-divider"></li>
                <li v-if="auth.isLoggedIn && !auth.isCustomer">
                  <a class="dropdown-item" href="/dashboard">Dashboard</a>
                </li>
                <li v-if="auth.isLoggedIn">
                  <a class="dropdown-item" href="/booking-history">Booking History</a>
                </li>
                <li v-if="auth.isLoggedIn">
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">Logout</a>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import mainLogo from '@/assets/kaira/images/logosigyn.png'

const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  window.location.href = '/'
}

onMounted(() => {
  const token = localStorage.getItem('sigyn_token')
  const user = localStorage.getItem('sigyn_user')
  if (token && user) {
    auth.setAuth({ token, user: JSON.parse(user) })
  }
})
</script>

<style scoped>
.badge-icon {
  position: absolute;
  top: -6px;
  right: -8px;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 50%;
  min-width: 16px;
  text-align: center;
  line-height: 1;
  color: #fff;
}
</style>