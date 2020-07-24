<template>
  <div class="create-nft-section">
    <div class="create-nft-title title mb-6">
      Create Center NFT
    </div>
    <ValidationObserver ref="observer" v-slot="{ passes }">
      <div class="create-nft-body">
        <div class="column">
          <TextField
            v-model="form.name"
            :label="'Center Name'"
            :placeholder="'Center Name (eg: Hospital ABC)'"
            :mandatory="rules.name.required"
            :rules="rules.name"
          />
        </div>

        <div class="column">
          <TextField v-model="form.symbol" :label="'Symbol'" :placeholder="'Symbol (eg: ABC01)'" :rules="rules.symbol" />
        </div>

        <div class="column">
          <TextField
            v-model="form.metaData"
            :label="'Metadata'"
            :placeholder="'Metadata (eg: Hospital ABC)'"
            :rules="rules.metaData"
          />
        </div>

        <div class="column">
          <TextField
            v-model="form.properties"
            :label="'Properties'"
            :placeholder="'Properties (eg: Hospital ABC)'"
            :rules="rules.properties"
          />
        </div>
      </div>

      <div class="create-nft-action mt-2 mt-sm-4 text-center">
        <v-btn class="btn-cancel mx-1" :disabled="loading" @click="reset">Reset</v-btn>
        <v-btn class="btn-common mx-1" :loading="loading" @click="passes(submit)">Create</v-btn>
      </div>
    </ValidationObserver>
  </div>
</template>

<script>
import TextField from '@/components/Form/TextField';
import { credential } from '@/api/credential';

export default {
  components: {
    TextField,
  },
  data() {
    return {
      loading: false,
      form: {
        name: '',
        symbol: '',
        metaData: '',
        properties: '',
      },
      rules: {
        name: {
          required: true,
        },
        symbol: {
          required: true,
        },
        metaData: {
          required: true,
        },
        properties: {
          required: true,
        },
      },
    };
  },
  methods: {
    submit() {
      this.loading = true;
      let data = {
        name: this.form.name,
        symbol: this.form.symbol,
        metadata: this.form.metaData,
        properties: this.form.properties,
      };
      return credential
        .createNft(data)
        .then(res => {
          if (res.ret == 0) {
            this.showSuccess('Successfully created NFT');
            this.reset();
            this.loading = false;
            this.$emit('clearLog');
            this.$emit('results', data);
          }
        })
        .catch(err => {
          console.log(`error: ${err.msg}`);
          this.reset();
          this.loading = false;
        });
    },
    resetValidation() {
      this.$refs.observer.reset();
    },
    reset() {
      let newForm = {
        name: '',
        symbol: '',
        metaData: '',
        properties: '',
      };
      this.form = newForm;
      this.resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped></style>
