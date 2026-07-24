<script setup lang="ts">
import { ref, provide, watch, onMounted } from 'vue'
import AppSidebar from '@/dashboard/components/AppSidebar.vue'
import AppTopNav from '@/dashboard/components/AppTopNav.vue'

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
})
</script>

<template>
  <div class="container body">
    <div class="main_container main_container--flex">
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
.main_container--flex {
  min-height: 100vh;
}

.top_nav {
  position: relative;
  z-index: 10;
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

.x_content {
  overflow: hidden;
}

.input-group {
  max-width: 100%;
}
.input-group .form-control {
  min-width: 0;
}

@media (max-width: 991px) {
  .right_col {
    margin-left: 0 !important;
    padding: 10px 15px !important;
  }
}
</style>
