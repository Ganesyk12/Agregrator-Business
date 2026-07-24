<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()

const sidebarCollapsed = inject<Ref<boolean>>('sidebarCollapsed', ref(false))
const mobileOpen = inject<Ref<boolean>>('mobileOpen', ref(false))

interface MenuItem {
  label: string
  icon: string
  to?: string
}

interface MenuSection {
  title: string
  icon: string
  roles: string[]
  items: MenuItem[]
}

const allSections: MenuSection[] = [
  {
    title: 'General',
    icon: 'fa-dashboard',
    roles: ['eUser-Customer'],
    items: [
      { label: 'Dashboard', icon: 'fa-dashboard', to: '/' },
    ],
  },
  {
    title: 'Vendor Management',
    icon: 'fa-building',
    roles: ['eUser-Vendor'],
    items: [
      { label: 'Vendors', icon: 'fa-building', to: '/vendors' },
      { label: 'Packages', icon: 'fa-cube', to: '/packages' },
      { label: 'Portfolio', icon: 'fa-picture-o', to: '/portfolios' },
      { label: 'Bookings', icon: 'fa-calendar', to: '/bookings' },
    ],
  },
  {
    title: 'Finance & Accounting',
    icon: 'fa-money',
    roles: ['eUser-Finance'],
    items: [
      { label: 'Revenue Summary', icon: 'fa-line-chart', to: '/revenue-summary' },
      { label: 'Request for Payment', icon: 'fa-credit-card', to: '/payment-requests' },
      { label: 'RFP Payment', icon: 'fa-money', to: '/rfp-payments' },
      { label: 'Commissions', icon: 'fa-percent', to: '/commissions' },
      { label: 'Invoices', icon: 'fa-file-text-o', to: '/invoices' },
      { label: 'Receipts', icon: 'fa-file-pdf-o', to: '/receipts' },
    ],
  },
  {
    title: 'System',
    icon: 'fa-cogs',
    roles: ['eUser-Admin', 'eUser-SuperAdmin'],
    items: [
      { label: 'Categories', icon: 'fa-tags', to: '/categories' },
      { label: 'Users', icon: 'fa-users', to: '/users' },
      { label: 'Roles', icon: 'fa-lock', to: '/roles' },
      { label: 'User Access', icon: 'fa-tag', to: '/user-roles' },
      { label: 'Company Info', icon: 'fa-building-o', to: '/company-info' },
    ],
  },
]

const userRoles = ref<string[]>([])
const userName = ref('Undefined')
const userRoleText = ref('Undefined')
const showUserMenu = ref(false)

const openSections = ref<Record<string, boolean>>({
  'Vendor Management': false,
  'Finance & Accounting': false,
  'System': false,
})

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleLogout() {
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

function loadUserRoles() {
  try {
    const raw = localStorage.getItem('sigyn_user')
    if (raw) {
      const user = JSON.parse(raw)
      userRoles.value = (user.roles || []).map((r: any) => r.role_code)
      userName.value = user.full_name || 'Undefined'
      userRoleText.value = (user.roles || []).map((r: any) => r.name || r.role_name).join(', ') || 'Undefined'
    }
  } catch {
    userRoles.value = []
  }
}

loadUserRoles()

const isSuperAdmin = computed(() => userRoles.value.includes('eUser-SuperAdmin'))

const menuSections = computed(() => {
  if (isSuperAdmin.value) return allSections
  return allSections.filter(s => s.roles.some(r => userRoles.value.includes(r)))
})

function isItemActive(item: MenuItem): boolean {
  if (item.to) {
    if (item.to === '/') return route.path === '/'
    if (route.path === item.to || route.path.startsWith(item.to + '/')) return true
  }
  return false
}

function isSectionActive(section: MenuSection): boolean {
  return section.items.some(isItemActive)
}

function toggleSection(title: string) {
  openSections.value[title] = !openSections.value[title]
}

function navigateTo(path: string) {
  router.push(path)
  if (window.innerWidth < 992) {
    mobileOpen.value = false
  }
}

onMounted(() => {
  // Auto-expand the active section on mount
  menuSections.value.forEach(section => {
    if (isSectionActive(section)) {
      openSections.value[section.title] = true
    }
  })
})

// Auto-expand section on route change if it's active
watch(() => route.path, () => {
  menuSections.value.forEach(section => {
    if (isSectionActive(section)) {
      openSections.value[section.title] = true
    }
  })
})
</script>

<template>
  <nav class="pcoded-navbar" :class="{ 'navbar-collapsed': sidebarCollapsed, 'mob-open': mobileOpen }">
    <div class="navbar-wrapper">
      
      <!-- Top profile block -->
      <div class="main-menu-header-wrap">
        <div class="main-menu-header">
          <div class="user-details" style="margin-top: 10px; text-align: center; width: 100%;">
            <span style="font-size: 16px; font-weight: bold;">{{ userName }}</span>
            <div id="more-details" style="cursor: pointer; user-select: none; margin-top: 5px; font-size: 13px;" @click="toggleUserMenu">
              {{ userRoleText }} <i class="fa fa-chevron-down m-l-5"></i>
            </div>
          </div>
        </div>
        <div class="collapse" :class="{ show: showUserMenu }" id="nav-user-link">
          <ul class="list-unstyled">
            <li class="list-group-item">
              <a href="javascript:;" @click.prevent="handleLogout">
                <i class="feather icon-log-out m-r-5"></i>Logout
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Navigation links content (Scrollable container) -->
      <div class="navbar-content scroll-div">
        <ul class="nav pcoded-inner-navbar">
          <li class="nav-item pcoded-menu-caption">
            <label>Navigation</label>
          </li>
          
          <!-- Root Home Link: Dashboard -->
          <li class="nav-item" :class="{ 'active': route.path === '/' }">
            <a href="#!" class="nav-link" @click.prevent="navigateTo('/')">
              <span class="pcoded-micon"><i class="fa fa-dashboard"></i></span>
              <span class="pcoded-mtext">Dashboard</span>
            </a>
          </li>

          <!-- Collapsible sections for Management -->
          <template v-for="section in menuSections" :key="section.title">
            <li v-if="section.title !== 'General'"
              class="nav-item pcoded-hasmenu"
              :class="{
                'pcoded-trigger': openSections[section.title],
                'active': isSectionActive(section)
              }">
              
              <a href="#!" class="nav-link" @click.prevent="toggleSection(section.title)">
                <span class="pcoded-micon"><i :class="'fa ' + section.icon"></i></span>
                <span class="pcoded-mtext">{{ section.title }}</span>
              </a>
              
              <ul class="pcoded-submenu" :style="{ display: openSections[section.title] ? 'block' : 'none' }">
                <li v-for="item in section.items" :key="item.label" :class="{ 'active': isItemActive(item) }">
                  <a href="#!" @click.prevent="item.to && navigateTo(item.to)">
                    <i :class="'fa ' + item.icon" style="margin-right: 8px; width: 14px; text-align: center;"></i>
                    {{ item.label }}
                  </a>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>

    </div>
  </nav>
</template>

<style scoped>
.main-menu-header-wrap {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 5px;
}
#nav-user-link .list-group-item {
  background: transparent;
  border: none;
  padding: 8px 20px;
}
#nav-user-link .list-group-item a {
  color: #a9b7d0;
  display: block;
}
#nav-user-link .list-group-item a:hover {
  color: #fff;
}

/* Sidebar vertical native scrollbar container */
.navbar-content {
  height: calc(100vh - 120px) !important;
  position: relative;
  overflow-y: auto !important;
}

/* Native modern scrollbar styling */
.navbar-content::-webkit-scrollbar {
  width: 5px;
}
.navbar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 5px;
}
.navbar-content::-webkit-scrollbar-track {
  background: transparent;
}


</style>
