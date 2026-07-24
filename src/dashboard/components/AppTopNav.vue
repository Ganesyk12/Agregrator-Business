<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const toggleSidebar = inject('toggleSidebar', () => {})
const userName = ref('Undefined')
const userRoleText = ref('Undefined')
const isDropdownOpen = ref(false)
const mobileHeaderOpen = ref(false)
const appName = import.meta.env.VITE_APP_NAME || 'Agregator Business'

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const toggleMobileHeader = () => {
  mobileHeaderOpen.value = !mobileHeaderOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.drp-user')) {
    closeDropdown()
  }
  if (!target.closest('.m-header') && !target.closest('.navbar-collapse')) {
    mobileHeaderOpen.value = false
  }
}

onMounted(() => {
  const userJson = localStorage.getItem('sigyn_user')
  if (userJson) {
    try {
      const user = JSON.parse(userJson)
      userName.value = user.full_name || 'Undefined'
      userRoleText.value = (user.roles || []).map((r: any) => r.name || r.role_name).join(', ') || 'Undefined'
    } catch (e) {
      // ignore
    }
  }
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

const handleLogout = () => {
  localStorage.removeItem('sigyn_token')
  localStorage.removeItem('sigyn_user')
  Swal.fire({
    icon: 'success',
    title: 'Logout Berhasil',
    text: 'Sampai jumpa lagi!',
    timer: 1000,
    showConfirmButton: false
  })
  setTimeout(() => {
    router.push('/login')
  }, 1000)
}
</script>

<template>
  <header class="navbar pcoded-header navbar-expand-lg navbar-light header-dark">
    <div class="m-header">
      <a class="mobile-menu" id="mobile-collapse" href="#!" @click.prevent="toggleSidebar">
        <span></span>
      </a>
      <a href="/dashboard/" class="b-brand">
        <span class="logo-text" style="font-size: 18px; font-weight: bold; color: #fff;">{{ appName }}</span>
      </a>
      <a href="#!" class="mob-toggler" @click.prevent="toggleMobileHeader">
        <i class="feather icon-more-vertical"></i>
      </a>
    </div>
    
    <div class="collapse navbar-collapse" :class="{ show: mobileHeaderOpen }">
      <ul class="navbar-nav mr-auto">
        <!-- Left aligned items (empty) -->
      </ul>
      
      <ul class="navbar-nav ml-auto">
        <li>
          <div class="dropdown drp-user" :class="{ show: isDropdownOpen }">
            <a href="#" class="dropdown-toggle" @click.prevent="toggleDropdown">
              <i class="feather icon-user"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-right profile-notification" :class="{ show: isDropdownOpen }">
              <div class="pro-head" style="display:flex; flex-direction:column; align-items:flex-start; padding: 15px 20px;">
                <span style="font-weight:bold; font-size:15px; color:#fff;">{{ userName }}</span>
                <span style="font-size:12px; color:#e0e0e0; margin-top:2px;">{{ userRoleText }}</span>
                <a href="#!" class="d-logout" title="Logout" @click.prevent="handleLogout" style="position:absolute; right:15px; top:20px;">
                  <i class="feather icon-log-out"></i>
                </a>
              </div>
              <ul class="pro-body">
                <li>
                  <a href="javascript:;" class="dropdown-item" @click.prevent="handleLogout">
                    <i class="feather icon-log-out"></i> Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.logo-text {
  letter-spacing: 0.5px;
}
.drp-user .dropdown-menu {
  display: none;
}
.drp-user .dropdown-menu.show {
  display: block;
}
</style>
