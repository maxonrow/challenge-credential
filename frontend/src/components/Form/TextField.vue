<template>
  <div class="wrapper">
    <ValidationProvider
      :name="validationLabel ? validationLabel : label"
      :rules="rules"
      :disabled="disabled"
      :mode="mode"
      v-slot="{ errors }"
    >
      <v-text-field
        class="input"
        ref="textField"
        v-model="inputValue"
        dense
        :label="label"
        :placeholder="placeholder"
        :outlined="outlined"
        :solo="solo"
        :clearable="clearable"
        :disabled="disabled"
        :readonly="readOnly"
        :error-messages="errors[0]"
        @click:clear="$emit('clearAction')"
        @blur="$emit('blur')"
      ></v-text-field>
    </ValidationProvider>
  </div>
</template>
<script>
export default {
  props: {
    clearable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: 'lazy',
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    solo: {
      type: Boolean,
      default: true,
    },
    value: {
      type: [String, Number],
      default: '',
    },
    validationLabel: {
      type: String,
      default: '',
    },
  },
  data() {
    return {};
  },
  computed: {
    inputValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    focus() {
      this.$refs.textField.focus();
    },
  },
};
</script>
<style lang="scss" scoped>
.input.v-text-field--solo::v-deep {
  .v-input__control {
    .v-input__slot {
      border: 1px solid #c3c3c3;
      box-shadow: none;
      margin-bottom: 2px;

      .v-label {
        font-size: 0.875rem;
      }

      input {
        font-size: 0.875rem;
        padding: 4px 0;

      }
    }
    .v-text-field__details {
      padding: 0px 12px;
      margin-bottom: 2px;
    }
  }
  &.error--text .v-input__slot {
    border: 1px solid var(--error-border-color) !important;
  }
}
.input.v-text-field--outlined::v-deep {
  .v-input__control {
    .v-input__slot {
      margin-bottom: 2px;
      min-height: 38px;
      fieldset {
        border-width: 1px;
      }
      .v-label {
        font-size: 0.875rem;
      }
      input {
        font-size: 0.875rem;
      }
    }
    .v-text-field__details {
      padding: 0px 12px;
      margin-bottom: 2px;
    }
  }
}
</style>
