import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/dashboard/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/dashboard/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/dashboard/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/dashboard/views/DashboardView.vue'),
        },
        {
          path: 'bookings',
          name: 'bookings',
          component: () => import('@/dashboard/views/BookingView.vue'),
        },
        {
          path: 'payments',
          name: 'payments',
          component: () => import('@/dashboard/views/PaymentView.vue'),
        },
        {
          path: 'commissions',
          name: 'commissions',
          component: () => import('@/dashboard/views/CommissionView.vue'),
        },
        {
          path: 'payouts',
          name: 'payouts',
          component: () => import('@/dashboard/views/PayoutView.vue'),
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/dashboard/views/InvoiceView.vue'),
        },
        {
          path: 'invoices/:paymentId',
          name: 'invoice-detail',
          component: () => import('@/dashboard/views/InvoiceDetailView.vue'),
        },
        {
          path: 'vendors',
          name: 'vendors',
          component: () => import('@/dashboard/views/VendorView.vue'),
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/dashboard/views/CategoryView.vue'),
        },
        {
          path: 'packages',
          name: 'packages',
          component: () => import('@/dashboard/views/PackageView.vue'),
        },
        {
          path: 'portfolios',
          name: 'portfolios',
          component: () => import('@/dashboard/views/PortfolioView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/dashboard/views/UserView.vue'),
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/dashboard/views/RoleView.vue'),
        },
        {
          path: 'user-roles',
          name: 'user-roles',
          component: () => import('@/dashboard/views/UserRoleView.vue'),
        },
        {
          path: 'company-info',
          name: 'company-info',
          component: () => import('@/dashboard/views/CompanyInfoView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('sigyn_token')
  const isAuthenticated = !!token && token !== 'undefined' && token !== 'null'
  if (to.name !== 'login' && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
