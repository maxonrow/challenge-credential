<template>
  <v-main class="plain-layout-wrap">
    <Navbar />
    <router-view></router-view>
  </v-main>
</template>

<script>
import Navbar from '@/components/NavBar';

export default {
  name: 'PlainLayout',
  components: {
    Navbar,
  },
};
</script>
<style lang="scss" scoped>
.plain-layout-wrap {
  margin: 0px;
}
</style>
