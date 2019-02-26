<template>
  <form @submit.prevent="unlockWallet()">
    <div class="modal-card unlock-wallet" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Unlock Casa Node</span>
        </p>
      </header>
      <section class="modal-card-body">
        <p v-if="isError && authFailed">
          <strong class="has-text-danger">Invalid Passphrase. Please try again.</strong><br><br>
        </p>
        <p v-if="isError && !unlockReady">
          <strong class="has-text-danger">Lightning is syncing. Please wait a few minutes and refresh your page to try again.</strong><br><br>
        </p>
        <b-field label="Password">
          <b-input type="password" v-model="data.password" placeholder="Enter password" required></b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="cancelUnlock()">Cancel</a>
        <a class="button is-casa is-pulled-right" type="button" @click="unlockWallet()">Unlock</a>
        <b-loading :is-full-page="true" :active.sync="data.isLoading"></b-loading>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Unlock',
  props: ['parent'],

  data() {
    return {
      isError: false,
      authFailed: false,
      unlockReady: true, // presumed true unless there's a 500 error
      data: {
        password:'',
        isLoading: false
      }
    }
  },
  methods: {
    cancelUnlock() {
      this.parent.$emit('cancel-lnd');
      this.$parent.close();
    },

    async unlockWallet() {
      const payload = {password: this.data.password};
      try {
        this.data.isLoading = true;
        await this.$axios.post(`${this.$env.API_LND}/v1/lnd/wallet/unlock`, payload);
        this.$toast.open({duration: 4000, message: 'Unlocked Successfully', position: 'is-top', type: 'is-success'});
        this.$emit('close');
        this.parent.$emit('unlock-lnd');
      } catch (err) {
        this.isError = true;
        // handle specific error states
        if(err.response.data.indexOf("invalid passphrase") > -1) {
          this.authFailed = true;
        } else {
          // grpc isn't ready
          this.unlockReady = false;
        }
      } finally {
        this.data.isLoading = false;
        this.data.password = '';
      }
    }
  }

};
</script>
