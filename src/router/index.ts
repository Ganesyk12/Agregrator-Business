import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BaseView from '../views/BaseView.vue'
import PhotographyView from '../views/PhotographyView.vue'
import MUAView from '../views/MUAView.vue'
import BouquetView from '../views/BouquetView.vue'
import PortfolioDetailView from '../views/PortfolioDetailView.vue'
import BookingView from '../views/BookingView.vue'
import ShopView from '../views/ShopView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import VendorProfileView from '../views/VendorProfileView.vue'
import ContactView from '../views/ContactView.vue'
import ExploreView from '../views/ExploreView.vue'
import InspirationDetailView from '../views/InspirationDetailView.vue'
import PartnerView from '../views/PartnerView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import ProductCheckoutView from '../views/ProductCheckoutView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/explore',
    name: 'explore',
    component: ExploreView
  },
  {
    path: '/inspiration',
    name: 'inspiration',
    component: ExploreView,
    props: { defaultTab: 'inspirations' }
  },
  {
    path: '/inspiration/:id',
    name: 'inspiration-detail',
    component: InspirationDetailView
  },
  {
    path: '/partner',
    name: 'partner',
    component: PartnerView
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopView
  },
  {
    path: '/product/:id',
    name: 'product',
    component: ProductDetailView
  },
  {
    path: '/photography',
    name: 'photography',
    component: PhotographyView
  },
  {
    path: '/mua',
    name: 'mua',
    component: MUAView
  },
  {
    path: '/bouquet',
    name: 'bouquet',
    component: BouquetView
  },
  {
    path: '/portfolio/:id',
    name: 'portfolio-detail',
    component: PortfolioDetailView
  },
  {
    path: '/booking',
    name: 'booking',
    component: BookingView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/vendor/:id',
    name: 'vendor-profile',
    component: VendorProfileView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
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
    path: '/checkout/product',
    name: 'product-checkout',
    component: ProductCheckoutView
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
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

export default router
