<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/dashboard/components/AppSidebar.vue'
import AppTopNav from '@/dashboard/components/AppTopNav.vue'

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const appName = import.meta.env.VITE_APP_NAME || 'Agregator Business'

function toggleSidebar() {
  if (window.innerWidth >= 992) {
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    mobileOpen.value = !mobileOpen.value
  }
}

function closeMobileNav() {
  if (mobileOpen.value) {
    mobileOpen.value = false
  }
}

provide('sidebarCollapsed', sidebarCollapsed)
provide('mobileOpen', mobileOpen)
provide('toggleSidebar', toggleSidebar)

const handleResize = () => {
  if (window.innerWidth < 992) {
    sidebarCollapsed.value = false
  } else {
    mobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="pcoded-wrapper">
    <AppSidebar />
    <AppTopNav />
    <div class="pcoded-main-container" @click="closeMobileNav">
      <div class="pcoded-content">
        <router-view />
      </div>
      
      <!-- Footer outside pcoded-content -->
      <footer class="dashboard-footer py-3 border-top text-muted">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-sm-6 text-start text-sm-left">
              <span>&copy; 2026 {{ appName }}. All rights reserved.</span>
            </div>
            <div class="col-sm-6 text-end text-sm-right d-none d-sm-block">
              <span>{{ appName }} Dashboard</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
/* Custom style fixes for SPA page header under Flat Able */
.pcoded-main-container {
  min-height: 100vh;
  display: flex !important;
  flex-direction: column !important;
}

.pcoded-content {
  flex: 1 0 auto !important;
}

.dashboard-footer {
  flex-shrink: 0 !important;
  background-color: #fff;
  padding: 15px 30px !important;
  z-index: 1;
}

/* Make all modals scrollable if content exceeds screen height */
.modal-body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
