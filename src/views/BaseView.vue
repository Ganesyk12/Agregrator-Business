<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="container py-5">
    <h1 class="text-center">{{ title }}</h1>
    <p class="text-center text-muted">This page is under construction.</p>
    <div class="text-center mt-4">
      <router-link to="/" class="btn btn-primary">Back to Home</router-link>
    </div>
  </div>
</template>
