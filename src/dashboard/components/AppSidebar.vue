<script setup lang="ts">
import { ref, computed, inject, type Ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

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

const userRoles = ref<string[]>([])

function loadUserRoles() {
  if (auth.user?.roles) {
    userRoles.value = auth.user.roles.map((r: any) => r.role_code)
  }
}

onMounted(loadUserRoles)

const isSuperAdmin = computed(() => userRoles.value.includes('eUser-SuperAdmin'))
const isAdmin = computed(() => isSuperAdmin.value || userRoles.value.includes('eUser-Admin'))
const isVendor = computed(() => userRoles.value.includes('eUser-Vendor'))
const isProductVendor = computed(() => auth.isProductVendor)

const vendorAvatar = computed(() => {
  if (auth.user?.vendor_avatar) return auth.user.vendor_avatar
  return null
})

function getServiceMenuItems(): MenuItem[] {
  return [
    { label: 'Packages', icon: 'fa-cube', to: '/packages' },
    { label: 'Portfolio', icon: 'fa-picture-o', to: '/portfolios' },
    { label: 'Bookings', icon: 'fa-calendar', to: '/bookings' },
  ]
}

function getProductMenuItems(): MenuItem[] {
  return [
    { label: 'My Store', icon: 'fa-store', to: '/my-store' },
    { label: 'Products', icon: 'fa-shopping-bag', to: '/products' },
    { label: 'Categories', icon: 'fa-tags', to: '/product-categories' },
    { label: 'Orders', icon: 'fa-truck', to: '/orders' },
    { label: 'Inventory', icon: 'fa-cubes', to: '/inventory' },
    { label: 'Customers', icon: 'fa-users', to: '/customers' },
    { label: 'Reviews', icon: 'fa-star', to: '/reviews' },
    { label: 'Analytics', icon: 'fa-bar-chart', to: '/analytics' },
    { label: 'Store Settings', icon: 'fa-cog', to: '/store-settings' },
  ]
}

function getVendorMenuItems(): MenuItem[] {
  const items: MenuItem[] = [
    { label: 'My Profile', icon: 'fa-user-circle', to: '/vendor-profile' },
  ]
  if (isProductVendor.value) {
    items.push(...getProductMenuItems())
  } else {
    items.push(...getServiceMenuItems())
  }
  return items
}

function getAdminMenuItems(): MenuItem[] {
  return [
    { label: 'Dashboard', icon: 'fa-dashboard', to: '/' },
    { label: 'Vendors', icon: 'fa-building', to: '/vendors' },
    { label: 'Categories', icon: 'fa-tags', to: '/categories' },
    { label: 'Users', icon: 'fa-users', to: '/users' },
    { label: 'Roles', icon: 'fa-lock', to: '/roles' },
    { label: 'User Access', icon: 'fa-tag', to: '/user-roles' },
    { label: 'Payments', icon: 'fa-credit-card', to: '/payments' },
    { label: 'Commissions', icon: 'fa-percent', to: '/commissions' },
    { label: 'Payouts', icon: 'fa-money', to: '/payouts' },
    { label: 'Invoices', icon: 'fa-file-text-o', to: '/invoices' },
    { label: 'Company Info', icon: 'fa-building-o', to: '/company-info' },
  ]
}

function getAllSections(): MenuSection[] {
  const sections: MenuSection[] = []

  // Admin/SuperAdmin get full management
  if (isAdmin.value) {
    sections.push({
      title: 'Administration',
      roles: ['eUser-Admin', 'eUser-SuperAdmin'],
      items: getAdminMenuItems(),
    })
  }

  // Vendor section
  if (isVendor.value) {
    sections.push({
      title: 'My Business',
      roles: ['eUser-Vendor'],
      items: getVendorMenuItems(),
    })
  }

  return sections
}

const menuSections = computed(() => {
  return getAllSections().filter(s => s.roles.some(r => userRoles.value.includes(r)))
})

function isActive(path?: string) {
  if (!path) return false
  return route.path === path || route.path.startsWith(path + '/')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
    <div class="sidebar-header">
      <router-link to="/" class="sidebar-brand">
        <i class="fa fa-diamond"></i>
        <span class="brand-text">Agregrator</span>
      </router-link>
    </div>

    <!-- Vendor Profile Card -->
    <div v-if="isVendor && auth.user" class="vendor-profile-card">
      <div class="vendor-avatar">
        <img v-if="vendorAvatar" :src="vendorAvatar" :alt="auth.user.vendor_name || ''" />
        <i v-else class="fa fa-user-circle-o"></i>
      </div>
      <div class="vendor-details">
        <span class="vendor-name">{{ auth.user.vendor_name || auth.user.full_name }}</span>
        <span class="vendor-cat">{{ auth.user.vendor_category || 'Vendor' }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <template v-for="section in menuSections" :key="section.title">
        <div class="menu-section-label">{{ section.title }}</div>
        <router-link
          v-for="item in section.items"
          :key="item.label"
          :to="item.to || '#'"
          :class="{ active: isActive(item.to) }"
          class="nav-item"
        >
          <i :class="'fa ' + item.icon"></i>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <div class="sidebar-footer">
      <button class="logout-btn" @click="logout">
        <i class="fa fa-sign-out"></i>
        <span class="nav-label">Logout</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: #1e293b;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
}

.sidebar.collapsed { width: 64px; }

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.sidebar-brand i { color: var(--bs-secondary, #B89C7B); font-size: 1.4rem; }

/* Vendor Profile Card */
.vendor-profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
}

.vendor-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-avatar i { font-size: 1.6rem; color: #94a3b8; }

.vendor-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.vendor-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendor-cat {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }

.menu-section-label {
  padding: 12px 24px 6px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.88rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
}

.nav-item.active {
  background: rgba(184, 156, 123, 0.1);
  color: var(--bs-secondary, #B89C7B);
  border-left-color: var(--bs-secondary, #B89C7B);
}

.nav-item i { width: 20px; text-align: center; font-size: 1rem; }

.sidebar-footer {
  padding: 12px 0;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.logout-btn:hover {
  background: rgba(239,68,68,0.1);
  color: #ef4444;
}

.logout-btn i { width: 20px; text-align: center; }
</style>
