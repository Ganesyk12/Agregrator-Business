<template>
  <nav class="navbar navbar-expand-lg bg-light text-uppercase fs-6 p-3 border-bottom align-items-center">
    <div class="container-fluid">
      <div class="row justify-content-between align-items-center w-100">
        <div class="col-auto">
          <a class="navbar-brand text-white" href="/">
            <img :src="mainLogo" alt="Kaira" style="height: 45px;">
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
                <!-- Dropdown Home -->
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle active" href="#" id="dropdownHome" data-bs-toggle="dropdown" aria-expanded="false">
                    Home
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownHome">
                    <li><a class="dropdown-item" href="/">Home Layout 1</a></li>
                    <li><a class="dropdown-item" href="/">Home Layout 2</a></li>
                    <li><a class="dropdown-item" href="/">Home Layout 3</a></li>
                    <li><a class="dropdown-item" href="/">Home Layout 4</a></li>
                  </ul>
                </li>

                <!-- Dropdown Shop -->
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="dropdownShop" data-bs-toggle="dropdown" aria-expanded="false">
                    Shop
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownShop">
                    <li><a class="dropdown-item" href="/shop">Shop Sidebar</a></li>
                    <li><a class="dropdown-item" href="/shop">Shop Three Column</a></li>
                    <li><a class="dropdown-item" href="/shop">Shop Three Column Wide</a></li>
                    <li><a class="dropdown-item" href="/shop">Shop Four Column</a></li>
                    <li><a class="dropdown-item" href="/shop">Shop Four Column Wide</a></li>
                    <li><a class="dropdown-item" href="/shop">Shop Six Column</a></li>
                    <li><a class="dropdown-item" href="/shop">Shop Six Column Wide</a></li>
                    <li><a class="dropdown-item" href="/product">Single Product</a></li>
                    <li><a class="dropdown-item" href="/product">Single Product V2</a></li>
                  </ul>
                </li>

                <!-- Dropdown Blog -->
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="dropdownBlog" data-bs-toggle="dropdown" aria-expanded="false">
                    Blog
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownBlog">
                    <li><a class="dropdown-item" href="/blog">Blog Classic</a></li>
                    <li><a class="dropdown-item" href="/blog">Blog Grid with Sidebar</a></li>
                    <li><a class="dropdown-item" href="/blog">Blog Grid Four Column</a></li>
                    <li><a class="dropdown-item" href="/blog">Blog No Sidebar</a></li>
                    <li><a class="dropdown-item" href="/blog">Blog Right Sidebar</a></li>
                    <li><a class="dropdown-item" href="/blog/post">Single Post</a></li>
                    <li><a class="dropdown-item" href="/blog/post">Single Post No Sidebar</a></li>
                  </ul>
                </li>

                <!-- Dropdown Pages -->
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="dropdownPages" data-bs-toggle="dropdown" aria-expanded="false">
                    Pages
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="dropdownPages">
                    <li><a class="dropdown-item" href="/about">About</a></li>
                    <li><a class="dropdown-item" href="/cart">Cart</a></li>
                    <li><a class="dropdown-item" href="/checkout">Checkout</a></li>
                    <li><a class="dropdown-item" href="/coming-soon">Coming Soon</a></li>
                    <li><a class="dropdown-item" href="/contact">Contact</a></li>
                    <li><a class="dropdown-item" href="/404">Error Page</a></li>
                    <li><a class="dropdown-item" href="/faqs">FAQs</a></li>
                    <li><a class="dropdown-item" href="/account">My Account</a></li>
                    <li><a class="dropdown-item" href="/order-tracking">Order Tracking</a></li>
                    <li><a class="dropdown-item" href="/wishlist">Wishlist</a></li>
                  </ul>
                </li>

                <li class="nav-item"><a class="nav-link" href="/blog">Blog</a></li>
                <li class="nav-item"><a class="nav-link" href="/contact">Contact</a></li>
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
            <li class="d-lg-none">
              <a href="/wishlist" class="mx-2">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#heart"></use>
                </svg>
              </a>
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
import mainLogo from '@/assets/kaira/images/main-logo.png'

const searchOpen = ref(false)

const toggleSearch = () => {
  searchOpen.value = !searchOpen.value
}
</script>