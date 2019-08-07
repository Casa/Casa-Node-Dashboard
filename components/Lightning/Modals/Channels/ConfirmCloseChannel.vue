<template>
  <form class="withdraw channel-manager" action="">
    <div class="modal-card" style="width: auto">

      <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Confirm Channel Close</span>
        </p>
      </header>

      <section class="modal-card-body">
        <span class="info-light">The <strong>{{chData.name}}</strong> channel will be closed.</span>

        <div class="request-amount" v-if="system.displayUnit === 'btc' && chData.localBalanceBtc">
          <div class="field is-grouped">
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" readonly v-model="chData.localBalanceBtc">
              </p>
              <p class="help">BTC ON YOUR SIDE</p>
            </div>
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" readonly v-model="chData.remoteBalanceBtc">
              </p>
              <p class="help">BTC ON OTHER SIDE OF CHANNEL</p>
            </div>
          </div>
        </div>

        <div class="request-amount" v-else-if="system.displayUnit === 'sats' && chData.localBalance">
          <div class="field is-grouped">
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" readonly v-model="chData.localBalance">
              </p>
              <p class="help">SATS ON YOUR SIDE</p>
            </div>
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" readonly v-model="chData.remoteBalance">
              </p>
              <p class="help">SATS ON OTHER SIDE OF CHANNEL</p>
            </div>
          </div>
        </div>
        <br>

        <div>
          <span class="info-light">
            There is a waiting period of up to 24 hours while this channel is counting down if the other party is not online. During this time, the non-closing party can dispute the record sent to the chain and seize the channel funds if this claim is fraudulent.
          </span>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Not Now</a>
        <a class="button is-casa" type="button" @click="confirmCloseChannel()">Yes, Close</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import SystemData from '@/data/system';

export default {
  name: 'ConfirmCloseChannel',

  props: {
    chData: this.chData,
  },

  data() {
    return {
      isLoading: false,
      system: SystemData,
    };
  },

  async created() {
    // Display to user that this is an autopilot channel
    if(!this.chData.managed && !this.chData.name) {
      this.chData.name = 'Autopilot';
    }
  },

  methods: {
    stop() {
      this.isLoading = false;
    },

    async confirmCloseChannel() {
      try {
        this.isLoading = true;
        const payload = {
          data: {
            channelPoint: this.chData.channelPoint,
            // If the channel is active, we do not need to force close it.
            force: !this.chData.active
          }
        };

        const response = (await this.$axios.delete(`${this.$env.API_LND}/v1/lnd/channel/close`, payload)).data;

        this.$emit('close');
        this.$parent.close();
        EventBus.$emit('closeChannel');
      } catch (err) {
        this.$toast.open({duration: 3000, message:`Could not close channel`, position: 'is-top', type: 'is-danger'});
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
