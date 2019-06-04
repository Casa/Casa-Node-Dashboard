<template>
  <form>
    <div class="modal-card autopilot-settings">
      <header class="modal-card-head">Autopilot Settings</header>
      <section class="modal-card-body">

        <!-- Channel Settings -->
        <div class="btc-calc">
          <b-field grouped>
            <b-field :message="'Value Per Channel'" expanded>
              <vue-numeric v-if="system.displayUnit === 'btc'" class="input" v-model="maxChanSize" :precision="3" name="maxChanSize" v-validate="'max_value:' + constants.MAX_CHANNEL_SIZE_BTC"></vue-numeric>
              <vue-numeric v-else class="input" v-model="maxChanSize" name="maxChanSize" v-validate="'max_value:' + constants.MAX_CHANNEL_SIZE_SATS"></vue-numeric>
            </b-field>
            <b-field expanded>
              <p class="operator">x</p>
            </b-field>
            <b-field :message="'Number of Channels'" expanded>
              <vue-numeric class="input" v-model="system.settings.lnd.maxChannels" :precision="0" name="maxChannels" v-validate="'max_value:' + constants.MAX_CHANNELS"></vue-numeric>
            </b-field>
            <b-field expanded>
              <p class="operator">=</p>
            </b-field>
            <b-field :message="getUnit + ' in Autopilot'" expanded>
              <b-input class="hide-input-box" :value="getTotal"></b-input>
            </b-field>
          </b-field>

          <b-field grouped class="bitcoin-balance">
            <b-field :message="getUnit + ' IN NODE WALLET'" expanded>
              <p class="bitcoin-in-wallet">{{bitcoin.wallet.totalBalance | inUnits}}</p>
            </b-field>
            <b-field expanded>
              <p>
                Total {{ getUnit }} in your Lightning Node's wallet.<br>
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
import CONSTANTS from '@/helpers/constants';
import SystemData from '@/data/system';
import {satsToBtc, btcToSats} from '@/helpers/units';

import BitcoinTransactions from '@/components/Bitcoin/Transactions';

export default {
  name: 'AutopilotSettings',

  data() {
    return {
      maxChanSize: 0,
      bitcoin: BitcoinData,
      system: SystemData,
      constants: CONSTANTS,
    }
  },

  computed: {
    getTotal() {
      let value = this.maxChanSize * this.system.settings.lnd.maxChannels;

      if(isNaN(value)) {
        value = 0;
      }

      return value;
    },

    getUnit() {
      if(this.system.displayUnit === 'btc') {
        return 'BTC';
      } else if(this.system.displayUnit === 'sats') {
        return 'sats';
      }
    },
  },

  created() {
    this.setMaxChanSize();
  },

  methods: {
    async showBitcoinTransactions() {
      this.$parent.close();
      await vueSlideoutPanelService.show({component: BitcoinTransactions, width: '100%'});
      this.$emit('closePanel');
    },

    getMaxChanSize() {
      if(this.system.displayUnit === 'btc') {
        return btcToSats(this.maxChanSize);
      } else if(this.system.displayUnit === 'sats') {
        return this.maxChanSize;
      }
    },

    setMaxChanSize() {
      if(this.system.settings.lnd.maxChanSize) {
        if(this.system.displayUnit === 'btc') {
          this.maxChanSize = satsToBtc(this.system.settings.lnd.maxChanSize);
        } else if(this.system.displayUnit === 'sats') {
          this.maxChanSize = this.system.settings.lnd.maxChanSize;
        }
      } else {
        this.maxChanSize = 0;
      }
    },

    saveChannelSettings() {
      this.$validator.validate().then(valid => {
        if(valid) {
          const data = {
            autopilot: this.system.settings.lnd.autopilot,
            maxChannels: parseInt(this.system.settings.lnd.maxChannels) || 0,
            maxChanSize: parseInt(this.getMaxChanSize()) || 0,
          };

          this.saveSettings(data, 'Autopilot settings saved');
        } else {
          // TODO: Make this error message more generic if we add any other fields to the index page?
          this.$toast.open({duration: CONSTANTS.TOAST_DURATION_LONG, type: 'is-danger', message: 'Unable to save settings. For your safety, the Casa Node will only allow ' + CONSTANTS.MAX_CHANNELS + ' channels at this time with a max channel size of ' + CONSTANTS.MAX_CHANNEL_SIZE_BTC + ' BTC'});
        }
      });
    },

    async saveSettings(data, message = 'Settings Saved') {
      EventBus.$emit('loading-start');

      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
        this.$toast.open({duration: CONSTANTS.TOAST_DURATION_SHORT, message: message});
      } catch (error) {
        let errorMessage = error.response.data || 'Unable to save settings';
        this.$toast.open({duration: CONSTANTS.TOAST_DURATION_LONG, message: errorMessage, type: 'is-danger'});
      } finally {
        EventBus.$emit('loading-stop');
        this.$emit('close');
      }
    }
  }
};
</script>
