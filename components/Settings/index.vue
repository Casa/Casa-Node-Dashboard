<template>
  <section>
    <div class="slideout-header">
      <a @click.prevent="closePanel">
        <span class="icon">
          <img src="~assets/icon-close.svg">
        </span>

        <span>Close</span>
      </a>
    </div>
    <div class="app-slideout settings">

      <div class="app-title">
        <img src="~assets/settings.svg" alt="Settings">
        <h2> System Settings</h2>
      </div>

      <div class="stats" v-if="features.stats">
        <div class="stats-col">
          <h1>CPU</h1>
          <h2><span>{{stats.cpu}}</span>%</h2>
          <h3>Resource Usage</h3>
        </div>
        <div class="stats-col">
          <h1>RAM</h1>
          <h2><span>{{stats.ram}}</span> GB</h2>
          <h3>Memory Usage</h3>
        </div>
        <div class="stats-col">
          <h1>Storage</h1>
          <h2><span>{{stats.hd}}</span> TB</h2>
          <h3>Free Space</h3>
        </div>
      </div><hr>

      <section class="app-settings">
        <div class="field toggle-settings menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              Troubleshooting Logs
            </label>

            <p>Note: Error logs can currently only be decrypted by Casa engineers - please send logs to <a href="mailto:help@team.casa">help@team.casa</a> when requested.</p>
            <iframe v-if="downloadStarted" class="is-hidden" id="download-frame" :src="downloadUrl" @load="downloadComplete()"></iframe>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" :href="downloadUrl" @click.prevent="downloadLogs()">
                <span>Download</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>

        <template v-if="updateAvailable">
          <b-field class="toggle-settings menu-navigation" horizontal label="Update Software">
            <a class="button is-rounded" @click="confirmUpdate()">
              <span>Update</span>
              <span class="icon is-small">
                <font-awesome-icon :icon="['fas', 'chevron-right']"/>
              </span>
            </a>
          </b-field><hr>
        </template>

        <b-field class="toggle-settings menu-navigation" horizontal label="Shutdown Device">
          <a class="button is-rounded" @click="confirmShutdown()">
            <span>Shutdown</span>
            <span class="icon is-small">
              <font-awesome-icon :icon="['fas', 'chevron-right']"/>
            </span>
          </a>
        </b-field><hr>

        <div class="field toggle-settings menu-navigation is-horizontal">
          <div class="field-label is-normal">
            <label class="label">
              <img src="~assets/logo-casa-extension.svg" alt="Casa Extension">
            </label>

            <p>Unlock your Casa Node with the Casa Extension.</p>
          </div>

          <div class="field-body">
            <div class="field">
              <a class="button is-rounded" href="https://chrome.google.com/webstore/detail/casa-extension/lnaedehiikghclgaikolambpbpeknpef/" target="_blank" rel="noopener">
                <span>Download Now</span>
                <span class="icon is-small">
                  <font-awesome-icon :icon="['fas', 'chevron-right']"/>
                </span>
              </a>
            </div>
          </div>
        </div>
        <hr>

        <b-field class="toggle-settings danger-sync" horizontal label="Danger Zone">
          <a class="button is-rounded" @click="confirmFactoryReset()">
            <span>Factory Reset</span>
            <span class="icon is-small">
              <font-awesome-icon :icon="['fas', 'chevron-right']"/>
            </span>
          </a>
        </b-field>
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
import ConfirmUpdate from '@/components/Settings/Alerts/ConfirmUpdate';
import ConfirmShutdown from '@/components/Settings/Alerts/ConfirmShutdown';
import ConfirmFactoryReset from '@/components/Settings/Alerts/ConfirmFactoryReset';

export default {
  name: 'Settings',
  props: ['updateAvailable'],

  data() {
    return {
      features: { stats: false },
      stats: { cpu: 22, ram: 3.25, hd: 1.25 },
      downloadUrl: this.$env.API_MANAGER + '/v1/logs/download',
      downloadStarted: false,
    }
  },

  mounted() {
    var vm = this;
    // force confirmation before updating device
    EventBus.$on('updating', () => vm.closePanel());
    EventBus.$on('factory-reset', () => vm.factoryReset());
  },

  destroyed() {
    // unbind update upon panel close
    EventBus.$off('updating');
    EventBus.$off('factory-reset');
  },

  methods: {
    downloadLogs() {
      EventBus.$emit('loading-start');
      this.$snackbar.open({message: 'Requesting logs. This may take 30-60 seconds to complete.', type:'is-success', position:'is-top', duration: 10000});
      this.downloadStarted = true;

      // Chrome doesn't fire a load event on iframes that download a file, so hide the loading indicator after 30s...
      setTimeout(() => {
        this.downloadComplete();
      }, 30 * 1000);
    },

    downloadComplete() {
      EventBus.$emit('loading-stop');
    },

    closePanel() {
      this.$emit('closePanel');
      this.$destroy(); // destroy panel component
    },

    confirmUpdate() {
      this.$modal.open({parent: this, component: ConfirmUpdate, hasModalCard: true});
    },

    confirmShutdown() {
      this.$modal.open({parent: this, component: ConfirmShutdown, hasModalCard: true});
    },

    confirmFactoryReset() {
      this.$modal.open({parent: this, component: ConfirmFactoryReset, hasModalCard: true});
    },

    async factoryReset() {
      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/device/user-reset`);
        this.$toast.open({duration: 3000, message:`Resetting...`});

        // Refresh the page after 3 seconds
        setTimeout(function() {
          location.reload();
        }, 3000);
      } catch (err) {
        this.$toast.open({duration: 3000, message: err});
      } finally {
        this.closePanel();
      }
    },
  }
};
</script>
