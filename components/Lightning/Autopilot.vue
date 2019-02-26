<template>
  <section class="autopilot-settings">
    <div class="slideout-header channel-header">
      <a @click.prevent="closePanel">
        <span class="icon is-small">
          <font-awesome-icon :icon="['fas', 'chevron-left']"/>
        </span>

        <span>Back</span>
      </a>
    </div>

    <div class="app-slideout channel">
      <div class="toggle-switch">
        <div class="field light-grey">
          Autopilot
          <span v-if="settings.lnd.autopilot">On</span>
          <span v-else>Off</span>
        </div>
        <div class="field">
          <b-switch v-model="settings.lnd.autopilot" type="is-info" size="is-medium" @input="toggleAutopilot"></b-switch>
        </div>
      </div>

      <div class="app-title">
        <img src="~assets/lightning.png" alt="Lightning">
        <h2>
          Manage Autopilot
        </h2>
      </div>

      <p class="description">
        Autopilot tries its best to match your settings, but may not always open channels to the exact size you specify.
        Occasionally, your channels may be opened at lower amounts based on other nodes' availability.
      </p>

      <hr>

      <template v-if="settings.lnd.autopilot">
        <!-- Lightning Stats Section -->
        <div class="stats">
          <div class="stats-col">
            <h1>{{lightning.channels.open.length}} Channel<template v-if="lightning.channels.open.length != 1">s</template></h1>
            <h2>{{lightning.balance.confirmed | btc}} BTC in Channels</h2>
          </div>
          <div class="stats-col">
            <h1>{{lightning.channels.pending.length}} Pending</h1>
            <h2>{{lightning.balance.pending | btc}} BTC Pending</h2>
          </div>
          <div class="stats-col">
            <h1>{{lightning.quotient | btc}} BTC</h1>
            <h2>Avg. Value per Channel</h2>
          </div>
        </div>
        <hr>

        <div class="field toggle-settings menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Autopilot Settings
            </label>
            <p>Allocate BTC to your Autopilot channels.</p>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" @click="openSettings">
                <span>Configure</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>
      </template>

      <template v-if="channelList.length">
        <section class="transaction-settings">
          <div class="section-title">Autopilot Channels</div>

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
                    <h2>Autopilot Channel</h2>
                    <h3>
                      <a href="#">{{ch.remotePubkey}}</a>
                    </h3>
                  </div>
                  <div class="tx-col-3">
                    <!-- TODO: handle active color with css-->
                    <h2 class="channel-status " v-bind:style="{color: ch.activeColor}">{{ch.status}}</h2>
                    <h3 class="channel-balance" v-if="ch.timeRemainingText">{{ch.timeRemainingText}}</h3>
                    <h3 class="channel-balance" v-if="!ch.timeRemainingText">{{ch.localBalance | btc}} BTC</h3>
                  </div>
                </div>
                <hr>
              </li>
            </ul>
          </div>
        </section>
      </template> <!-- End of autopilot data -->

      <template v-else>
        <div class="inactive-wrap">
          <div class="inactive">
            <span class="icon is-large">
              <img src="~assets/channel.svg" alt="channel">
            </span>

            <h2>Autopilot is currently inactive.</h2>
          </div>
        </div>
      </template>

      </div>

  </section>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import LightningData from '@/data/lightning';

import ManageChannel from '@/components/Lightning/Modals/Channels/ManageChannel';
import OpenChannel from '@/components/Lightning/Modals/Channels/OpenChannel';
import AutopilotSettings from '@/components/Lightning/Modals/AutopilotSettings';

export default {
  name: 'Autopilot',
  props: ['settings'],

  async created() {
    EventBus.$emit('load-lightning-stats');
    this.setChannelData();
  },

  mounted() {
    var vm = this; // avoid scope problems
    EventBus.$on('cancel', () => vm.closePanel());
    EventBus.$on('openChannel', (data) => vm.channelPending(data));
    EventBus.$on('closeChannel', (data) => vm.channelClosing(data));
  },

  data() {
    return {
      lightning: LightningData,
      channelList: [],
    }
  },

  destroyed() {
    EventBus.$emit('stop-lightning-stats');
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
      // TODO: move these transformation inside ManageChannel.vue.
      data.localBalanceSats = (data.localBalance / 100000000).toFixed(4);
      data.remoteBalanceSats = (data.remoteBalance / 100000000).toFixed(4);

      // Number of blocks * average block time in minutes / minutes per hour
      if (data.csvDelay) {
        data.csvDelayText = this.blocksToTime(data.csvDelay);
      }

      // Denote that this is an autopilot channel
      data.autopilot = true;
      data.name = 'Autopilot';
      data.purpose = 'Autopilot';

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
    openSettings() {
      this.$modal.open({
        parent: this,
        component: AutopilotSettings,
        hasModalCard: true,
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

      // The determines the order
      this.channelList = [];

      for (const channel of channels) {

        // We should ignore channels not created by autopilot
        if (channel.managed) {
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
    },

    toggleAutopilot() {
      const data = {autopilot: this.settings.lnd.autopilot};
      const message = this.settings.lnd.autopilot ? 'Autopilot enabled' : 'Autopilot disabled';

      this.saveSettings(data, message);
    },

    async saveSettings(data, message = 'Settings Saved') {
      EventBus.$emit('loading-start');

      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
        this.$toast.open({duration: 3000, message: message});
      } catch (error) {
        console.error(error);
      } finally {
        EventBus.$emit('loading-stop');
      }
    },
  },
};
</script>
