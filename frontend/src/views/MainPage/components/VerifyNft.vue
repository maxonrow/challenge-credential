<template>
  <div class="verify-nft-section">
    <div class="verify-nft-title title mb-3 mb-sm-6">
      Verify License
    </div>
    <ValidationObserver ref="observer" v-slot="{ passes }">
      <div class="verify-nft-body d-flex flex-sm-row flex-column">
        <TextField
          v-model="form.itemId"
          class="flex-grow-1 mx-1"
          :label="'Item ID'"
          :placeholder="'Item ID (eg: P001)'"
          :rules="rules.itemId"
        />

        <TextField
          v-model="form.symbol"
          class="flex-grow-1 mx-1"
          :label="'Symbol'"
          :placeholder="'Symbol (eg: BLC60)'"
          :rules="rules.symbol"
        />
      </div>

      <div class="verify-nft-action ml-3 text-center">
        <v-btn class="btn-cancel mx-1" :disabled="loading" @click="reset">Reset</v-btn>
        <v-btn class="btn-common mx-1" :loading="loading" @click="passes(submit)">Verify License</v-btn>
      </div>
    </ValidationObserver>

    <div class="verification-result mt-4">
      <fieldset>
        <legend class="ml-4 font-16">Verification Result</legend>
        <div class="field-section-wrapper ma-6">
          <div class="field-section d-flex flex-column flex-sm-row">
            <div class="field-name">Item ID:</div>
            <div class="field-result">{{ result.itemId }}</div>
          </div>

          <div class="field-section d-flex flex-column flex-sm-row">
            <div class="field-name">Patient Name:</div>
            <div class="field-result">{{ result.patientName }}</div>
          </div>

          <div class="field-section d-flex flex-column flex-sm-row">
            <div class="field-name">Patient Registration No:</div>
            <div class="field-result">{{ result.regNo }}</div>
          </div>
        </div>
      </fieldset>
    </div>
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
        itemId: '',
        symbol: '',
      },
      result: {
        patientName: '',
        regNo: '',
        itemId: '',
      },
      rules: {
        itemId: {
          required: true,
        },
        symbol: {
          required: true,
        },
      },
    };
  },
  methods: {
    submit() {
      this.loading = true;
      let params = {
        nftSymbol: this.form.symbol,
        itemId: this.form.itemId,
      };
      params.itemId = params.itemId.trim();
      params.nftSymbol = params.nftSymbol.trim();
      return credential
        .queryNft(params)
        .then(res => {
          if (res.ret == 0) {
            const { metadata, properties, id } = res.data;
            const { centerName } = JSON.parse(properties);
            const { bedCapacity } = JSON.parse(metadata);
            this.result.itemId = id;
            this.result.patientName = centerName;
            this.result.regNo = bedCapacity;
            this.loading = false;
          }
        })
        .catch(err => {
          console.log(`error: ${err.msg}`);
          this.loading = false;
        });
    },
    resetValidation() {
      this.$refs.observer.reset();
    },
    reset() {
      let newForm = {
        itemId: '',
        symbol: '',
      };
      let newResult = {
        patientName: '',
        regNo: '',
        itemId: '',
      };

      this.form = newForm;
      this.result = newResult;
      this.resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped>
.verification-result {
  fieldset {
    border-radius: 7px;
    border-width: 1px;
    border-color: #c3c3c3;
  }

  .field-section {
    margin: 15px 0;
    .field-name {
      min-width: 210px;
      font-weight: bold;
    }

    .field-result {
      word-break: break-word;
    }
  }
}
</style>
