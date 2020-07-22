import Vue from 'vue';
import Toastr from '../components/Toastr';

export default {
  methods: {
    showSuccess(msg) {
      var ComponentClass = Vue.extend(Toastr);
      var instance = new ComponentClass({
        propsData: { title: 'Success', message: msg, type: 'success' },
      });
      instance.$mount();
      var snackbarTag = document.getElementById('snackbar');
      snackbarTag.appendChild(instance.$el);
    },
  },
};

export function showError(msg) {
  var ComponentClass = Vue.extend(Toastr);
  var instance = new ComponentClass({
    propsData: { title: 'Error', message: msg, type: 'error' },
  });
  instance.$mount();
  var snackbarTag = document.getElementById('snackbar');
  snackbarTag.appendChild(instance.$el);
}
