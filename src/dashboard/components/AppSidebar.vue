<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
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
}

const menuSections: MenuSection[] = [
  {
    title: 'General',
    items: [
      {
        label: 'Home',
        icon: 'fa-home',
        children: [
          { label: 'Dashboard', icon: '', to: '/' },
        ],
      },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Vendors', icon: 'fa-building', to: '/vendors' },
      { label: 'Packages', icon: 'fa-cube', to: '/packages' },
      { label: 'Bookings', icon: 'fa-calendar', to: '/bookings' },
      { label: 'Payments', icon: 'fa-credit-card', to: '/payments' },
      { label: 'Users', icon: 'fa-users', to: '/users' },
    ],
  },
]

const activeMenu = ref<string | null>(null)

function hasChildren(menu: MenuItem): menu is MenuItem & { children: MenuItem[] } {
  return !!menu.children && menu.children.length > 0
}

function isActive(menu: MenuItem): boolean {
  if (menu.to && route.path === menu.to) return true
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
    }
    return
  }
  activeMenu.value = activeMenu.value === menu.label ? null : menu.label
}
</script>

<template>
  <div class="col-md-3 left_col">
    <div class="left_col scroll-view">
      <div class="navbar nav_title" style="border: 0;">
        <a href="/" class="site_title">
          <i class="fa fa-paw"></i> <span>Agregrator Business</span>
        </a>
      </div>

      <div class="clearfix"></div>

      <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
        <div v-for="section in menuSections" :key="section.title" class="menu_section">
          <h3>{{ section.title }}</h3>
          <ul class="nav side-menu">
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
</style>
