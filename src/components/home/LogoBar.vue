<script setup lang="ts">
import logo1 from '@/assets/kaira/images/logo1.png'
import logo2 from '@/assets/kaira/images/logo2.png'
import logo3 from '@/assets/kaira/images/logo3.png'
import logo4 from '@/assets/kaira/images/logo4.png'
import logo5 from '@/assets/kaira/images/logo5.png'
</script>

<template>
  <section class="logo-bar py-5 my-5">
    <div class="container">
      <div class="row">
        <div class="logo-content d-flex flex-wrap justify-content-between">
          <img :src="logo1" alt="logo" class="logo-image img-fluid">
          <img :src="logo2" alt="logo" class="logo-image img-fluid">
          <img :src="logo3" alt="logo" class="logo-image img-fluid">
          <img :src="logo4" alt="logo" class="logo-image img-fluid">
          <img :src="logo5" alt="logo" class="logo-image img-fluid">
        </div>
      </div>
    </div>
  </section>
</template>