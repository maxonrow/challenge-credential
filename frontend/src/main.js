import Vue from 'vue';
import App from './App.vue';

import router from './router';
import tool from './mixins/tool';
import common from './mixins/common';

import vuetify from './plugins/vuetify';

import { extend } from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';

Object.keys(rules).forEach(rule => {
  extend(rule, rules[rule]);
});

extend('required', {
  message: '{_field_} is required'
});

import { ValidationObserver, ValidationProvider } from 'vee-validate';

Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

Vue.mixin(tool);
Vue.mixin(common);

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app');
