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
              <ul class="navbar-nav justify-content-end flex-grow-1 gap-1 gap-md-4 pe-3">
                <li class="nav-item">
                  <router-link class="nav-link" to="/">Beranda</router-link>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="dropdownLayanan" data-bs-toggle="dropdown" aria-expanded="false">
                    Layanan
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownLayanan">
                    <li><router-link class="dropdown-item" to="/photography">Photography</router-link></li>
                    <li><router-link class="dropdown-item" to="/mua">MUA</router-link></li>
                    <li><router-link class="dropdown-item" to="/photography">Nail Art</router-link></li>
                    <li><router-link class="dropdown-item" to="/bouquet">Bouquet Flowers</router-link></li>
                  </ul>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/shop">Explore</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/about">About</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/contact">Contact</router-link>
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
            <li class="d-lg-none">
              <router-link to="/wishlist" class="mx-2">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#heart"></use>
                </svg>
              </router-link>
            </li>
            <li class="d-lg-none">
              <a href="#" class="mx-2" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart" aria-controls="offcanvasCart">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#cart"></use>
                </svg>
              </a>
            </li>
            <li class="search-box mx-2">
              <a href="#" class="search-button" @click.prevent="toggleSearch">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#search"></use>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import mainLogo from '@/assets/kaira/images/logosigyn.png'

const searchOpen = ref(false)

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
}
</script>
