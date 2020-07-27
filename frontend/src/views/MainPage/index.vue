<template>
  <div class="main-page container mt-2">
    <div class="content-wrapper d-flex justify-center">
      <v-card class="flex-grow-1" elevation="2">
        <v-tabs v-model="tab" background-color="transparent" active-class="gradient-bg" @change="clearValidation">
          <v-tab v-for="item in items" :key="item.id">
            <span class="subtitle-1 tab-title">{{ item.tab }}</span>
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item v-for="item in items" :key="item.tab">
            <div v-if="item.id == 0" class="pa-6">
              <CreateNFT ref="createNft"></CreateNFT>
            </div>
            <div v-if="item.id == 1" class="pa-6">
              <ApproveNFT ref="approveNft"></ApproveNFT>
            </div>
            <div v-if="item.id == 2" class="pa-6">
              <MintNFT ref="mintNft"></MintNFT>
            </div>
            <div v-if="item.id == 3" class="pa-6">
              <VerifyNFT ref="verifyNft"></VerifyNFT>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </div>
  </div>
</template>

<script>
import CreateNFT from './components/CreateNft';
import ApproveNFT from './components/ApproveNft';
import MintNFT from './components/MintNft';
import VerifyNFT from './components/VerifyNft';

export default {
  components: {
    CreateNFT,
    ApproveNFT,
    MintNFT,
    VerifyNFT,
  },
  data() {
    return {
      tab: 0,
      items: [
        { id: 0, tab: 'Create NFT' },
        { id: 1, tab: 'Approve NFT' },
        { id: 2, tab: 'Mint NFT' },
        { id: 3, tab: 'Verify NFT' },
        // { id: 4, tab: 'Endorse NFT' },
      ],
    };
  },
  methods: {
    clearValidation() {
      // if (this.tab == 0) this.$refs.verifyNft[0].resetValidation();
      // else this.$refs.mintNft[0].resetValidation();
    },
  },
};
</script>

<style lang="scss" scoped>
.content-wrapper {
  .v-card {
    max-width: 800px;

    .tab-title {
      text-transform: capitalize;
    }
  }

  .v-tab {
    &.gradient-bg {
      background: linear-gradient(
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0) 70%,
        rgba(84, 164, 255, 0.1) 90%,
        rgba(84, 164, 255, 0.2) 100%
      );
    }
  }
}
</style>
