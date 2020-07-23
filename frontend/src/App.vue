<template>
  <v-app id="app">
    <div id="snackbar" class="cxlt-toastr-container toast-top-right"></div>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {},
  created() {},
  methods: {},
};
</script>

<style lang="scss">
@import './common/styles';
</style>
