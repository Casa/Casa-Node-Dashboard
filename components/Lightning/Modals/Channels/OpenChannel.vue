<template>
  <form class="withdraw channel-manager" @submit.prevent="validate()">
    <div class="modal-card" style="width: auto">

      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Open Channel</span>
        </p>
      </header>

      <section class="modal-card-body">

        <!-- Peer Field  -->
        <h2>Peer Name</h2>
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input type="text" class="input" :class="{ 'is-danger': errors.has('name')}" name="name" v-model="name" v-validate="'required'" placeholder="My Personal Node">
          </p>
        </div>

        <!-- Channel Purpose -->
        <h2>Channel Purpose</h2>
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input type="text" class="input" :class="{ 'is-danger': errors.has('purpose')}" name="purpose" v-model="purpose" v-validate="'required'" placeholder="Funding for Lunches">
          </p>
        </div>

        <!-- Channel Purpose -->
        <div class="field is-grouped no-margin">
          <div class="field is-expanded no-margin">
            <h2>Connection Details</h2>
          </div>
          <div class="field is-expanded no-margin">
            <a @click="toggleManualEntry()" v-if="!manualEntry">Switch to manual entry</a>
            <a @click="toggleManualEntry()" v-if="manualEntry">Switch to connection code</a>
          </div>
        </div>

        <div class="field is-grouped" v-if="!manualEntry">
          <p class="control is-expanded">
            <input type="text" class="input" :class="{ 'is-danger': errors.has('connectionCode')}" name="connectionCode" v-model="connectionCode" v-validate="'required'" placeholder="Peer connection code">
          </p>
        </div>

        <div class="field is-grouped" v-if="manualEntry">
          <p class="control is-expanded">
            <input type="text" class="input" :class="{ 'is-danger': errors.has('pubKey')}" name="pubKey" v-model="pubKey" v-validate="'required'" placeholder="Public Key">
          </p>
        </div>

        <!-- Host Input Fields -->
        <div class="request-amount" v-if="manualEntry">
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
        <div class="request-amount">
          <div class="field is-grouped">
            <div class="field is-expanded">
              <p class="control is-expanded">
                <input type="text" class="input" :class="{ 'is-danger': errors.has('fundingAmount')}" name="fundingAmount" v-model="fundingAmount" v-validate="'required|max_value:0.16'" placeholder="Funding amount (max 0.16 BTC)">
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <button type="submit" class="button is-casa">Open Channel</button>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {
  name: 'OpenChannel',
  data() {
    return {
      manualEntry:false,
      connectionCode: null,
      pubKey: null,
      ip: null,
      port: null,
      fundingAmount: null,
      name: null,
      purpose: null,
    };
  },

  mounted() {
    var vm = this; // avoid scope problems

    // Close this window on successful channel opening
    EventBus.$on('openChannel', () => {this.$emit('close');});
  },

  async created() {

  },

  methods: {
    toggleManualEntry() {
      this.manualEntry = !this.manualEntry;
    },

    validate() {
      // Trigger validation to make sure all required fields are set
      this.$validator.validate().then(valid => {
        if(valid) {
          this.open();
        }
      });
    },

    async open() {
      EventBus.$emit('loading-start');

      var data = {
        amt: Math.floor(this.fundingAmount * 100000000), // convert from btc to sats
        name: this.name,
        purpose: this.purpose
      };

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

      try {
        await this.$axios.post(`${this.$env.API_LND}/v1/lnd/channel/open`, data);

        this.$emit('close');
        EventBus.$emit('openChannel');
      } catch(error) {
        this.$toast.open({duration: 4000, message: error.response.data, position: 'is-top', type: 'is-danger'});
      }

      EventBus.$emit('loading-stop');
    }
  }
};
</script>
