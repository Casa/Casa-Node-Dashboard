<template>
  <section>
    <div class="slideout-header">
      <a @click.prevent="closePanel">
        <span class="icon">
          <img src="~assets/icon-close.svg">
        </span>

        <span>Close</span>
      </a>
    </div>

    <div class="app-slideout lnd transactions">
      <div class="app-title">
        <img src="~assets/lightning.png" alt="Lightning">
        <h2>Lightning Transactions</h2>
      </div>

      <hr>

      <div class="stats">
        <div class="stats-col">
          <h1>{{lightning.balance.confirmed | btc}} BTC</h1>
          <h2>in Lightning Channels</h2>
        </div>

        <div class="stats-col">
          <h1>{{lightning.maxPaymentIn | btc}} BTC</h1>
          <h2>
            Max Incoming Payment

            <b-tooltip label="Based on the largest amount of BTC in the other side of a channel opened with you. Multiple channels currently can't be combined to make larger payments." type="is-dark" position="is-left" multilined>
               <span class="icon is-small"><img src="~assets/icon-info-blue.svg" alt="info"></span>
            </b-tooltip>
          </h2>
        </div>

        <div class="stats-col">
          <h1>{{lightning.maxPaymentOut | btc}} BTC</h1>
          <h2>
            Max Outgoing Payment

            <b-tooltip label="Based on the largest amount of BTC in your side of a channel. Multiple channels currently can't be combined to make larger payments." type="is-dark" position="is-left" multilined>
               <span class="icon is-small"><img src="~assets/icon-info-blue.svg" alt="info"></span>
            </b-tooltip>
          </h2>
        </div>
      </div>

      <!-- LND Payment Section -->
      <div class="tx-actions">
        <a class="button" @click="send()">
          <span class="icon">
            <img src="~assets/paper-plane.svg" alt="send">
          </span>
          <span>Send Lightning Payment</span>
        </a>
        <a class="button" @click="requestInvoice()">
          <span class="icon">
            <img src="~assets/qr-code.svg" alt="qr-code">
          </span>
          <span>Request Lightning Payment</span>
        </a>
      </div><hr>

      <div class="transaction-list-wrap">
        <!-- Pending Transactions -->
        <div class="tx-list" v-if="lightning.pending.length">
          <h3>Pending</h3><br>
          <ul class="pending-tx">
            <li class="tx-item" v-for="(transaction, index) in lightning.pending" :key="index">
              <div class="tx-row">
                <div class="tx-col-1">
                  <div class="date-badge">
                    <span class="month">{{ (new Date(transaction.creationDate*1000)).toISOString() | moment("MMM") }}</span>
                    <span class="day">{{ (new Date(transaction.creationDate*1000)).toISOString() | moment("D") }}</span>
                  </div>
                </div>
                <div class="tx-col-2">
                  <h2 v-if="Math.sign(parseInt(transaction.value)) === -1">Sending Lightning Payment</h2>
                  <h2 v-else>Receiving Lightning Payment</h2>
                  <h3>{{transaction.memo}}</h3>
                </div>
                <div class="tx-col-3">
                  <h2><span>{{transaction.value | btc}}</span> BTC</h2>
                  <h3>${{ ((parseInt(transaction.value) / 100000000) * bitcoin.price).toFixed(2)}}</h3>
                </div>
              </div>
              <hr>
            </li>
          </ul>
        </div>

        <!-- Completed Transactions -->
        <div class="tx-list" v-if="lightning.transactions.length">
          <h3>Completed</h3><br>
          <ul class="pending-tx">
            <li class="tx-item" v-for="(transaction, index) in lightning.transactions" :key="index">
              <div class="tx-row">
                <div class="tx-col-1">
                  <div class="date-badge">
                    <span class="month">{{ (new Date(transaction.creationDate*1000)).toISOString() | moment("MMM") }}</span>
                    <span class="day">{{ (new Date(transaction.creationDate*1000)).toISOString() | moment("D") }}</span>
                  </div>
                </div>
                <div class="tx-col-2">
                  <h2 v-if="Math.sign(parseInt(transaction.value)) === -1">Sent Lightning Payment</h2>
                  <h2 v-else>Received Lightning Payment</h2>
                  <h3>{{transaction.memo}}</h3>
                </div>
                <div class="tx-col-3">
                  <h2><span>{{transaction.value | btc}}</span> BTC</h2>
                  <h3>${{ ((parseInt(transaction.value)/100000000) * bitcoin.price).toFixed(2)}}</h3>
                </div>
              </div>
              <hr>
            </li>
          </ul>
        </div> <!-- .tx-list -->
      </div> <!-- .transaction-list-wrap -->
    </div> <!-- .app-slideout -->

  </section>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import LightningData from '@/data/lightning';

import Send from '@/components/Lightning/Modals/SendPayment/Send';
import ConfirmPayment from '@/components/Lightning/Modals/SendPayment/ConfirmPayment';
import Request from '@/components/Lightning/Modals/PaymentRequests/Request';
import RequestLnd from '@/components/Lightning/Modals/PaymentRequests/RequestLnd';
import ConfirmInvoice from '@/components/Lightning/Modals/PaymentRequests/ConfirmInvoice';

export default {
  name: 'Wallet',

  data() {
    return {
      bitcoin: BitcoinData,
      lightning: LightningData,
    }
  },

  mounted() {
    var vm = this;

    // close panel if canceled
    EventBus.$on('cancel', () => vm.closePanel());

    // show invoice
    EventBus.$on('invoice', (data) => vm.showInvoice(data));

    // withdrawl confirmation
    EventBus.$on('qrcode', (data) => {
      /* Disables redundant data modal for now
      vm.confirmInvoice(data)
      */
    });

    // payment confirmation
    EventBus.$on('payment', (data) => vm.confirmPayment(data));
  },

  async created() {
    EventBus.$emit('load-lightning-stats');
    EventBus.$emit('load-lightning-transactions');
  },

  destroyed() {
    EventBus.$emit('stop-lightning-stats');
    EventBus.$emit('stop-lightning-transactions');
    EventBus.$off('cancel');
    EventBus.$off('invoice');
    EventBus.$off('qrcode');
    EventBus.$off('payment');
  },

  methods: {
    closePanel() {
      this.$emit('closePanel');
      this.$destroy();
    },
    send() {
      this.$modal.open({parent: this, component: Send, hasModalCard: true})
    },
    requestInvoice() {
      this.$modal.open({parent: this, component: RequestLnd, hasModalCard: true})
    },
    showInvoice(data) {
      this.$modal.open({parent: this, component: Request, hasModalCard: true, props: {invoice: data}})
    },
    confirmPayment(data) {
      this.$modal.open({parent: this, component: ConfirmPayment, hasModalCard: true, props: {invoice: data}})
    },
    confirmInvoice(data) {
      this.$modal.open({parent: this, component: ConfirmInvoice, hasModalCard: true, props: {invoice: data}})
    },
    showErrorMessage(err) {
      this.$toast.open({duration: 4000, message: `Error: ${err.response.data}`, type: 'is-danger'});
    }
  }

};
</script>
