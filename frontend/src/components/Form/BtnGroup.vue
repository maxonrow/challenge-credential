<template>
  <v-btn-toggle v-model="toggleValue" mandatory>
    <v-btn>
      <v-icon>mdi-format-align-left</v-icon>
    </v-btn>
    <v-btn>
      <v-icon>mdi-format-align-center</v-icon>
    </v-btn>
    <v-btn>
      <v-icon>mdi-format-align-right</v-icon>
    </v-btn>
    <v-btn>
      <v-icon>mdi-format-align-justify</v-icon>
    </v-btn>
  </v-btn-toggle>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      toggleValue: null,
    };
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

<style></style>
