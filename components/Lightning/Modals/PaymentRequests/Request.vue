<template>
  <form class="deposit" action="">
    <div class="alert alert-status modal-card">
      <header class="modal-card-head">Lightning Request Generated</header>
      <section class="modal-card-body">
        <div class="address-info">
          <div class="address-info-left">
            <span class="address payment-request">{{invoice.paymentRequest}}</span>
          </div>
          <a type="button" class="button cancel"
            v-clipboard:copy="invoice.paymentRequest"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError">Copy</a>
          <br>
        </div>
        <qr-code :text="invoice.paymentRequest" error-level="L"></qr-code>
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
