<template>
  <div class="create-nft-section">
    <div class="create-nft-title title mb-6">
      Approve NFT
    </div>
    <ValidationObserver ref="observer" v-slot="{ passes }">
      <div class="create-nft-body">
        <div class="column">
          <TextField v-model="form.symbol" :label="'Symbol'" :placeholder="'Symbol (eg: ABC01)'" :rules="rules.symbol" />
        </div>

        <div class="column">
          <TextField
            v-model="form.mintLimit"
            :label="'Mint Limit'"
            :placeholder="'Mint Limit (eg: 100)'"
            :rules="rules.mintLimit"
          />
        </div>

        <div class="column">
          <TextField
            v-model="form.transferLimit"
            :label="'Transfer Limit'"
            :placeholder="'Transfer Limit (eg: 50)'"
            :rules="rules.transferLimit"
          />
        </div>

        <v-row>
          <v-col cols="12" sm="4">
            <div class="column">
              <BtnGroup :label="'Burnable:'" v-model="form.burnable" />
            </div>
          </v-col>

          <v-col cols="12" sm="4">
            <div class="column">
              <BtnGroup :label="'Transferable:'" v-model="form.transferable" />
            </div>
          </v-col>

          <v-col cols="12" sm="4">
            <div class="column">
              <BtnGroup :label="'Modifiable:'" v-model="form.modifiable" />
            </div>
          </v-col>

          <v-col cols="12" sm="4">
            <div class="column">
              <BtnGroup :label="'Public:'" v-model="form.pub" />
            </div>
          </v-col>
        </v-row>
      </div>

      <div class="create-nft-action mt-2 mt-sm-4 text-center">
        <v-btn class="btn-cancel mx-1" :disabled="loading" @click="reset">Reset</v-btn>
        <v-btn class="btn-common mx-1" :loading="loading" @click="passes(submit)">Approve</v-btn>
      </div>
    </ValidationObserver>
  </div>
</template>

<script>
import TextField from '@/components/Form/TextField';
import BtnGroup from '@/components/Form/BtnGroup';
import { credential } from '@/api/credential';

export default {
  components: {
    TextField,
    BtnGroup,
  },
  data() {
    return {
      loading: false,
      form: {
        symbol: '',
        mintLimit: '',
        transferLimit: '',
        burnable: 0,
        transferable: 0,
        modifiable: 0,
        pub: 0,
      },
      rules: {
        symbol: {
          required: true,
        },
        mintLimit: {
          required: true,
        },
        transferLimit: {
          required: true,
        },
      },
    };
  },
  methods: {
    submit() {
      this.loading = true;
      let form = {
        symbol: this.form.symbol,
        mintLimit: this.form.mintLimit,
        transferLimit: this.form.transferLimit,
        burnable: this.convertToBoolean(this.form.burnable),
        transferable: this.convertToBoolean(this.form.transferable),
        modifiable: this.convertToBoolean(this.form.modifiable),
        pub: this.convertToBoolean(this.form.pub),
      };
      return credential
        .approveNft(form)
        .then(res => {
          if (res.ret == 0) {
            this.showSuccess('Successfully mint NFT');
            this.reset();
            this.loading = false;
            this.$emit('results', form);
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
        symbol: '',
        mintLimit: '',
        transferLimit: '',
        burnable: 0,
        transferable: 0,
        modifiable: 0,
        pub: 0,
      };
      this.form = newForm;
      this.resetValidation();
    },
    convertToBoolean(value) {
      if (value == 0) return false;
      else return true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
