<template>
  <div class="btn-group d-flex flex-column">
    <span>{{ label }}</span>
    <v-btn-toggle class="mt-2" v-model="toggleValue" mandatory>
      <v-btn width="50%" height="40">
        <span>No</span>
      </v-btn>
      <v-btn width="50%" height="40">
        <span>Yes</span>
      </v-btn>
    </v-btn-toggle>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {};
  },
  computed: {
    toggleValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
