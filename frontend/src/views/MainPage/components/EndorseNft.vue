<template>
  <div class="create-nft-section">
    <div class="create-nft-title title mb-6">
      Endorse NFT
    </div>
    <ValidationObserver ref="observer" v-slot="{ passes }">
      <div class="create-nft-body">
        <div class="column">
          <TextField v-model="form.nftSymbol" :label="'Symbol'" :placeholder="'Symbol (eg: ABC01)'" :rules="rules.nftSymbol" />
        </div>

        <div class="column">
          <TextField
            v-model="form.itemId"
            :label="'Item ID'"
            :placeholder="'Item ID (For BlockChain Reference)'"
            :rules="rules.itemId"
          />
        </div>

        <div class="column">
          <TextField v-model="form.memo" :label="'Memo'" :placeholder="'Memo (eg: Patient Registration)'" />
        </div>

        <div class="column">
          <TextField v-model="form.metadata" :label="'Metadata'" :placeholder="'Metadata (eg: Patient Registration)'" />
        </div>
      </div>

      <div class="create-nft-action mt-2 mt-sm-4 text-center">
        <v-btn class="btn-cancel mx-1" :disabled="loading" @click="reset">Reset</v-btn>
        <v-btn class="btn-common mx-1" :loading="loading" @click="passes(endorse)">Endorse</v-btn>
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
        nftSymbol: '',
        itemId: '',
        memo: '',
        metadata: '',
      },
      rules: {
        nftSymbol: {
          required: true,
        },
        itemId: {
          required: true,
        },
      },
    };
  },
  methods: {
    endorse() {
      this.loading = true;
      let data = {
        nftSymbol: this.form.nftSymbol,
        itemId: this.form.itemId,
        memo: this.form.memo,
        metadata: { review: this.form.metadata },
      };
      return credential
        .endorseNft(data)
        .then(res => {
          if (res.ret == 0) {
            this.showSuccess('Successfully endorse NFT');
            this.reset();
            this.loading = false;
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
        nftSymbol: '',
        patientRegNo: '',
        itemId: '',
        memo: '',
        metadata: '',
      };
      this.form = newForm;
      this.resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped></style>
