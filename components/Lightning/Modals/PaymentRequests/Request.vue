<template>
  <form class="deposit" action="">
    <div class="alert alert-status modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Lightning Request Generated
        </p>
      </header>
      <section class="modal-card-body">
        <div class="address-info"
          v-clipboard:copy="invoice.paymentRequest"
          v-clipboard:success="onCopy"
          v-clipboard:error="onError">
          <div class="address-info-left">
            <span class="address payment-request">{{invoice.paymentRequest}}</span>
          </div>
          <a type="button" class="button cancel desktop-only">Copy</a>
        </div>

        <div class="qr-code">
          <qriously :value="invoice.paymentRequest" :size="320"></qriously>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-casa is-fullwidth" type="button" @click="qrContinue()">
          Continue
        </a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {
  name: 'Deposit',

  props: {
    invoice: this.invoice
  },

  data() {
    return {}
  },

  methods: {
    qrContinue() {
      EventBus.$emit('qrcode', this.invoice);
      this.$emit('close');
    },

    onCopy: function(e) {
      this.$toast.open({duration: 3000, message:`Copied Payment Request`});
    },

    onError: function(e) {
      console.log('Failed to copy address text');
    }
  }
};
</script>
