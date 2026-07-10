<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const toggleSidebar = inject('toggleSidebar', () => {})
const userName = ref('Admin')
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-profile-li')) {
    closeDropdown()
  }
}

onMounted(() => {
  const userJson = localStorage.getItem('sigyn_user')
  if (userJson) {
    try {
      const user = JSON.parse(userJson)
      userName.value = user.full_name || 'Admin'
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
  <div class="top_nav">
    <div class="nav_menu">
      <nav>
        <div class="nav toggle">
          <a id="menu_toggle" @click.prevent="toggleSidebar">
            <i class="fa fa-bars"></i>
          </a>
        </div>

        <ul class="nav navbar-nav navbar-right">
          <li class="user-profile-li dropdown" :class="{ open: isDropdownOpen }">
            <a href="javascript:;" class="user-profile dropdown-toggle" @click.prevent="toggleDropdown" aria-expanded="false">
              <img src="/gentela-gh-pages/production/images/img.jpg" alt="">{{ userName }}
              <span class=" fa fa-angle-down"></span>
            </a>
            <ul class="dropdown-menu dropdown-usermenu pull-right" :style="{ display: isDropdownOpen ? 'block' : 'none' }">
              <li><a href="javascript:;" @click.prevent="handleLogout"><i class="fa fa-sign-out pull-right"></i> Log Out</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
