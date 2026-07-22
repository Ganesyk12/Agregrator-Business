<template>
  <nav class="navbar navbar-expand-lg bg-light text-uppercase fs-6 p-3 border-bottom align-items-center">
    <div class="container-fluid">
      <div class="row justify-content-between align-items-center w-100">
        <div class="col-auto">
          <router-link class="navbar-brand text-white" to="/">
            <img :src="mainLogo" alt="Sigyn" style="height: 60px; width: auto;">
          </router-link>
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
                <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/photography">Photography</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/mua">MUA</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/bouquet">Bouquet Flowers</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/more-service">More Service</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/contact">Contact</router-link></li>
                <li class="nav-item d-lg-none"><router-link class="nav-link" to="/wishlist">Wishlist <span class="wishlist-count">(0)</span></router-link></li>
                <li class="nav-item d-lg-none">
                  <a class="nav-link" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart" :class="{ shake: shaking }">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
                    <span class="icon-label ms-1">Cart</span>
                    <span class="badge bg-danger ms-1">{{ cart.count }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-3 col-lg-auto">
          <ul class="list-unstyled d-flex m-0">
            <li class="d-none d-lg-block">
              <router-link to="/wishlist" class="text-uppercase mx-3">
                Wishlist <span class="wishlist-count">(0)</span>
              </router-link>
            </li>
            <li class="d-none d-lg-block">
              <a href="#" class="text-uppercase mx-3" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart">
                Cart <span class="cart-count">(0)</span>
              </a>
            </li>

          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import mainLogo from '@/assets/kaira/images/logosigyn.png'

const cart = useCartStore()
</script>
