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
        <img src="~assets/lightning.png" alt="Lightning">
        <h2>Manage Lightning</h2>
      </div>

      <!-- Lightning Stats Section -->
      <div class="stats">
        <div class="stats-col">
          <h1>{{lightning.channels.open.length}} Channel<template v-if="lightning.channels.open.length != 1">s</template></h1>
          <h2>{{lightning.balance.confirmed | inUnits | withSuffix}} in Channels</h2>
        </div>
        <div class="stats-col">
          <h1>{{lightning.channels.pending.length}} Pending</h1>
          <h2>{{lightning.balance.pending | inUnits | withSuffix}} Pending</h2>
        </div>
        <div class="stats-col">
          <h1>{{lightning.quotient | inUnits | withSuffix}}</h1>
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
                 <span class="icon is-small"><img src="~assets/icon-info-blue.svg" alt="info"></span>
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
                 <span class="icon is-small"><img src="~assets/icon-info-blue.svg" alt="info"></span>
              </b-tooltip>
            </label>
            <p>Open and close channels with specific nodes.</p>


            <div v-if="lightning.channels.custom.length" class="button no-hover is-success is-rounded">{{ lightning.channels.custom.length }} open</div>
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
      };
    },

    created() {
      EventBus.$emit('load-lightning-stats');
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

    methods: {
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

      validateSettings() {
        this.$validator.validate().then(valid => {
          if(valid) {
            this.saveSettings();
          } else {
            // TODO: Make this error message more generic if we add any other fields to the index page?
            this.$toast.open({duration: 3000, type: 'is-danger', message: 'Unable to save settings. Node nickname must be less than or equal to 32 characters.'});
          }
        });
      },

      async saveSettings() {
        EventBus.$emit('loading-start');

        const data = {
          nickName: this.system.settings.lnd.nickName,
        };

        try {
          await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
          this.$toast.open({duration: 3000, message:`Settings Saved`});
        } catch (err) {
          this.showErrorMessage(err);
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
