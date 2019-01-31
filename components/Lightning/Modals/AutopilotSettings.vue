<template>
  <form>
    <div class="modal-card autopilot-settings">
      <header class="modal-card-head">Autopilot Settings</header>
      <section class="modal-card-body">

        <!-- Channel Settings -->
        <div class="btc-calc">
          <b-field grouped>
            <b-field :message="['Value Per Channel']" expanded>
              <vue-numeric class="input" v-model="maxChanSize" :precision="3"></vue-numeric>
            </b-field>
            <b-field expanded>
              <p class="operator">x</p>
            </b-field>
            <b-field :message="['Number of Channels']" expanded>
              <vue-numeric class="input" v-model="system.settings.lnd.maxChannels" :precision="0"></vue-numeric>
            </b-field>
            <b-field expanded>
              <p class="operator">=</p>
            </b-field>
            <b-field :message="['BTC in Autopilot']" expanded>
              <b-input class="hide-input-box" :value="getTotal"></b-input>
            </b-field>
          </b-field>

          <b-field grouped class="bitcoin-balance">
            <b-field :message="['BTC IN NODE WALLET']" expanded>
              <p class="bitcoin-in-wallet">{{bitcoin.wallet.totalBalance | btc}}</p>
            </b-field>
            <b-field expanded>
              <p>
                Total BTC in your Lightning Node's wallet.<br>
                <a class="link" @click="showBitcoinTransactions">Add or remove funds</a>
              </p>
            </b-field>
          </b-field>
        </div>

      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="saveChannelSettings()">Save</a>
      </footer>
    </div>
  </form>
</template>

<script>
if (process.browser) {
  var {vueSlideoutPanelService} = require('vue2-slideout-panel');
}

import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import SystemData from '@/data/system';

import BitcoinTransactions from '@/components/Bitcoin/Transactions';

export default {
  name: 'AutopilotSettings',

  data() {
    return {
      maxChanSize: 0,
      bitcoin: BitcoinData,
      system: SystemData,
    }
  },

  computed: {
    getTotal() {
      var btc = (this.maxChanSize * this.system.settings.lnd.maxChannels).toFixed(3);
      if(isNaN(btc)) {
        btc = 0;
      }
      return btc;
    }
  },

  created() {
    this.maxChanSize = this.system.settings.lnd.maxChanSize / 100000000;
  },

  methods: {
    async showBitcoinTransactions() {
      await vueSlideoutPanelService.show({component: BitcoinTransactions, width: '860px'});
      this.$emit('closePanel');
    },

    saveChannelSettings() {
      const data = {
        autopilot: this.system.settings.lnd.autopilot,
        maxChannels: this.system.settings.lnd.maxChannels,
        maxChanSize: this.maxChanSize * 100000000, // convert btc to sats
      };

      this.saveSettings(data, 'Autopilot settings saved');
    },

    async saveSettings(data, message = 'Settings Saved') {
      EventBus.$emit('loading-start');

      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
        this.$toast.open({duration: 3000, message: message});
      } catch (err) {
        this.showErrorMessage(err);
      } finally {
        EventBus.$emit('loading-stop');
        this.$emit('close');
      }
    }
  }
};
</script>
