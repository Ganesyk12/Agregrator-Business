<script setup lang="ts">
import GuardModal from '@/components/GuardModal.vue'
import { useGuard } from '@/composables/useGuard'

const { isBlocked, daysRemaining, trialEndsAt } = useGuard()
</script>

<template>
  <GuardModal v-if="isBlocked" :days-remaining="daysRemaining" :trial-ends-at="trialEndsAt" />
  <router-view />
</template>

<style>
.table > thead > tr > th,
.table > tbody > tr > td {
  text-align: center;
  vertical-align: middle;
}
</style>
