import Vue from 'vue';
import Router from 'vue-router';

import { routes } from './router-components';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  next();
});

router.afterEach(to => {
  if (!to.meta.keepAlive) {
    window.scrollTo(0, 0);
  }
});

export default router;
