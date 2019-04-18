<template>
  <section class="bitcoin-menu">
    <div class="slideout-header">
      <a @click.prevent="closePanel">
        <span class="icon">
          <img src="~assets/icon-close.svg">
        </span>

        <span>Close</span>
      </a>
    </div>
    <div class="app-slideout btc">

      <!--  BTC Stats Section -->
      <div class="app-title">
        <img src="~assets/bitcoin.svg" alt="Bitcoin">
        <h2> Bitcoin Node</h2>
      </div>
      <div class="stats">
        <div class="stats-col">
          <h1>Online</h1>
          <h2>{{bitcoin.address.external}}</h2>
          <h3>Node Status</h3>
        </div>
        <div class="stats-col">
          <h1>{{bitcoin.percent | percentage}}</h1>
          <h2>{{bitcoin.currentBlock}} of {{bitcoin.blockHeight}}</h2>
          <h3>Blocks Synced</h3>
        </div>
        <div class="stats-col">
          <h1>{{bitcoin.connections.outbound}} Outbound</h1>
          <h2>{{bitcoin.connections.inbound}} Inbound</h2>
          <h3>Connected Peers</h3>
        </div>
      </div>

      <!-- Display loading status -->
      <b-loading :is-full-page="false" :active.sync="isLoading"></b-loading><hr>

      <section class="app-settings">
        <!-- Incoming Connections -->
        <b-field class="toggle-settings" horizontal label="Allow Incoming Connections">
          <span>Incoming Connections<span v-if="system.settings.bitcoind.bitcoindListen"> Allowed</span><span v-else> Disabled</span></span>
          <b-switch v-model="system.settings.bitcoind.bitcoindListen" type="is-info"></b-switch>
        </b-field><hr>

        <div class="field toggle-settings danger-sync menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Danger Zone
            </label>
          </div>
        </div>
        <hr>

        <div class="field toggle-settings danger-sync menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Resync Bitcoin from Casa
            </label>

            <p>Wipes all Bitcoin data and syncs from Casa's servers.</p>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" @click="confirmRedownload()">
                <span>Resync</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>

        <div class="field toggle-settings danger-sync menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Resync Bitcoin from Scratch
            </label>

            <p>Wipes all Bitcoin data and syncs from scratch. This will likely take over a month.</p>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" @click="confirmResync()">
                <span>Sync from Scratch</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>

        <div class="toggle-settings">
          <a class="button is-light cancel" @click="confirmCancel()">Clear Changes</a>
          <a class="button is-casa save" @click="confirmSave()">Save</a>
        </div>
      </section>

    </div>

  </section>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import SystemData from '@/data/system';

import ConfirmCancel from '@/components/Lightning/Alerts/ConfirmCancel';
import ConfirmSave from '@/components/Lightning/Alerts/ConfirmSave';
import ConfirmSync from '@/components/Bitcoin/Alerts/ConfirmSync';
import ConfirmRedownload from '@/components/Bitcoin/Alerts/ConfirmRedownload';

export default {
  name: 'Bitcoin',

  data() {
    return {
      isLoading: true,
      features: {
        syncStop: true
      },
      settings: {
        canSync: true
      },
      bitcoin: BitcoinData,
      system: SystemData,
    }
  },

  async created() {
    // Start auto-updating bitcoin stats
    EventBus.$emit('load-bitcoin-stats');
  },

  updated() {
    if(this.bitcoin.address.external && Object.keys(this.bitcoin.connections).length) {
      this.isLoading = false;
    }
  },

  mounted() {
    var vm = this; // avoid scope problems
    EventBus.$on('cancel', () => vm.closePanel());
    EventBus.$on('save', () => {
      vm.saveSettings();
    });

    EventBus.$on('redownload', () => {
      vm.redownload();
    });

    EventBus.$on('resync', () => {
      vm.resync();
    });
  },

  destroyed() {
    EventBus.$emit('stop-bitcoin-stats');
    EventBus.$off('save');
    EventBus.$off('redownload');
    EventBus.$off('resync');
  },

  methods: {
    closePanel() {
      this.$emit('closePanel');
      this.$destroy();
    },

    save() {
      this.$toast.open({duration: 3000, message:`Settings Saved`});
    },

    async redownload() {
      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/device/resync-chain`, {full: true});
        this.$toast.open({duration: 3000, message:`Resyncing`});

        // Start loading system status to check download progress
        EventBus.$emit('load-system-stats');
      } catch (err) {
        this.$toast.open({duration: 3000, message: err});
      } finally {
        this.closePanel();
      }
    },

    async resync() {
      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/device/chain-reset`);
        this.$toast.open({duration: 3000, message:`Resyncing`});
      } catch (err) {
        this.$toast.open({duration: 3000, message: err});
      } finally {
        this.closePanel();
      }
    },

    confirmCancel() {
      this.$modal.open({parent: this, component: ConfirmCancel, hasModalCard: true});
    },

    confirmSave() {
      this.$modal.open({parent: this, component: ConfirmSave, hasModalCard: true});
    },

    confirmRedownload() {
      this.$modal.open({parent: this, component: ConfirmRedownload, hasModalCard: true});
    },

    confirmResync() {
      this.$modal.open({parent: this, component: ConfirmSync, hasModalCard: true});
    },

    async saveSettings() {
      try {
        const data = {
          bitcoindListen: this.system.settings.bitcoind.bitcoindListen,
        };

        EventBus.$emit('loading-start');
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
        this.$toast.open({duration: 3000, message:`Settings Saved`});
      } catch (error) {
        console.error(error);
      } finally {
        EventBus.$emit('loading-stop');
        this.closePanel();
      }
    }
  },
};
</script>
