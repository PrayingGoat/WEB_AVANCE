import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import authService from '../services/authService';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/map'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/map'
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('../views/MapPage.vue')
      },
      {
        path: 'list',
        name: 'List',
        component: () => import('../views/ListPage.vue')
      },
      {
        path: 'my-reports',
        name: 'MyReports',
        component: () => import('../views/MyReportsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfilePage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  // Anciennes routes pour compatibilité
  {
    path: '/map',
    redirect: '/tabs/map'
  },
  {
    path: '/list',
    redirect: '/tabs/list'
  },
  {
    path: '/my-reports',
    redirect: '/tabs/my-reports'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guard de navigation pour les routes protégées
router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth) {
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      next('/login');
      return;
    }
  }
  next();
});

export default router;
