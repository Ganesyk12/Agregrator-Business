<script setup lang="ts">
import { ref, provide, watch, onMounted } from 'vue'
import AppSidebar from '@/dashboard/components/AppSidebar.vue'
import AppTopNav from '@/dashboard/components/AppTopNav.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

provide('sidebarCollapsed', sidebarCollapsed)
provide('toggleSidebar', toggleSidebar)

watch(sidebarCollapsed, (val) => {
  document.body.classList.toggle('nav-sm', val)
  document.body.classList.toggle('nav-md', !val)
})

onMounted(() => {
  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true
  }
  auth.fetchVendorProfile()
})
</script>

<template>
  <div class="container body">
    <div class="main_container">
      <AppSidebar />
      <AppTopNav />
      <div class="right_col" role="main">
        <router-view />
      </div>
      <footer>
        <div class="pull-right">
          Agregrator-Business Dashboard
        </div>
        <div class="clearfix"></div>
      </footer>
    </div>
  </div>
</template>

<style>
/* Fix spacing between sidebar and content */
.nav-md .container.body .right_col {
  margin-left: 260px !important;
}

.nav-md .main_container .top_nav {
  margin-left: 260px;
}

.nav-sm .container.body .right_col {
  margin-left: 64px !important;
}

.nav-sm .main_container .top_nav {
  margin-left: 64px;
}

small,
.count_top,
.count_bottom,
.tile_stats_count .count_top,
.tile_stats_count .count_bottom,
.x_title small,
.x_panel h2 small,
footer small,
.btn-xs,
.btn-sm {
  font-size: inherit !important;
}
</style>
