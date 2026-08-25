import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/dashboard/'),
  routes: [
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
          component: () => import('@/dashboard/views/RFPaymentDetailView.vue'),
        },
        {
          path: 'rfp-payments',
          name: 'rfp-payments',
          component: () => import('@/dashboard/views/RFPaymentView.vue'),
        },
        {
          path: 'rfp-payments/:id',
          name: 'rfp-payment-detail',
          component: () => import('@/dashboard/views/RFPaymentDetailView.vue'),
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
          path: 'products',
          name: 'products',
          component: () => import('@/dashboard/views/ProductView.vue'),
        },
        {
          path: 'product-categories',
          name: 'product-categories',
          component: () => import('@/dashboard/views/ProductCategoryView.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/dashboard/views/OrderView.vue'),
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/dashboard/views/InventoryView.vue'),
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
        {
          path: 'vendor-profile',
          name: 'vendor-profile',
          component: () => import('@/dashboard/views/VendorProfileEditView.vue'),
        },
        // Product Vendor routes
        {
          path: 'my-store',
          name: 'my-store',
          component: () => import('@/dashboard/views/MyStoreView.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/dashboard/views/CustomersView.vue'),
        },
        {
          path: 'reviews',
          name: 'reviews',
          component: () => import('@/dashboard/views/ReviewsView.vue'),
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('@/dashboard/views/AnalyticsView.vue'),
        },
        {
          path: 'store-settings',
          name: 'store-settings',
          component: () => import('@/dashboard/views/StoreSettingsView.vue'),
        },
      ],
    },
  ],
})

const adminRoutes = new Set([
  'payments', 'rfp-payments', 'invoices', 'invoice-detail',
  'vendors', 'categories', 'users', 'roles', 'user-roles', 'company-info',
])

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('sigyn_token')
  const user = localStorage.getItem('sigyn_user')
  const isAuthenticated = !!token && token !== 'undefined' && token !== 'null'
  const parsedUser = isAuthenticated && user ? JSON.parse(user) : null
  const isCustomer = parsedUser ? (parsedUser.roles || []).some((r: any) => r.role_code === 'eUser-Customer') : false
  const isVendor = parsedUser ? (parsedUser.roles || []).some((r: any) => r.role_code === 'eUser-Vendor') : false
  const isAdmin = parsedUser ? (parsedUser.roles || []).some((r: any) => ['eUser-Admin', 'eUser-SuperAdmin'].includes(r.role_code)) : false

  if (!isAuthenticated) {
    window.location.href = '/login'
  } else if (isCustomer) {
    window.location.href = '/'
  } else if (isVendor && !isAdmin && to.name && adminRoutes.has(to.name as string)) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
