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
                <li class="nav-item d-lg-none">
                  <a v-if="!auth.isLoggedIn" class="nav-link" href="/login">Sign In</a>
                  <a v-else class="nav-link" :href="auth.isCustomer ? '/' : '/dashboard'">{{ auth.user?.full_name }}</a>
                </li>
                <li class="nav-item d-lg-none"><a class="nav-link" href="/wishlist">Wishlist <span class="wishlist-count">(0)</span></a></li>
                <li class="nav-item d-lg-none">
                  <a class="nav-link" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart">
                    Cart <span class="cart-count">(0)</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-3 col-lg-auto">
          <ul class="list-unstyled d-flex m-0">
            <li class="d-none d-lg-block">
              <a href="/wishlist" class="text-uppercase mx-3">Wishlist <span class="wishlist-count">(0)</span></a>
            </li>
            <li class="d-none d-lg-block">
              <a href="#" class="text-uppercase mx-3" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart">
                Cart <span class="cart-count">(0)</span>
              </a>
            </li>
            <li class="d-none d-lg-block ms-3">
              <a v-if="!auth.isLoggedIn" href="/login" class="text-uppercase" title="Sign In">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </a>
              <a v-else :href="auth.isCustomer ? '/' : '/dashboard'" class="text-uppercase" title="My Account">
                {{ auth.user?.full_name?.split(' ')[0] }}
              </a>
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

onMounted(() => {
  // hydrate from localStorage
  const token = localStorage.getItem('sigyn_token')
  const user = localStorage.getItem('sigyn_user')
  if (token && user) {
    auth.setAuth({ token, user: JSON.parse(user) })
  }
})
</script>