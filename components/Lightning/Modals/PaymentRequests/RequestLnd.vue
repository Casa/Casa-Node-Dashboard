<template>
  <form class="withdraw" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Request Lightning Payment</span>
        </p>
      </header>
      <section class="modal-card-body">
        <div class="withdrawal-amount request-amount">
          <h2>Amount to Request</h2>
          <div class="field is-grouped">
            <div class="field is-expanded">
              <p class="control is-expanded has-icons-right">
                <input class="input" type="number" v-model="invoice.amount">
                <span class="icon is-small is-right"><i>{{ getUnit }}</i></span>
              </p>
            </div>
            <div class="field is-expanded">
              <p class="control is-expanded has-icons-right">
                <input class="input" type="number" :value="getDollarValue">
                <span class="icon is-small is-right"><i>USD</i></span>
              </p>
            </div>
          </div>
        </div>
        <b-field label="Memo">
          <b-input maxlength="200" type="textarea" v-model="invoice.memo"></b-input>
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="newInvoice()">Continue</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import SystemData from '@/data/system';
import {satsToBtc, btcToSats} from '@/helpers/units';

export default {
  name: 'RequestLnd',
  data() {
    return {
      satPerByte: 5,
      txData: {amount: 0},
      system: SystemData,
      invoice: {},
      balance: {}
    };
  },

  async created() {
    const value = await this.$axios.get(`${this.$env.API_LND}/v1/lnd/wallet/lightning`);
    this.balance.btc = value.data.balance;
    this.balance.lnd = value.data.pendingOpenBalance;
    const {data: {USD}} = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD');
    this.txData.inFiat = USD;
  },

  computed: {
    getDollarValue() {
      let amount = this.invoice.amount;

      if(this.system.displayUnit === 'sats') {
        amount = satsToBtc(amount);
      }

      return (amount * this.txData.inFiat).toFixed(2);
    },

    getUnit() {
      if(this.system.displayUnit === 'btc') {
        return 'BTC';
      } else if(this.system.displayUnit === 'sats') {
        return 'sats';
      }
    },
  },

  methods: {
    // add invoice
    async newInvoice() {
      EventBus.$emit('loading-start');

      let amount = this.invoice.amount;
      if(this.system.displayUnit === 'btc') {
        amount = btcToSats(amount);
      }

      var invoiceData = {amt: amount, memo: this.invoice.memo};
      try {
        var {data} = await this.$axios.post(`${this.$env.API_LND}/v1/lnd/lightning/addInvoice`, invoiceData);
        var paymentRequest = {...data, ...invoiceData};
        EventBus.$emit('invoice', paymentRequest);
        this.$emit('close');
      } catch (err) {
        this.$toast.open({duration: 4000, message: err.response.data, position: 'is-top', type: 'is-danger'});
      }

      EventBus.$emit('loading-stop');
    }
  }
};
</script>
