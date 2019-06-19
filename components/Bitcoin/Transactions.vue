<template>
  <section class="bitcoin-menu">
    <div class="slideout-header">
      <a @click.prevent="closePanel">
        <span class="icon">
          <img src="~assets/icon-close.svg">
        </span>

        <span>Close</span>
      </a>

      <UnitSwitch />
    </div>

    <div class="app-slideout btc transactions">
      <div class="app-title">
        <img src="~assets/bitcoin.svg" alt="Bitcoin">
        <h2>Bitcoin Transactions</h2>
      </div>

      <hr>

      <div class="stats">
        <div class="stats-col">
          <h1>{{bitcoin.wallet.totalBalance | inUnits | withSuffix}}</h1>
          <h2>Bitcoin Balance</h2>
        </div>
      </div>

      <!-- BTC Wallet Section -->
      <div class="tx-actions">
        <a class="button" @click="withdraw()">
          <span class="icon">
            <img src="~assets/paper-plane.svg" alt="send">
          </span>
          <span>Withdraw</span>
        </a>
        <a class="button" @click="deposit()">
          <span class="icon">
            <img src="~assets/qr-code.svg" alt="qr-code">
          </span>
          <span>Deposit</span>
        </a>
      </div><hr>

      <div class="transaction-list-wrap">
        <!-- Pending Transactions -->
        <div class="tx-list" v-if="bitcoin.pending.length">
          <h3>Pending</h3><br>
          <ul class="pending-tx">
            <li class="tx-item" v-for="(transaction, index) in bitcoin.pending" :key="index">
              <a :href="btcExplorer + transaction.txHash" target="_blank" rel="noopener">
                <div class="tx-row">
                  <div class="tx-col-1">
                    <div class="date-badge">
                      <span class="month">{{ (new Date(transaction.timeStamp*1000)).toISOString() | moment("MMM") }}</span>
                      <span class="day">{{ (new Date(transaction.timeStamp*1000)).toISOString() | moment("D") }}</span>
                    </div>
                  </div>
                  <div class="tx-col-2 desktop-only">
                    <h2 v-if="transaction.type === 'ON_CHAIN_TRANSACTION_SENT'">Sending Bitcoin</h2>
                    <h2 v-else>Receiving Bitcoin</h2>
                    <h3>
                      {{transaction.destAddresses[0]}}
                    </h3>
                  </div>
                  <div class="tx-col-3">
                    <h2><span>{{transaction.amount | inUnits | withSuffix}}</span></h2>
                    <h3>{{ transaction.amount | usd }}</h3>
                  </div>
                </div>

                <div class="tx-info mobile-only">
                  <h2 v-if="transaction.type === 'ON_CHAIN_TRANSACTION_SENT'">Sending Bitcoin</h2>
                  <h2 v-else>Receiving Bitcoin</h2>
                  <h3>
                    {{transaction.destAddresses[0]}}
                  </h3>
                </div>
              </a>
              <hr>
            </li>
          </ul>
        </div>

        <!-- Completed Transactions -->
        <div class="tx-list" v-if="bitcoin.transactions.length">
          <h3>Completed</h3><br>
          <ul class="pending-tx">
            <li class="tx-item" v-for="(transaction, index) in bitcoin.transactions" :key="index">
              <a :href="btcExplorer + transaction.txHash" target="_blank" rel="noopener">
                <div class="tx-row">
                  <div class="tx-col-1">
                    <div class="date-badge">
                      <span class="month">{{ (new Date(transaction.timeStamp*1000)).toISOString() | moment("MMM") }}</span>
                      <span class="day">{{ (new Date(transaction.timeStamp*1000)).toISOString() | moment("D") }}</span>
                    </div>
                  </div>
                  <div class="tx-col-2 desktop-only">
                    <h2 v-if="transaction.type === 'ON_CHAIN_TRANSACTION_SENT'">Sent Bitcoin</h2>
                    <h2 v-else>Received Bitcoin</h2>
                    <h3>
                      {{transaction.destAddresses[0]}}
                    </h3>
                  </div>
                  <div class="tx-col-3">
                    <h2><span>{{transaction.amount | inUnits | withSuffix}}</span></h2>
                    <h3>{{ transaction.amount | usd }}</h3>
                  </div>
                </div>

                <div class="tx-info mobile-only">
                  <h2 v-if="transaction.type === 'ON_CHAIN_TRANSACTION_SENT'">Sent Bitcoin</h2>
                  <h2 v-else>Received Bitcoin</h2>
                  <h3>
                    {{transaction.destAddresses[0]}}
                  </h3>
                </div>
              </a>
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

import Deposit from '@/components/Bitcoin/Modals/Deposit/Deposit';
import Withdraw from '@/components/Bitcoin/Modals/Withdraw/Withdraw';
import UnitSwitch from '@/components/Settings/UnitSwitch';

export default {
  name: 'Wallet',

  data() {
    return {
      btcExplorer: this.$env.BITCOIN_EXPLORER,
      bitcoin: BitcoinData
    }
  },

  mounted() {
    var vm = this;
    // close panel if canceled
    EventBus.$on('cancel', () => vm.closePanel());
    // handle withdrawl modal
    EventBus.$on('withdraw', (data) => vm.sendBTC(data));
  },

  async created() {
    // Start auto-updating bitcoin transactions
    EventBus.$emit('load-bitcoin-transactions');
  },

  destroyed() {
    EventBus.$off('cancel');
    EventBus.$off('withdraw');
  },

  methods: {
    closePanel() {
      this.$emit('closePanel');
    },
    deposit() {
      this.$modal.open({parent: this, component: Deposit, hasModalCard: true})
    },
    withdraw() {
      this.$modal.open({parent: this, component: Withdraw, hasModalCard: true})
    },
    showErrorMessage(err) {
      this.$toast.open({duration: 4000, message: `Error: ${err.response.data}`, type: 'is-danger'});
    },
    async sendBTC(data) {
      try {
        const sentBTC = await this.$axios.post(`${this.$env.API_LND}/v1/lnd/transaction`, data);

        // Notify Successful Sending
        this.$toast.open({duration: 4000, message: 'Transaction Sent', type: 'is-success'});

        // Reload transaction info after sending
        EventBus.$emit('load-bitcoin-stats');
        EventBus.$emit('load-bitcoin-transactions');
      } catch (err) {
        this.showErrorMessage(err);
      }
    }
  },

  components: {
    UnitSwitch
  },
};
</script>
