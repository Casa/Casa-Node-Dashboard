<template>
  <section>
    <div class="slideout-header channel-header">
      <a @click.prevent="closePanel">
        <span class="icon is-small">
          <font-awesome-icon :icon="['fas', 'chevron-left']"/>
        </span>

        <span>Back</span>
      </a>
    </div>

    <div class="app-slideout channel">

      <div class="app-title">
        <img src="~assets/lightning.png" alt="Lightning">
        <h2> Manage Custom Channels</h2>
      </div>
      <hr>
      <section class="transaction-settings">
        <!-- BTC Wallet -->
        <a class="button is-fullwidth" @click="openChannel()">
          <span class="icon">
            <img src="~assets/channel.svg" alt="channel">
          </span>
          <span>Open New Custom Channel</span>
        </a>
        <hr>

        <!-- Transactions -->
        <div class="tx-list">
          <ul class="pending-tx">
            <li class="tx-item" v-for="(ch, index) in channelList" :key="index">
              <div class="tx-row" @click="manageChannel(ch)">
                <div class="tx-col-1">
                  <div class="channel-icon">
                    <img src="~assets/channel.svg" alt="channel">
                  </div>
                </div>
                <div class="tx-col-2">
                  <h2>{{ch.name}}</h2>
                  <h3>
                    <a href="#">{{ch.purpose}}</a>
                  </h3>
                </div>
                <div class="tx-col-3">
                  <!-- TODO: handle active color with css-->
                  <h2 class="channel-status " v-bind:style="{color: ch.activeColor}">{{ch.status}}</h2>
                  <h3 class="channel-balance" v-if="ch.timeRemainingText">{{ch.timeRemainingText}}</h3>
                  <h3 class="channel-balance" v-if="!ch.timeRemainingText">{{ch.localBalance | inUnits | withSuffix}}</h3>
                </div>
              </div>
              <hr>
            </li>
          </ul>
        </div>
        <p class="autopilot-link">This doesn't include your Autopilot channels. You can
          <a @click.prevent="closePanel">edit them in your Lightning Node's primary settings.</a>
        </p>
      </section>

    </div>

  </section>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import ManageChannel from '@/components/Lightning/Modals/Channels/ManageChannel';
import OpenChannel from '@/components/Lightning/Modals/Channels/OpenChannel';
import {satsToBtc, btcToSats} from '@/helpers/units';

export default {
  name: 'Channels',

  mounted() {
    var vm = this; // avoid scope problems
    EventBus.$on('cancel', () => vm.closePanel());
    EventBus.$on('openChannel', (data) => vm.channelPending(data));
    EventBus.$on('closeChannel', (data) => vm.channelClosing(data));
  },

  data() {
    return {
      canSync: true,
      channelList: [],
    }
  },

  destroyed() {
    EventBus.$off('cancel');
    EventBus.$off('openChannel');
    EventBus.$off('closeChannel');
  },

  methods: {
    closePanel() {
      this.$emit('closePanel');
      this.$destroy();
    },
    manageChannel(data) {
      data.localBalanceBtc = satsToBtc(data.localBalance);
      data.remoteBalanceBtc = satsToBtc(data.remoteBalance);

      // Number of blocks * average block time in minutes / minutes per hour
      if (data.csvDelay) {
        data.csvDelayText = this.blocksToTime(data.csvDelay);
      }

      // Denote that this is a custom channel
      data.autopilot = false;

      this.$modal.open({
        parent: this,
        props: {chData: data},
        component: ManageChannel,
        hasModalCard: true
      })
    },
    blocksToTime(blocks) {
      // TODO: find a library for this
      const minutes = (blocks * 10);

      if (minutes <= 50) {
        return '~' + minutes + ' minutes';
      }

      const hours = minutes / 60;

      if (hours === 1) {
        return '~1 hour';
      }
      return '~' + hours.toFixed(0) + ' hours';
    },
    openChannel() {
      this.$modal.open({
        parent: this,
        component: OpenChannel,
        hasModalCard: true
      })
    },
    channelPending() {
      this.$toast.open({duration: 3000, message:`New Channel Pending`});
      this.setChannelData();
    },
    channelClosing() {
      this.$toast.open({duration: 3000, message:`New Channel Closing`});
      this.setChannelData();
    },
    async setChannelData() {
      const channels = (await this.$axios.get(`${this.$env.API_LND}/v1/lnd/channel`)).data;

      // The determins the order
      this.channelList = [];

      for (const channel of channels) {

        // We should ignore channels created by autopilot
        if (!channel.managed) {
          continue;
        }

        if (channel.type === 'OPEN') {
          if (channel.active) {

            channel.activeColor = '#2dcccd';
            channel.status = 'Online';
          } else {

            channel.activeColor = '#f0649e'; //  medium-pink
            channel.status = 'Offline';
          }
          // Closing channels that are unconfirmed
        } else if (channel.type === 'WAITING_CLOSING_CHANNEL') {

          channel.activeColor = '#f7bd00'; //  golden
          channel.status = 'Closing';

        // Non cooperative closes that have at least one confirmation
        } else if (channel.type === 'FORCE_CLOSING_CHANNEL') {

          channel.activeColor = '#f7bd00'; //  golden
          channel.status = 'Closing';

        // Cooperative closes that have at least one confirmation
        } else if (channel.type === 'PENDING_CLOSING_CHANNEL') {

          channel.activeColor = '#f7bd00'; //  golden
          channel.status = 'Closing';

        // Pending open channels could be confirmed or unconfirmed
        } else if (channel.type === 'PENDING_OPEN_CHANNEL') {

          channel.activeColor = '#f7bd00'; //  golden
          channel.status = 'Opening';
        }

        if (channel.remainingConfirmations) {
          channel.timeRemainingText = this.blocksToTime(channel.remainingConfirmations);
        }

        this.channelList.push(channel);
      }
    }
  },

  async created() {
    this.setChannelData();
  }

};
</script>
