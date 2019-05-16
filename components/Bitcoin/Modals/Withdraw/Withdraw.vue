<template>
  <form class="withdraw" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Withdraw BTC</span>
        </p>
        <hr class="mobile-only">
        <p class="modal-title-right">
          <span class="amount">{{balance.lnd | inUnits | withSuffix}}</span><br>
          <span class="amount-description">In Lightning Network</span>
        </p>
        <p class="modal-title-right">
          <span class="amount">{{balance.btc | inUnits | withSuffix}}</span><br>
          <span class="amount-description">Remaining in Wallet</span>
        </p>
      </header>
      <section class="modal-card-body">
        <b-field label="Recipient's BTC Address">
          <b-input v-model="txData.address" type="text" required></b-input>
        </b-field>
        <br>
        <div class="withdrawal-amount">
          <h2>Amount to Withdraw</h2>
          <p class="desktop-only">You have {{balance.btc | inUnits | withSuffix}} available immediately from your wallet and {{balance.lnd | inUnits | withSuffix}} in the Lightning Network.</p>
          <b-field grouped>
            <b-field label="btc" expanded>
              <b-input type="text" v-if="system.displayUnit === 'btc'" v-model="txData.amount" placeholder="BTC" required></b-input>
              <b-input type="text" v-else v-model="txData.amount" placeholder="sats" required></b-input>
            </b-field>
            <b-field label="usd" expanded>
              <b-input type="text" :value="getDollarValue" placeholder="USD"></b-input>
            </b-field>
          </b-field>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="save()">Continue</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import SystemData from '@/data/system';
import {satsToBtc, btcToSats} from '@/helpers/units';

export default {
  name: 'Withdraw',

  data() {
    return {
      // TODO: we probably want to use target conf here too
      txData: {
        amount: '',
      },
      balance: {
        lnd: null,
        lndPending: null,
        btc: null,
        btcTotal: null,
        btcUnconfirmed: null,
      },
      bitcoin: BitcoinData,
      system: SystemData,
    }
  },

  computed: {
    getDollarValue: function() {
      if(this.system.displayUnit === 'btc') {
        return (this.txData.amount * this.bitcoin.price).toFixed(2);
      } else {
        return (satsToBtc(this.txData.amount) * this.bitcoin.price).toFixed(2);
      }
    }
  },

  async created() {
    const lightningCall = this.$axios.get(`${this.$env.API_LND}/v1/lnd/wallet/lightning`);
    const btcCall = this.$axios.get(`${this.$env.API_LND}/v1/lnd/wallet/btc`);

    const lndValue = (await lightningCall).data;
    const btcValue = (await btcCall).data;

    this.balance.lnd = lndValue.balance;
    this.balance.lndPending = lndValue.pendingOpenBalance;
    this.balance.btc = btcValue.totalBalance;
    this.balance.btcTotal = btcValue.totalBalance; // 'total' includes unconfirmed
    this.balance.btcUnconfirmed = btcValue.totalBalance;
  },
  methods: {
    save() {
      const payload = {
        addr: this.txData.address,
        amt: parseInt(this.txData.amount),
      };

      if(this.system.displayUnit === 'btc') {
        payload.amt = btcToSats(this.txData.amount);
      }

      this.$emit('close');
      EventBus.$emit('withdraw', payload);
    }
  }
};
</script>
