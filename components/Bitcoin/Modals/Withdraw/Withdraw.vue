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
          <b-input v-model="txData.address" @input="estimateFees" type="text" required></b-input>
        </b-field>
        <br>
        <div class="withdrawal-amount">
          <h2>Amount to Withdraw</h2>
          <p class="desktop-only">{{balance.btc | inUnits | withSuffix}} available.</p>

          <a class="send-max button is-rounded" @click="sendMax" :class="{'is-active': sweep}">Send Max</a>

          <b-field label="btc" expanded>
            <b-input type="text" v-if="system.displayUnit === 'btc'" v-model="txData.amount" @input.native="sendAmount" class="btc-input"  :message="false" required></b-input>
            <b-input type="text" v-else v-model="txData.amount" @input.native="sendAmount" class="sats-input" required></b-input>
          </b-field>
          <b-field label="usd" expanded>
            <b-input type="text" v-if="system.displayUnit === 'btc'" :value="$options.filters.usd(btcToSats(txData.amount))" class="usd-input"></b-input>
            <b-input type="text" v-else :value="$options.filters.usd(txData.amount)" class="usd-input"></b-input>
          </b-field>

          <p v-if="fee[chosenFee].error === 'INSUFFICIENT_FUNDS'" class="help is-danger">
            This transaction is too large. Make sure have enough funds to cover the amount plus a withdrawal fee.
          </p>

          <p v-if="fee[chosenFee].error === 'OUTPUT_IS_DUST'" class="help is-danger">
            This transaction is too small and cannot be sent on-chain. Try increasing the amount to send or decrease the withdrawal fee.
          </p>

          <p v-if="fee[chosenFee].error === 'INVALID_ADDRESS'" class="help is-danger">
            The address you entered is invalid. Make sure you are sending to a mainnet Bitcoin address.
          </p>
        </div>

        <div class="withdrawal-fee">
          <h2>Withdrawal Fee</h2>

          <p>Set the on-chain fee you're willing to pay to withdraw funds.</p>

          <div class="fee-options">
            <div class="fee-option" :class="{active: chosenFee === 'fast'}" @click="setFee('fast')">
              <div class="fee-cost">Fast: {{fee.fast.total | usd}}</div>
              <div class="fee-time">~10 min</div>
            </div>

            <div class="fee-option" :class="{active: chosenFee === 'normal'}" @click="setFee('normal')">
              <div class="fee-cost">Normal: {{fee.normal.total | usd}}</div>
              <div class="fee-time">~60 min</div>
            </div>

            <div class="fee-option" :class="{active: chosenFee === 'slow'}" @click="setFee('slow')">
              <div class="fee-cost">Slow: {{fee.slow.total | usd}}</div>
              <div class="fee-time">~4 hours</div>
            </div>

            <div class="fee-option" :class="{active: chosenFee === 'cheapest'}" @click="setFee('cheapest')">
              <div class="fee-cost">Cheapest: {{fee.cheapest.total | usd}}</div>
              <div class="fee-time">~24 hours</div>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Cancel</a>
        <a class="button is-casa" type="button" @click="confirmWithdrawal()">Continue</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import API from '@/helpers/api';
import {satsToBtc, btcToSats} from '@/helpers/units';
import BitcoinData from '@/data/bitcoin';
import SystemData from '@/data/system';
import Confirm from '@/components/Bitcoin/Modals/Withdraw/Confirm';

export default {
  name: 'Withdraw',

  data() {
    return {
      feeTimeout: false,
      chosenFee: 'normal',

      fee: {
        fast: {
          total: '--',
          perByte: '--',
          error: false,
        },
        normal: {
          total: '--',
          perByte: '--',
          error: false,
        },
        slow: {
          total: '--',
          perByte: '--',
          error: false,
        },
        cheapest: {
          total: '--',
          perByte: '--',
          error: false,
        },
      },

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
      sweep: false,
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
    // Pasthrough to helper function so we can use it in the template
    btcToSats(value) {
      return btcToSats(value);
    },

    async estimateFees() {
      if(this.feeTimeout) {
        clearTimeout(this.feeTimeout);
      }

      this.feeTimeout = setTimeout(async () => {
        if(this.txData.address && (this.txData.amount || this.sweep)) {
          const payload = {
            address: this.txData.address,
            confTarget: 0,
          };

          if(this.sweep) {
            payload.sweep = true;
          } else {
            if(this.system.displayUnit === 'btc') {
              payload.amt = btcToSats(this.txData.amount);
            } else {
              payload.amt = this.txData.amount;
            }
          }

          const estimates = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/transaction/estimateFee`, payload);
          let error = false;

          if(estimates) {
            for(const [speed, estimate] of Object.entries(estimates)) {
              // If the API returned an error message
              if(estimate.code) {
                this.fee[speed].total = 'N/A';
                this.fee[speed].perByte = 'N/A';
                this.fee[speed].error = estimate.code;
              } else {
                this.fee[speed].total = estimate.feeSat;
                this.fee[speed].perByte = estimate.feerateSatPerByte;
                this.fee[speed].sweepAmount = estimate.sweepAmount;
                this.fee[speed].error = false;
              }
            }

            if(this.sweep) {
              this.estimateSweep();
            }
          }
        }
      }, 500);
    },

    estimateSweep() {
      if(this.balance.btc && this.fee[this.chosenFee].total) {
        if(this.system.displayUnit === 'btc') {
          this.txData.amount = satsToBtc(this.fee[this.chosenFee].sweepAmount);
        } else {
          this.txData.amount = this.fee[this.chosenFee].sweepAmount;
        }
      }
    },

    setFee(choice) {
      this.chosenFee = choice;

      if(this.sweep) {
        this.estimateSweep();
      }
    },

    sendAmount() {
      this.sweep = false;
      this.estimateFees();
    },

    sendMax() {
      this.sweep = true;
      this.txData.amount = null;
      this.estimateFees();
    },

    confirmWithdrawal() {

      const payload = {
        sweep: this.sweep,
        addr: this.txData.address,
        amt: parseInt(this.txData.amount),
        satPerByte: parseInt(this.fee[this.chosenFee].perByte)
      };

      if(this.system.displayUnit === 'btc') {
        payload.amt = btcToSats(this.txData.amount);
      } else if(this.system.displayUnit === 'sats') {
        if(parseInt(this.txData.amount) != parseFloat(this.txData.amount) || payload.amt < 0) {
          this.$toast.open({duration: 10000, message: "Sats amounts can't be negative or decimal numbers - positive whole numbers only.", position: 'is-top', type: 'is-danger'});
          return;
        }
      }

      if(!payload.addr || !payload.amt || !payload.satPerByte || this.error) {
        this.$toast.open({duration: 4000, message: "Unable to continue. Please check that everything has been entered correctly.", position: 'is-top', type: 'is-danger'});
        return;
      }

      this.$modal.open({component: Confirm, props: {payload, totalFee: this.fee[this.chosenFee].total}});
      this.$emit('close');
    },
  }
};
</script>
