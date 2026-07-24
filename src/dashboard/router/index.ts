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
          path: 'revenue-summary',
          name: 'revenue-summary',
          component: () => import('@/dashboard/views/RevenueSummaryView.vue'),
        },
        {
          path: 'payment-requests',
          name: 'payment-requests',
          component: () => import('@/dashboard/views/PaymentRequestView.vue'),
        },
        {
          path: 'payment-requests/:id',
          name: 'payment-request-detail',
          component: () => import('@/dashboard/views/PaymentRequestDetailView.vue'),
        },
        {
          path: 'payment-requests/:id/payment',
          name: 'payment-request-payment',
          component: () => import('@/dashboard/views/PaymentRequestPaymentView.vue'),
        },
        {
          path: 'rfp-payments',
          name: 'rfp-payments',
          component: () => import('@/dashboard/views/RFPaymentView.vue'),
        },
        {
          path: 'rfp-payments/:id',
          name: 'rfp-payment-detail',
          component: () => import('@/dashboard/views/PaymentRequestPaymentView.vue'),
        },
        {
          path: 'commissions',
          name: 'commissions',
          component: () => import('@/dashboard/views/CommissionView.vue'),
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
          path: 'receipts',
          name: 'receipts',
          component: () => import('@/dashboard/views/ReceiptView.vue'),
        },
        {
          path: 'receipts/:id',
          name: 'receipt-detail',
          component: () => import('@/dashboard/views/ReceiptDetailView.vue'),
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
  const user = localStorage.getItem('sigyn_user')
  const isAuthenticated = !!token && token !== 'undefined' && token !== 'null'
  const isCustomer = isAuthenticated && user ? (JSON.parse(user).roles || []).some((r: any) => r.role_code === 'eUser-Customer') : false
  if (to.name !== 'login' && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (isCustomer && to.name !== 'login') {
    window.location.href = '/'
  } else {
    next()
  }
})

export default router
