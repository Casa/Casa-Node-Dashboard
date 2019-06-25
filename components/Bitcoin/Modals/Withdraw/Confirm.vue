<template>
  <form class="confirm-withdraw" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Review Bitcoin Withdrawal</span>
        </p>

        <UnitSwitch />
      </header>
      <section class="modal-card-body">
        <div class="recipient">
          <span>To</span> {{ payload.addr }}
        </div>

        <div class="amount">
          <h2>{{ payload.amt | inUnits | withSuffix }}</h2>
          <h3>{{ payload.amt | usd }}</h3>
        </div>

        <div class="columns">
          <div class="column">
            <h3>{{ totalFee | usd }}</h3>

            <label>
              Miner Fee

              <b-tooltip label="This is a network fee paid to BTC miners for confirming your transaction." type="is-dark" multilined>
                 <span class="icon is-small"><img src="~assets/info.svg" alt="info"></span>
              </b-tooltip>
            </label>
          </div>

          <div class="column">
            <h3>{{ newBalance | inUnits | withSuffix }}</h3>
            <label>New Balance</label>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Cancel</a>
        <a class="button is-casa" type="button" @click="sendTransaction()">Confirm Widthdrawal</a>
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
import UnitSwitch from '@/components/Settings/UnitSwitch';

export default {
  name: 'Withdraw',
  props: ['payload', 'totalFee'],

  data() {
    return {
      bitcoin: BitcoinData,
      system: SystemData,
    }
  },

  computed: {
    newBalance() {
      return this.bitcoin.wallet.confirmedBalance - (parseInt(this.payload.amt) + parseInt(this.totalFee));
    },
  },

  methods: {
    sendTransaction() {
      this.$emit('close');
      EventBus.$emit('withdraw', this.payload);
    }
  },

  components: {
    UnitSwitch
  },
};
</script>
