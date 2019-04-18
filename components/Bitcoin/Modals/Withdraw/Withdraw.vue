<template>
  <form class="withdraw" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Withdraw BTC</span>
        </p>
        <hr class="mobile-only">
        <p class="modal-title-right">
          <span class="amount">{{balance.lnd | btc}} BTC</span><br>
          <span class="amount-description">In Lightning Network</span>
        </p>
        <p class="modal-title-right">
          <span class="amount">{{balance.btc | btc}} BTC</span><br>
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
          <p class="desktop-only">You have {{balance.btc | btc}} BTC available immediately from your wallet and {{balance.lnd | btc}} BTC in the Lightning Network.</p>
          <b-field grouped>
            <b-field label="btc" expanded>
              <b-input type="text" v-model="txData.amount" placeholder="BTC" required></b-input>
            </b-field>
            <b-field label="usd" expanded>
              <b-input type="text" :value="fiatTotal" placeholder="USD"></b-input>
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
import {satsToBtc, btcToSats} from '@/helpers/units';

export default {
  name: 'Withdraw',

  data() {
    return {
      // TODO: we probably want to use target conf here too
      txData: {
        amount: '',
        inFiat: '',
      },
      balance: {
        lnd: null,
        lndPending: null,
        btc: null,
        btcTotal: null,
        btcUnconfirmed: null
      }
    }
  },

  computed: {
    fiatTotal() {
      if(this.txData.amount) {
        return (this.txData.amount * this.txData.inFiat).toFixed(2);
      }

      return null;
    }
  },

  async created() {
    const lightningCall = this.$axios.get(`${this.$env.API_LND}/v1/lnd/wallet/lightning`);
    const btcCall = this.$axios.get(`${this.$env.API_LND}/v1/lnd/wallet/btc`);
    const usdToBtcCall = axios.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD');

    const lndValue = (await lightningCall).data;
    const btcValue = (await btcCall).data;

    this.balance.lnd = lndValue.balance;
    this.balance.lndPending = lndValue.pendingOpenBalance;
    this.balance.btc = btcValue.totalBalance;
    this.balance.btcTotal = btcValue.totalBalance; // 'total' includes unconfirmed
    this.balance.btcUnconfirmed = btcValue.totalBalance;

    const {USD} = (await usdToBtcCall).data;
    this.txData.inFiat = USD;
  },
  methods: {
    save() {
      const data = {
        addr: this.txData.address,
        amt: btcToSats(this.txData.amount),
      };
      this.$emit('close');
      EventBus.$emit('withdraw', data);
    }
  }
};
</script>
