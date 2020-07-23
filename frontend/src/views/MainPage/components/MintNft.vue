<template>
  <div class="create-nft-section">
    <div class="create-nft-title title mb-6">
      Apply Patient Application
    </div>
    <ValidationObserver ref="observer" v-slot="{ passes }">
      <div class="create-nft-body">
        <div class="column">
          <TextField
            v-model="form.businessName"
            :label="'Patient Name'"
            :placeholder="'Patient Name (eg: Andrew Phua)'"
            :rules="rules.businessName"
          />
        </div>

        <div class="column">
          <TextField
            v-model="form.regNo"
            :label="'Patient Registration No.'"
            :placeholder="'Patient Registration No. (eg: P001)'"
            :rules="rules.regNo"
          />
        </div>

        <!-- <div class="column">
          <TextField v-model="form.owner" :label="'Business Owner'" :placeholder="'Transfer Limit (eg: 50)'" :rules="rules.owner" />
        </div> -->

        <!-- <div class="column">
          <DateField v-model="form.expiredDate" :label="'License Expire Date'" :placeholder="'Transfer Limit (eg: 50)'" :rules="rules.expiredDate" />
        </div> -->

        <div class="column">
          <TextField
            v-model="form.itemId"
            :label="'Item ID'"
            :placeholder="'Item ID (For BlockChain Reference)'"
            :rules="rules.itemId"
            :disabled="true"
          />
        </div>

        <div class="column">
          <TextField v-model="form.symbol" :label="'Symbol'" :placeholder="'Symbol (eg: BLC60)'" :rules="rules.symbol" />
        </div>
      </div>

      <div class="create-nft-action mt-2 mt-sm-4 text-center">
        <v-btn class="btn-cancel mx-1" :disabled="loading" @click="reset">Reset</v-btn>
        <v-btn class="btn-common mx-1" :loading="loading" @click="passes(submit)">Submit Application</v-btn>
      </div>
    </ValidationObserver>
  </div>
</template>

<script>
import TextField from '@/components/Form/TextField';
import DateField from '@/components/Form/Date';
import { credential } from '@/api/credential';

export default {
  components: {
    TextField,
    DateField,
  },
  data() {
    return {
      loading: false,
      form: {
        businessName: '',
        regNo: '',
        owner: '',
        expiredDate: '',
        itemId: '',
        symbol: '',
      },
      rules: {
        businessName: {
          required: true,
        },
        regNo: {
          required: true,
        },
        owner: {
          required: true,
        },
        expiredDate: {
          required: true,
        },
        itemId: {
          // required: true,
        },
        symbol: {
          required: true,
        },
      },
    };
  },
  watch: {
    'form.regNo'() {
      this.form.itemId = this.form.regNo;
    }
  },
  methods: {
    submit() {
      this.loading = true;
      let data = {
        nftSymbol: this.form.symbol,
        itemId: this.form.itemId,
        bizName: this.form.businessName,
        bizRegNo: this.form.regNo,
        bizOwner: this.form.owner,
        licExpDate: this.form.expiredDate,
      };
      return credential
        .mintNft(data)
        .then(res => {
          if (res.ret == 0) {
            this.showSuccess('Successfully mint NFT');
            this.reset();
            this.loading = false;
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
        businessName: '',
        regNo: '',
        owner: '',
        expiredDate: '',
        itemId: '',
        symbol: '',
      };
      this.form = { ...newForm };
      this.resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped></style>
