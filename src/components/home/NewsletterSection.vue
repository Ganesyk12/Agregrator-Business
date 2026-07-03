<script setup lang="ts">
import { ref } from 'vue'
import patternBg from '@/assets/kaira/images/pattern-bg.png'

const email = ref('')

const handleSubmit = () => {
  console.log('Subscribing email:', email.value)
  email.value = ''
}
</script>

<template>
  <section class="newsletter bg-light" :style="{ backgroundImage: 'url(' + patternBg + ')' }">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 py-5 my-5">
          <div class="subscribe-header text-center pb-3">
            <h3 class="section-title text-uppercase">Sign Up for our newsletter</h3>
          </div>
          <form id="form" class="d-flex flex-wrap gap-2" @submit.prevent="handleSubmit">
            <input 
              type="email" 
              v-model="email"
              placeholder="Your Email Addresss" 
              class="form-control form-control-lg"
              required
            />
            <button class="btn btn-dark btn-lg text-uppercase w-100">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>