<template>
  <form class="withdraw channel-manager" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Confirm Payment</span>
        </p>
      </header>
      <section class="modal-card-body">
        <!-- Payment Request Info -->
        <div class="equalColWrap eqFlexWrap">
          <template v-if="payment.numSatoshis < 1">
            <div class="withdrawal-amount request-amount">
              <h2>Amount to Send</h2>
              <div class="field is-grouped">
                <div class="field is-expanded">
                  <p class="control is-expanded has-icons-right">
                    <input class="input" v-model="customAmount">
                    <span class="icon is-small is-right"><i><span v-if="system.displayUnit === 'btc'">BTC</span><span v-else>sats</span></i></span>
                  </p>
                </div>
                <div class="field is-expanded">
                  <p class="control is-expanded has-icons-right">
                    <input class="input" :value="getDollarValue">
                    <span class="icon is-small is-right"><i>USD</i></span>
                  </p>
                </div>
              </div>
            </div>
          </template>

          <div class="equalFlexCol eqFlexField">
            <span class="info-label">Payment Code</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{payment.paymentRequest}}</span>
          </div>

          <template v-if="payment.numSatoshis > 0">
            <div class="equalFlexCol eqFlexField">
              <span class="info-label">Sending</span>
            </div>
            <div class="equalFlexCol eqFlexField">
              <span class="info-light">{{payment.numSatoshis | inUnits | withSuffix}}</span>
            </div>
          </template>

          <template v-else>
            <div class="equalFlexCol eqFlexField">
              <span class="info-label">Max Potential Payment</span>
            </div>
            <div class="equalFlexCol eqFlexField">
              <span class="info-light">{{lightning.maxPaymentOut | inUnits | withSuffix}}</span>
            </div>
          </template>

          <div class="equalFlexCol eqFlexField">
            <span class="info-label">New Lightning Balance</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{getBalance | inUnits | withSuffix}}</span>
          </div>

        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Cancel</a>
        <a class="button is-casa" type="button" @click="confirm()">Confirm</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import LightningData from '@/data/lightning';
import SystemData from '@/data/system';
import {satsToBtc, btcToSats} from '@/helpers/units';

export default {
  name: 'ConfirmInvoice',

  props: {
    invoice: this.invoice
  },

  computed: {
    getDollarValue: function() {
      if(this.system.displayUnit === 'btc') {
        return (this.customAmount * this.bitcoin.price).toFixed(2);
      } else {
        return (satsToBtc(this.customAmount) * this.bitcoin.price).toFixed(2);
      }
    },

    getBalance: function() {
      if(parseInt(this.payment.numSatoshis) > 0) {
        return parseInt(this.lightning.balance.confirmed) - parseInt(this.payment.numSatoshis);
      } else {
        if(this.system.displayUnit === 'btc') {
          return parseInt(this.lightning.balance.confirmed) - btcToSats(this.customAmount);
        } else {
          return parseInt(this.lightning.balance.confirmed) - parseInt(this.customAmount);
        }
      }
    },
  },

  data() {
    return {
      bitcoin: BitcoinData,
      lightning: LightningData,
      system: SystemData,
      payment: {},
      newBalance: 0,
      customAmount: 0,
    };
  },

  async created() {
    try {
      const payment = await this.$axios.get(`${this.$env.API_LND}/v1/lnd/lightning/invoice?paymentRequest=${this.invoice}`);
      this.payment = payment.data;
    } catch(error) {
      this.$toast.open({duration: 4000, message: error.response.data, position: 'is-top',type: 'is-danger'})
      this.$emit('close');
    }
  },

  methods: {
    async confirm() {
      var payload = {paymentRequest: this.invoice}

      if(this.customAmount > 0) {
        if(this.system.displayUnit === 'btc') {
          payload.amt = btcToSats(this.customAmount);
        } else if(this.system.displayUnit === 'sats') {
          if(parseInt(this.customAmount) != parseFloat(this.customAmount)) {
            this.$toast.open({duration: 10000, message: "Sats amounts can't be negative or decimal numbers - positive whole numbers only.", position: 'is-top', type: 'is-danger'});
            return;
          }

          payload.amt = parseInt(this.customAmount);
        }
      }

      EventBus.$emit('loading-start');

      try {
        var pay = await this.$axios.post(`${this.$env.API_LND}/v1/lnd/lightning/payInvoice`, payload);
        EventBus.$emit('confirmedPayment', pay.data);
      } catch(error) {
        this.$toast.open({duration: 4000, message: error.response.data, position: 'is-top',type: 'is-danger'})
      }

      this.$emit('close');
      EventBus.$emit('loading-stop');

      // Reload transaction info after sending
      EventBus.$emit('load-lightning-stats');
      EventBus.$emit('load-lightning-transactions');
    }
  }
};
</script>
