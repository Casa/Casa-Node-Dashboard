<template>
  <section class="lightning-menu">
    <div class="slideout-header">
      <a @click.prevent="closePanel">
        <span class="icon">
          <img src="~assets/icon-close.svg">
        </span>

        <span>Close</span>
      </a>

      <UnitSwitch />
    </div>

    <div class="app-slideout lnd">
      <div class="app-title">
        <img src="~assets/lightning.png" alt="">
        <h2>Manage Lightning</h2>
      </div>

      <!-- Lightning Stats Section -->
      <div class="stats">
        <div class="stats-col">
          <h1>{{openChannels.length}} Channel<template v-if="openChannels.length != 1">s</template></h1>
          <h2>{{lightning.balance.confirmed | inUnits | withSuffix}} in Channels</h2>
        </div>
        <div class="stats-col">
          <h1>{{pendingChannels.length}} Pending</h1>
          <h2>{{lightning.balance.pending | inUnits | withSuffix}} Pending</h2>
        </div>
        <div class="stats-col">
          <h1>{{channelAverage | inUnits | withSuffix}}</h1>
          <h2>Avg. Value per Channel</h2>
        </div>
      </div>

      <hr>

      <!-- Lightning Settings -->
      <section class="app-settings">
        <!-- Autopilot Settings -->
        <div class="field toggle-settings menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Autopilot Channel Settings

              <b-tooltip label="Autopilot automatically opens channels to other nodes in the background. This also shows any channels other nodes have opened to you." type="is-dark" multilined>
                  <span class="icon is-small"><img src="~assets/icon-info-blue.svg" alt=""></span>
              </b-tooltip>
            </label>
            <p>Automatically connect your node to others in the network.</p>

            <div v-if="system.settings.lnd.autopilot" class="button no-hover is-success is-rounded">Active</div>
            <div v-else class="button no-hover is-light is-rounded">Inactive</div>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" @click="showAutopilotMenu">
                <span>Manage</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>

        <!-- Custom Channels -->
        <div class="field toggle-settings menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Custom Lightning Channels

              <b-tooltip label="Open &amp; manage channels with specific nodes on the network, giving you more control over who you connect with." type="is-dark" multilined>
                 <span class="icon is-small"><img src="~assets/icon-info-blue.svg" alt=""></span>
              </b-tooltip>
            </label>
            <p>Open and close channels with specific nodes.</p>


            <div v-if="customChannels.length" class="button no-hover is-success is-rounded">{{ customChannels.length }} open</div>
            <div v-else class="button no-hover is-light is-rounded">0 open</div>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" @click="showChannelMenu">
                <span>Manage</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>

        <!-- Incoming Channel Size -->
        <div class="field toggle-settings is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Minimum Incoming Channel Size</label>
            <p v-if="system.displayUnit === 'btc'">0.0002 BTC - 0.16 BTC are the current channel size limits set by the Lightning Network.</p>
            <p v-else>20,000 sats - 16,000,000 sats are the current channel size limits set by the Lightning Network.</p>
          </div>

          <div class="field-body">
            <div class="field">
              <div class="control is-clearfix">
                <input v-if="system.displayUnit === 'btc'" placeholder="BTC" type="text" autocomplete="on" class="input" v-model="minChanSizeBtc" :class="{ 'is-danger': errors.has('chansize')}" name="chansize" v-validate="'decimal'">
                <input v-else type="text" placeholder="sats" autocomplete="on" class="input" v-model="minChanSizeSats" :class="{ 'is-danger': errors.has('chansize')}" name="chansize" v-validate="'integer'">
              </div>
            </div>
          </div>
        </div>
        <hr>

        <!-- Node Alias -->
        <div class="field toggle-settings is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Node Nickname</label>
            <p>This is publicly viewable. Nicknames aren't unique, so always check the node address.</p>
          </div>

          <div class="field-body">
            <div class="field">
              <div class="control is-clearfix">
                <input type="text" autocomplete="on" class="input" v-model="system.settings.lnd.nickName" :class="{ 'is-danger': errors.has('nickname')}" name="nickname" v-validate="'max:32'">
              </div>
            </div>
          </div>
        </div>
        <hr>

        <!-- Node Color -->
        <div class="field toggle-settings is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Node Color</label>
            <p>Customize your node color in the Lightning Explorer with a hex code.</p>
          </div>

          <div class="field-body">
            <div class="field custom-color">
              <div class="control is-clearfix">
                <input type="text" autocomplete="on" class="input" placeholder="#8865DF" v-model="system.settings.lnd.color" @input="formatColor" :class="{ 'is-danger': errors.has('color')}" name="color" v-validate="{regex: /^#[0-9a-f]{6}$/}">
                <div class="color-output" :style="{'background-color': system.settings.lnd.color}"></div>
              </div>
            </div>
          </div>
        </div>
        <hr>

        <!-- Lightning Explorer -->
        <b-field class="toggle-settings" horizontal label="See Your Node">
          <a class="link" :href="lnExplorer + lightning.pubkey" target="_blank">
            <span class="link">Visit Lightning Explorer</span>
            <font-awesome-icon :icon="['fas', 'external-link-alt']"/>
          </a>
        </b-field>
        <hr>

        <div class="toggle-settings">
          <a class="button is-light cancel" @click="confirmCancel()">Clear Changes</a>
          <a class="button is-casa save" @click="validateSettings()">Save</a>
        </div><br>
      </section>

    </div>

  </section>
</template>

<script>
  // Handle Non-SSR Components
  if (process.browser) {
    var {vueSlideoutPanelService} = require('vue2-slideout-panel');
  }

  import axios from 'axios';
  import EventBus from '@/helpers/event-bus';
  import BitcoinData from '@/data/bitcoin';
  import LightningData from '@/data/lightning';
  import SystemData from '@/data/system';
  import {satsToBtc, btcToSats} from '@/helpers/units';

  import Autopilot from '@/components/Lightning/Autopilot';
  import Channels from '@/components/Lightning/Channels';
  import BitcoinTransactions from '@/components/Bitcoin/Transactions';
  import Unlock from '@/components/Lightning/Alerts/Unlock';
  import Caution from '@/components/Lightning/Alerts/Caution';
  import ConfirmSave from '@/components/Lightning/Alerts/ConfirmSave';
  import ConfirmCancel from '@/components/Lightning/Alerts/ConfirmCancel';
  import ConnectionCode from '@/components/Lightning/Modals/ConnectionCode';
  import UnitSwitch from '@/components/Settings/UnitSwitch';

  export default {
    data() {
      return {
        isLoading: true,
        lnExplorer: this.$env.LIGHTNING_EXPLORER,
        bitcoin: BitcoinData,
        lightning: LightningData,
        system: SystemData,
        minChanSizeBtc: null,
        minChanSizeSats: null,
      };
    },

    created() {
      EventBus.$emit('load-lightning-stats');
      EventBus.$on('unit-switched', () => this.formatMinChanSize());

      this.minChanSizeBtc = satsToBtc(this.system.settings.lnd.minChanSize);
      this.minChanSizeSats = this.system.settings.lnd.minChanSize;
    },

    mounted() {
      var vm = this;
      EventBus.$on('cancel', () => vm.closePanel());
      EventBus.$on('save', () => vm.validateSettings());
    },

    updated() {
      if(this.lightning.pubkey) {
        this.isLoading = false;
      }
    },

    destroyed () {
      EventBus.$emit('stop-lightning-stats');
      EventBus.$off('cancel');
      EventBus.$off('save');
    },

    computed: {
      channelAverage() {
        // If there are any open channels, determine average balance per channel
        const open = [];

        this.lightning.channels.forEach((channel) => {
          if(channel.status === 'open') {
            open.push(channel);
          }
        });

        if(open.length) {
          return this.lightning.balance.confirmed / open.length;
        }

        return 0;
      },

      openChannels() {
        const open = [];

        this.lightning.channels.forEach((channel) => {
          if(channel.status === 'open') {
            open.push(channel);
          }
        });

        return open;
      },

      pendingChannels() {
        const pending = [];

        this.lightning.channels.forEach((channel) => {
          if(channel.status === 'pending') {
            pending.push(channel);
          }
        });

        return pending;
      },

      customChannels() {
        const custom = [];

        this.lightning.channels.forEach((channel) => {
          if(channel.managed || !channel.initiator) {
            custom.push(channel);
          }
        });

        return custom;
      },
    },

    methods: {
      formatMinChanSize() {
        if(this.system.displayUnit === 'btc') {
          this.minChanSizeBtc = parseFloat(satsToBtc(this.minChanSizeSats));
        } else if(this.system.displayUnit === 'sats') {
          this.minChanSizeSats = parseInt(btcToSats(this.minChanSizeBtc));
        }
      },

      closePanel() {
        this.$emit('closePanel');
        this.$destroy();
      },

      confirmCancel() {
        this.$modal.open({parent: this, component: ConfirmCancel, hasModalCard: true});
      },

      confirmSave() {
        this.$modal.open({parent: this, component: ConfirmSave, hasModalCard: true});
      },

      cardModal() {
        this.$modal.open({parent: this, component: Caution, hasModalCard: true});
      },

      unlockModal() {
        this.$modal.open({parent: this, component: Unlock, hasModalCard: true});
      },

      showErrorMessage(err) {
        this.$snackbar.open({
          duration: 5000,
          message: err,
          type: 'is-danger',
          position: 'is-top',
          actionText: 'Ok',
          queue: false,
          onAction: () => {
            if(err === 'Must unlock wallet') {
              this.unlockModal();
            }
          }
        })
      },

      formatColor() {
        // Prepend # symbol if none is included
        if(this.system.settings.lnd.color.length && this.system.settings.lnd.color[0] != '#') {
          this.system.settings.lnd.color = '#' + this.system.settings.lnd.color;
        }

        // Remove duplicate # symbols if necessary
        this.system.settings.lnd.color = this.system.settings.lnd.color.replace(/#+/, '#');
      },

      validateSettings() {
        this.$validator.validate().then(valid => {
          if(valid) {
            this.saveSettings();
          } else {
            this.$toast.open({duration: 3000, type: 'is-danger', message: 'Unable to save settings. Check that all of your settings are valid.'});
          }
        });
      },

      async saveSettings() {
        EventBus.$emit('loading-start');

        const data = {
          nickName: this.system.settings.lnd.nickName,
          color: this.system.settings.lnd.color,
        };

        // Convert minimum channel size to sats
        if(this.system.displayUnit === 'btc' && this.minChanSizeBtc) {
          data.minChanSize = parseInt(btcToSats(this.minChanSizeBtc));
        } else if(this.system.displayUnit === 'sats' && this.minChanSizeSats) {
          data.minChanSize = parseInt(this.minChanSizeSats);
        }

        try {
          await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
          this.$toast.open({duration: 3000, message:`Settings Saved`});
        } catch (error) {
          this.showErrorMessage(error.response.data);
        } finally {
          EventBus.$emit('loading-stop');
          this.closePanel();
        }
      },

      // TODO: Refactor these to use the EventBus
      async showAutopilotMenu() {
        await vueSlideoutPanelService.show({
          component: Autopilot,
          width: '100%',
          cssClass: 'casa-sld',
          props: {settings: this.system.settings}
        })
      },

      async showChannelMenu() {
        await vueSlideoutPanelService.show({
          component: Channels,
          width: '100%',
          cssClass: 'casa-sld',
          props: {data: {panel: 'open'}}
        })
      },

      async showBitcoinTransactions() {
        await vueSlideoutPanelService.show({component: BitcoinTransactions, width: '100%'});
        this.$emit('closePanel');
      },
    },

    components: {
      UnitSwitch
    },
  };
  </script>
