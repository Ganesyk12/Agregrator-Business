<script setup lang="ts">
import IconSprite from '@/components/layout/IconSprite.vue'

const title = import.meta.env.VITE_APP_TITLE
</script>

<template>
  <IconSprite />
  <router-view />
</template>

<style>
/* Global styles can be added here if needed */
</style>