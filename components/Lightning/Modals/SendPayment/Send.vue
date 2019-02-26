<template>
  <form class="withdraw send" @submit.prevent="continuePayment()">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Send Lightning Payment</span>
        </p>
      </header>
      <section class="modal-card-body">
        <b-field label="Payment Code">
          <b-input type="text" required v-model="paymentRequest"></b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="continuePayment()">Continue</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {

  name: 'Send',

  data() {
    return {
      paymentRequest: ''
    }
  },

  methods: {
    async sendPayment() {
      console.log('send payment', this.paymentRequest);
    },
    continuePayment() {
      EventBus.$emit('payment', this.paymentRequest);
      this.$emit('close');
    }
  }
};
</script>
