<template>
  <div class="wrapper">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="0"
      :nudge-top="5"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <ValidationProvider :name="label" :rules="rules" :mode="mode" v-slot="{ errors }">
          <v-text-field
            v-model="inputValue"
            class="input"
            readonly
            v-on="on"
            dense
            :label="label"
            :outlined="outlined"
            :solo="solo"
            :disabled="disabled"
            :placeholder="placeholder"
            :error-messages="errors[0]"
            :clearable="true"
          ></v-text-field>
        </ValidationProvider>
      </template>
      <v-date-picker :disabled="disabled" v-model="inputValue" @input="menu = false"></v-date-picker>
    </v-menu>
  </div>
</template>
<script>
export default {
  props: {
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
    mode: {
      type: String,
      default: 'passive',
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
      type: [String],
      default: '',
    },
  },
  data() {
    return {
      menu: false,
    };
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
      fieldset {
        border-width: 1px;
      }
    }
  }
}
</style>
