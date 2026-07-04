// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BaseView from '../views/BaseView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/shop',
    name: 'shop',
    component: BaseView,
    props: { title: 'Shop' }
  },
  {
    path: '/product/:id',
    name: 'product',
    component: BaseView,
    props: { title: 'Product Detail' }
  },
  {
    path: '/blog',
    name: 'blog',
    component: BaseView,
    props: { title: 'Blog' }
  },
  {
    path: '/about',
    name: 'about',
    component: BaseView,
    props: { title: 'About Us' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: BaseView,
    props: { title: 'Contact Us' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: BaseView,
    props: { title: 'Shopping Cart' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: BaseView,
    props: { title: 'Checkout' }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: BaseView,
    props: { title: 'Wishlist' }
  },
  {
    path: '/faqs',
    name: 'faqs',
    component: BaseView,
    props: { title: 'FAQs' }
  },
  {
    path: '/404',
    name: '404',
    component: BaseView,
    props: { title: '404 - Page Not Found' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router