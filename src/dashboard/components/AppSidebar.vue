<script setup lang="ts">
import { ref, computed, inject, watch, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sidebarCollapsed = inject<Ref<boolean>>('sidebarCollapsed', ref(false))

interface MenuItem {
  label: string
  icon: string
  to?: string
  children?: MenuItem[]
}

interface MenuSection {
  title: string
  items: MenuItem[]
  roles: string[]
}

const allSections: MenuSection[] = [
  {
    title: 'General',
    roles: ['eUser-Customer'],
    items: [
      { label: 'Dashboard', icon: 'fa-dashboard', to: '/' },
    ],
  },
  {
    title: 'Vendor Management',
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

function loadUserRoles() {
  try {
    const raw = localStorage.getItem('sigyn_user')
    if (raw) {
      const user = JSON.parse(raw)
      userRoles.value = (user.roles || []).map((r: any) => r.role_code)
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

const activeMenu = ref<string | null>(null)
const openSections = ref<Record<string, boolean>>({
  'General': true,
  'Vendor Management': true,
  'Finance & Accounting': true,
  'System': true,
})

watch(sidebarCollapsed, (val) => {
  if (val) {
    Object.keys(openSections.value).forEach(k => openSections.value[k] = false)
  } else {
    Object.keys(openSections.value).forEach(k => openSections.value[k] = true)
  }
})

function toggleSection(title: string) {
  openSections.value[title] = !openSections.value[title]
}

function hasChildren(menu: MenuItem): menu is MenuItem & { children: MenuItem[] } {
  return !!menu.children && menu.children.length > 0
}

function isActive(menu: MenuItem): boolean {
  if (menu.to) {
    if (menu.to === '/') return route.path === '/'
    if (route.path === menu.to || route.path.startsWith(menu.to + '/')) return true
  }
  if (menu.children) return menu.children.some(isActive)
  return false
}

function isMenuOpen(menu: MenuItem): boolean {
  return activeMenu.value === menu.label
}

function toggleMenu(menu: MenuItem) {
  if (!hasChildren(menu)) {
    if (menu.to) {
      router.push(menu.to)
      if (window.innerWidth < 768) {
        sidebarCollapsed.value = true
      }
    }
    return
  }
  activeMenu.value = activeMenu.value === menu.label ? null : menu.label
}
</script>

<template>
  <div class="col-md-3 left_col sidebar-wrap">
    <div class="navbar nav_title" style="border: 0;">
      <a href="/dashboard/" class="site_title">
        <i class="fa fa-paw"></i> <span>Agregrator Business</span>
      </a>
    </div>

    <div class="clearfix"></div>

    <div class="sidebar-body">
      <div class="main_menu_side hidden-print main_menu">
        <div v-for="section in menuSections" :key="section.title" class="menu_section">
          <h3 @click="toggleSection(section.title)" style="cursor:pointer;user-select:none;">
            {{ section.title }}
            <span class="fa" :class="openSections[section.title] ? 'fa-chevron-up' : 'fa-chevron-down'" style="font-size:11px;float:right;margin-top:4px;"></span>
          </h3>
          <ul class="nav side-menu" v-show="openSections[section.title]">
            <li v-for="item in section.items" :key="item.label"
              :class="{
                active: isMenuOpen(item) || isActive(item),
                'active-sm': (isMenuOpen(item) || isActive(item)) && sidebarCollapsed,
              }">
              <template v-if="hasChildren(item)">
                <a @click.prevent="toggleMenu(item)">
                  <i :class="'fa ' + item.icon"></i>
                  {{ item.label }}
                  <span class="fa fa-chevron-down"></span>
                </a>
                <ul class="nav child_menu" :class="{ open: isMenuOpen(item) }">
                  <li v-for="child in item.children" :key="child.label"
                    :class="{ 'current-page': route.path === child.to }">
                    <a @click.prevent="child.to && router.push(child.to)">{{ child.label }}</a>
                  </li>
                </ul>
              </template>
              <template v-else>
                <a @click.prevent="toggleMenu(item)">
                  <i :class="'fa ' + item.icon"></i>
                  {{ item.label }}
                </a>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.nav.child_menu {
  display: block !important;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.nav.child_menu.open {
  max-height: 500px;
}
.menu_section:first-of-type {
  margin-top: 20px;
}

.sidebar-wrap {
  display: flex !important;
  flex-direction: column !important;
  max-height: 100vh;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 60px);
}

.nav-sm .sidebar-wrap .sidebar-body .nav.side-menu > li > a span {
  display: none;
}
.nav-sm .sidebar-wrap .sidebar-body .nav.side-menu > li > a {
  text-align: center !important;
  padding: 10px 5px;
}
.nav-sm .sidebar-wrap .sidebar-body .menu_section h3 {
  display: none;
}
.nav-sm .sidebar-wrap .sidebar-body .menu_section .side-menu {
  display: block !important;
}
.nav-sm .sidebar-wrap .sidebar-body .menu_section .side-menu li a span.fa-chevron-down,
.nav-sm .sidebar-wrap .sidebar-body .menu_section .side-menu li a span.fa-chevron-up {
  display: none;
}
</style>
