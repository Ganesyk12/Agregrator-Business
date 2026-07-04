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
