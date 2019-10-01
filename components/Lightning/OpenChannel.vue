<template>
  <section class="lightning-menu">
    <div class="slideout-header">
      <a @click.prevent="closePanel">
        <span class="icon is-small">
          <font-awesome-icon :icon="['fas', 'chevron-left']"/>
        </span>

        <span>Back</span>
      </a>

      <UnitSwitch />
    </div>

    <div class="app-slideout lnd channel custom open">
      <div class="app-title">
        <img src="~assets/lightning.png" alt="">
        <h2>Open Custom Channel</h2>
      </div>

      <section>
        <form @submit.prevent="validate()">
          <!-- Peer Field  -->
          <h2>Peer Name</h2>
          <div class="field is-grouped">
            <p class="control is-expanded">
              <input type="text" class="input" :class="{ 'is-danger': errors.has('peerName')}" name="peerName" v-model="name" v-validate="'required|max:100'" placeholder="My Personal Node">
            </p>
          </div>

          <!-- Channel Purpose -->
          <h2>Channel Purpose</h2>
          <div class="field is-grouped">
            <p class="control is-expanded">
              <input type="text" class="input" :class="{ 'is-danger': errors.has('channelPurpose')}" name="channelPurpose" v-model="purpose" v-validate="'required|max:100'" placeholder="Funding for Lunches">
            </p>
          </div>

          <!-- Channel Purpose -->
          <div class="field is-grouped no-margin">
            <div class="field is-expanded no-margin">
              <h2>Connection Details</h2>
            </div>
            <div class="field is-expanded no-margin">
              <a @click="toggleManualEntry()" class="blue is-pulled-right">
                <template v-if="manualEntry">Switch to connection code</template>
                <template v-else>Switch to manual entry</template>
              </a>
            </div>
          </div>

          <div class="field is-grouped" v-if="!manualEntry">
            <p class="control is-expanded">
              <input type="text" class="input" :class="{ 'is-danger': errors.has('connectionCode')}" name="connectionCode" v-model="connectionCode" v-validate="{required: true, regex: /^.*@.*$/}" placeholder="Peer connection code">
            </p>
          </div>

          <div class="field is-grouped" v-if="manualEntry">
            <p class="control is-expanded">
              <input type="text" class="input" :class="{ 'is-danger': errors.has('pubKey')}" name="pubKey" v-model="pubKey" v-validate="'required'" placeholder="Public Key">
            </p>
          </div>

          <!-- Host Input Fields -->
          <div v-if="manualEntry">
            <div class="field is-grouped">
              <div class="field is-expanded">
                <p class="control is-expanded">
                  <input type="text" class="input" :class="{ 'is-danger': errors.has('ip')}" name="ip" v-model="ip" v-validate="'required'" placeholder="IP Address">
                </p>
              </div>
              <div class="field is-expanded">
                <p class="control is-expanded">
                  <input type="text" class="input" :class="{ 'is-danger': errors.has('port')}" name="port" v-model="port" v-validate="'integer'" placeholder="Port">
                </p>
              </div>
            </div>
          </div>

          <!-- Amount Fields -->
          <h2>Channel Funding</h2>
          <div class="field">
            <div class="control is-half btc-input" v-if="system.displayUnit === 'btc'">
              <input
                type="text"
                class="input"
                :class="{ 'is-danger': errors.has('fundingAmount')}"
                name="fundingAmount"
                v-model="fundingAmount"
                @input="estimateFees"
                v-validate="`required|min_value:0.0002|max_value:${maxBtc}`"
                :placeholder="`Funding amount (max ${maxBtc} BTC)`" />
            </div>

            <div class="control is-half sats-input" v-else>
              <input
                type="text"
                class="input"
                :class="{ 'is-danger': errors.has('fundingAmount')}"
                name="fundingAmount"
                v-model="fundingAmount"
                @input="estimateFees"
                v-validate="`required|integer|min_value:20000|max_value:${maxSats}`"
                :placeholder="`Funding amount (max ${maxSats} sats)`" />
            </div>

            <p v-if="fee[chosenFee].error === 'INSUFFICIENT_FUNDS'" class="help is-danger">
              You don't have enough funds to open a channel of this size. Make sure you have enough funds to cover the channel size plus an on-chain fee.
            </p>

            <p v-if="fee[chosenFee].error === 'FEE_RATE_TOO_LOW'" class="help is-danger">
              The fee to open this channel is too small and cannot currently be sent on-chain. Try increasing the fee or the size of the channel.
            </p>

            <p v-if="fee[chosenFee].error === 'OUTPUT_IS_DUST'" class="help is-danger">
              This channel is too small. Try increasing the funding amount or decrease the on-chain fee.
            </p>
          </div>

          <div class="withdrawal-fee">
            <h2>Channel Opening Speed</h2>

            <p>Set the on-chain fee you're willing to pay to open this channel.</p>

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

          <footer class="modal-card-foot">
            <button type="submit" class="button is-casa is-pulled-right">Open Channel</button>
          </footer>
        </form>
      </section>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import SystemData from '@/data/system';
import UnitSwitch from '@/components/Settings/UnitSwitch';
import API from '@/helpers/api';
import CONSTANTS from '@/helpers/constants';
import {satsToBtc, btcToSats} from '@/helpers/units';

export default {
  name: 'OpenChannel',
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

      manualEntry:false,
      connectionCode: null,
      pubKey: null,
      ip: null,
      port: null,
      fundingAmount: null,
      name: null,
      purpose: null,
      system: SystemData,
      bitcoin: BitcoinData,
    };
  },

  mounted() {
    var vm = this; // avoid scope problems

    // Close this window on successful channel opening
    EventBus.$on('openChannel', () => {this.$emit('close');});
  },

  computed: {
    maxBtc() {
      if(this.bitcoin.wallet.totalBalance < CONSTANTS.MAX_CHANNEL_SIZE_SATS) {
        return satsToBtc(this.bitcoin.wallet.totalBalance);
      } else {
        return CONSTANTS.MAX_CHANNEL_SIZE_BTC;
      }
    },

    maxSats() {
      if(this.bitcoin.wallet.totalBalance < CONSTANTS.MAX_CHANNEL_SIZE_SATS) {
        return this.bitcoin.wallet.totalBalance;
      } else {
        return CONSTANTS.MAX_CHANNEL_SIZE_SATS;
      }
    }
  },

  methods: {
    closePanel() {
      this.$emit('closePanel');
      this.$destroy();
    },

    toggleManualEntry() {
      this.manualEntry = !this.manualEntry;
    },

    setFee(choice) {
      this.chosenFee = choice;
    },

    async estimateFees() {
      if(this.feeTimeout) {
        clearTimeout(this.feeTimeout);
      }

      this.feeTimeout = setTimeout(async () => {
        if(this.fundingAmount) {
          const payload = {
            confTarget: 0,
            amt: this.fundingAmount,
          };

          if(this.system.displayUnit === 'btc') {
            payload.amt = btcToSats(this.fundingAmount);
          }

          const estimates = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/channel/estimateFee`, payload);
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
                this.fee[speed].error = false;
              }
            }
          }
        }
      }, 500);
    },

    validate() {
      // Remove any previously set errors
      this.errors.clear();

      // Trigger validation to make sure all required fields are set
      this.$validator.validate().then(valid => {
        if(valid) {
          this.open();
        } else {
          if(this.errors.items) {
            this.errors.items.forEach((error) => {
              if(error.msg) {
                this.$toast.open({duration: 3000, type: 'is-danger', message: error.msg});
              }
            });
          }
        }
      });
    },

    async open() {
      EventBus.$emit('loading-start');

      var data = {
        amt: this.fundingAmount,
        name: this.name,
        purpose: this.purpose,
        satPerByte: parseInt(this.fee[this.chosenFee].perByte),
      };

      if(this.system.displayUnit === 'btc') {
        data.amt = btcToSats(data.amt);
      }

      if (this.manualEntry) {
        data.pubKey = this.pubKey;
        data.ip = this.ip;
        data.port = this.port;
      } else {
        try {
          // Example connection code s
          // 03c856d2dbec7454c48f311031f06bb99e3ca1ab15a9b9b35de14e139aa663b463@testnet-lnd.htlc.me
          // 03c856d2dbec7454c48f311031f06bb99e3ca1ab15a9b9b35de14e139aa663b463@34.201.74.232:9375
          const parts = this.connectionCode.split('@');
          data.pubKey = parts[0];

          // The last semi is the deliminator between the IP address and the port number. This will suppose IPv6 and
          // IPv4.
          const lastSemi = parts[1].lastIndexOf(':');

          // The port was not specified. The backend will determine the port to use.
          if (lastSemi === -1) {
            data.ip = parts[1];
          } else {
            data.ip = parts[1].substr(0, lastSemi);
            data.port = parts[1].substr(lastSemi + 1, parts[1].length - lastSemi - 1);
          }
        } catch(error) {
          this.$toast.open({duration: 4000, message: 'Unable to parse connection code', position: 'is-top', type: 'is-danger'});
          EventBus.$emit('loading-stop');
          return;
        }
      }

      if(data.ip.match(/\.onion$/) && !this.system.settings.bitcoind.bitcoindTor && !this.system.settings.lnd.lndTor) {
        this.$toast.open({duration: 10000, message: "You can't connect to a Tor node unless you are running Tor yourself. You can enable Tor from the Connections menu on your dashboard.", position: 'is-top', type: 'is-danger'});
        EventBus.$emit('loading-stop');
        return;
      }

      try {
        await this.$axios.post(`${this.$env.API_LND}/v1/lnd/channel/open`, data);
        EventBus.$emit('openChannel');
        this.closePanel();
      } catch(error) {
        this.$toast.open({duration: 4000, message: error.response.data, position: 'is-top', type: 'is-danger'});
      }

      EventBus.$emit('loading-stop');
    }
  },

  components: {
    UnitSwitch
  },
};
</script>
