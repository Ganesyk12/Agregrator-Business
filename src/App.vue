<script setup lang="ts">
import IconSprite from '@/components/layout/IconSprite.vue'
import WhatsAppQuickChat from '@/components/layout/WhatsAppQuickChat.vue'
import GuardModal from '@/components/GuardModal.vue'
import { useGuard } from '@/composables/useGuard'

const { isBlocked, daysRemaining, trialEndsAt } = useGuard()
</script>

<template>
  <IconSprite />
  <GuardModal v-if="isBlocked" :days-remaining="daysRemaining" :trial-ends-at="trialEndsAt" />
  <router-view />
  <WhatsAppQuickChat />
</template>

<style>
/* Global styles can be added here if needed */
</style>