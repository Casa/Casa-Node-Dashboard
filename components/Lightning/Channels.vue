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

    <div class="app-slideout lnd channel custom">
      <div class="app-title">
        <img src="~assets/lightning.png" alt="">
        <h2> Manage Custom Channels</h2>

        <a class="button is-casa desktop-only is-padded" @click="openChannel()">+ New Channel</a>
      </div>

      <a class="button is-casa mobile-only is-padded" @click="openChannel()">+ New Channel</a>

      <section>
        <div class="filter-buttons">
          <a class="button is-rounded" :class="{'is-active': display === 'all'}" @click="displayChannels('all')">All</a>
          <a class="button is-rounded" :class="{'is-active': display === 'inbound'}" @click="displayChannels('inbound')">Inbound</a>
          <a class="button is-rounded" :class="{'is-active': display === 'outbound'}" @click="displayChannels('outbound')">Outbound</a>
        </div>

        <hr>

        <!-- Channels -->
        <ul>
          <li class="tx-item" v-for="(channel, index) in displayedChannels" :key="index">
            <div class="tx-row" @click="manageChannel(channel)">
              <div class="tx-col-2">
                <h2>
                  {{channel.name}}

                  <a class="button is-rounded" v-if="channel.initiator">Outbound</a>
                  <a class="button is-rounded" v-else>Inbound</a>

                </h2>
                <h3>
                  <a href="#">{{channel.purpose}}</a>
                </h3>
              </div>
              <div class="tx-col-3">
                <!-- TODO: handle active color with css-->
                <h2 class="channel-status " v-bind:style="{color: channel.activeColor}">{{channel.status}}</h2>
                <h3 class="channel-balance" v-if="channel.timeRemainingText">{{channel.timeRemainingText}}</h3>

                <template v-else>
                  <div class="channel-balance">
                    <strong>Send</strong> <span>{{channel.localBalance | inUnits | withSuffix}}</span>
                  </div>

                  <div class="channel-balance">
                    <strong>Receive</strong> <span>{{channel.remoteBalance | inUnits | withSuffix}}</span>
                  </div>
                </template>
              </div>
            </div>
            <hr>
          </li>
        </ul>

        <p class="autopilot-link">This doesn't include your Autopilot channels. You can
          <a @click.prevent="closePanel">edit them in your Lightning Node's primary settings.</a>
        </p>
      </section>

    </div>

  </section>
</template>

<script>
if (process.browser) {
  var {vueSlideoutPanelService} = require('vue2-slideout-panel');
}

import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import ManageChannel from '@/components/Lightning/Modals/Channels/ManageChannel';
import OpenChannel from '@/components/Lightning/OpenChannel';
import UnitSwitch from '@/components/Settings/UnitSwitch';
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
      display: 'all',
      channels: [],
      displayedChannels: [],
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

    async openChannel() {
      await vueSlideoutPanelService.show({
        component: OpenChannel,
        width: '100%',
        cssClass: 'casa-sld',
        props: {data: {panel: 'open'}}
      });
    },

    channelPending() {
      this.$toast.open({duration: 3000, message:`New Channel Pending`});
      this.refreshChannelData();
    },

    channelClosing() {
      this.$toast.open({duration: 3000, message:`New Channel Closing`});
      this.refreshChannelData();
    },

    async refreshChannelData() {
      this.channels = (await this.$axios.get(`${this.$env.API_LND}/v1/lnd/channel`)).data;
      this.setChannelData();
    },

    async setChannelData() {
      this.displayedChannels = [];

      for (const channel of this.channels) {

        // We should ignore channels created by autopilot
        if (!channel.managed && channel.initiator) {
          continue;
        }

        if (this.display === 'inbound' && channel.initiator) {
          continue;
        }

        if (this.display === 'outbound' && !channel.initiator) {
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

        if(channel.name === '' && !channel.initiator) {
          channel.name = 'Incoming Channel';
          channel.purpose = 'A channel that another node has opened to your node';
        }

        this.displayedChannels.push(channel);
      }
    },

    displayChannels(mode) {
      this.display = mode;
      this.setChannelData();
    }
  },

  async created() {
    this.refreshChannelData();
  },

  components: {
    UnitSwitch
  },
};
</script>
