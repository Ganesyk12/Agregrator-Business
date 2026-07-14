import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
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
          path: 'vendors',
          name: 'vendors',
          component: () => import('@/dashboard/views/VendorView.vue'),
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

export default router
