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
                <input class="input" v-model="invoice.amount">
                <span class="icon is-small is-right"><i>{{ getUnit }}</i></span>
              </p>
            </div>
            <div class="field is-expanded">
              <p class="control is-expanded has-icons-right">
                <input class="input" readonly v-if="system.displayUnit === 'btc'" :value="$options.filters.usd(btcToSats(invoice.amount))">
                <input class="input" readonly v-else :value="$options.filters.usd(invoice.amount)">
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
  },

  computed: {
    getUnit() {
      if(this.system.displayUnit === 'btc') {
        return 'BTC';
      } else if(this.system.displayUnit === 'sats') {
        return 'sats';
      }
    },
  },

  methods: {
    // Pasthrough to helper function so we can use it in the template
    btcToSats(value) {
      return btcToSats(value);
    },

    // add invoice
    async newInvoice() {
      let amount = this.invoice.amount;
      if(this.system.displayUnit === 'btc') {
        amount = btcToSats(amount);
      } else if(this.system.displayUnit === 'sats') {
        if(parseInt(amount) != parseFloat(amount) || amount < 0) {
          this.$toast.open({duration: 10000, message: "Sats amounts can't be negative or decimal numbers - positive whole numbers only.", position: 'is-top', type: 'is-danger'});
          return;
        }
      }

      EventBus.$emit('loading-start');
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
