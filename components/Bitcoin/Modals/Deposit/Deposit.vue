<template>
  <form class="deposit" action="">
    <div class="alert alert-status modal-card">
      <header class="modal-card-head">Deposit BTC</header>
      <section class="modal-card-body">
        <div class="address-info">
          <div class="address-info-left">
            <strong>Your BTC Address</strong>
            <span class="address">{{address}}</span>
          </div>
          <!-- Display loading status -->
          <a type="button" class="button cancel"
            v-clipboard:copy="address"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">Copy</a>
          <br>
        </div>
        <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading>
        <qr-code :text="address"></qr-code>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-casa is-fullwidth" type="button" @click="$parent.close()">
          Continue
        </a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Deposit',

  data() {
    return {
      address: '',
      message: '',
      isLoading: true
    }
  },

  async created() {

    // Warn user of delay if not yet synced
    try {
      const sync = await this.$axios.get(`${this.$env.API_LND}/v1/lnd/info/sync`);

      if(sync.data.percent !== '1.0000') {
        this.$snackbar.open({
          duration: 5000,
          message: 'Your Lightning Node is syncing. Wallet address generation can take up to 2 minutes during this time.',
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Dismiss',
          queue: false,
          onAction: () => {}
        });
      }
    } catch (err) {
      console.log('error:', err);
    }

    try {
      const res = await this.$axios.get(`${this.$env.API_LND}/v1/lnd/address`);
      this.address = res.data.address;
    } catch (err) {
      console.log('error:', err);
    } finally {
      this.isLoading = false
    }
  },

  methods: {
    onCopy: function(e) {
      this.$toast.open({duration: 3000, message:`Copied ${e.text}`});
    },
    onError: function(e) {
      console.log('Failed to copy address text', e);
    }
  }
};
</script>
