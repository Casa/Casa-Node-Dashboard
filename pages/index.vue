<template>
  <div v-show="isActive">
    <section class="section launcher">
      <div class="columns is-mobile">
        <div class="column">
          <p class="title center">
            <img class="launcher-logo" src="~assets/logo.svg" alt="Casanode">
          </p>
        </div>
      </div>

      <div class="columns is-desktop">
        <!-- Bitcoin Launcher -->
        <div class="column">
          <div class="card rounded">
            <header class="card-header">
              <h2 class="card-header-title has-text-centered">
                <img src="~assets/bitcoin.svg" alt="Bitcoin">
                <span>Bitcoin</span>
              </h2>
            </header>

            <div class="card-content">
              <div class="content">
                <h3 class="is-center muted" v-if="bitcoin.isLoading && !system.resync">Loading...</h3>
                <h3 class="is-center syncing" v-else-if="system.resync">Downloading <i class="status-circle status-syncing"></i></h3>
                <h3 class="is-center syncing" v-else-if="bitcoin.isStarting">Starting <i class="status-circle status-syncing"></i></h3>
                <h3 class="is-center syncing" v-else-if="bitcoin.isSyncing || bitcoin.isRollingForward">Syncing <i class="status-circle status-syncing"></i></h3>
                <h3 class="is-center synced" v-else-if="bitcoin.isSynced">Synced <i class="status-circle status-synced"></i></h3>

                <h4 class="is-center muted" v-if="!bitcoin.isLoading">
                  <span v-if="bitcoin.isRollingForward">Rolling Forward</span>
                  <span v-else-if="system.resync && system.status.downloadedAmount">{{system.status.downloadedAmount}} {{system.status.downloadedAmountUnit}} / {{system.status.totalAmount}} {{system.status.totalAmountUnit}}</span>
                  <span v-else-if="bitcoin.percent == 1">100%</span>
                  <span v-else-if="bitcoin.percent !== undefined">{{bitcoin.currentBlock}} / {{bitcoin.blockHeight}} blocks synced</span>
                </h4>
              </div>
            </div>

            <footer class="card-footer" @click="showBitcoinMenu">
              <p class="card-footer-title">Manage</p>
              <a class="card-header-icon" aria-label="more options">
                <span class="icon">
                  <img src="~assets/chevron.svg" alt="open">
                </span>
              </a>
            </footer>

            <footer class="card-footer" @click="showBitcoinTransactions">
              <p class="card-footer-title">Transactions</p>
              <a class="card-header-icon" aria-label="transactions">
                <span class="icon">
                  <img src="~assets/chevron.svg" alt="open">
                </span>
              </a>
            </footer>
          </div>
        </div>

        <!-- Lightning Launcher -->
        <div class="column">
          <div class="card rounded">
            <header class="card-header">
              <h2 class="card-header-title has-text-centered">
                <img src="~assets/lightning.png" alt="Lightning">
                <span>Lightning</span>
              </h2>
            </header>

            <div class="card-content">
              <div class="content">
                <h3 class="is-center muted" v-if="lightning.isLoading || system.resync">Loading...</h3>
                <h3 class="is-center syncing" v-else-if="lightning.isStarting">Starting <i class="status-circle status-syncing"></i></h3>
                <h3 class="is-center locked" v-else-if="!lightning.unlocked">Locked <i class="status-circle status-locked"></i></h3>
                <h3 class="is-center syncing" v-else-if="lightning.isSyncing">Syncing <i class="status-circle status-syncing"></i></h3>
                <h3 class="is-center synced" v-else-if="lightning.isSynced">Active <i class="status-circle status-synced"></i></h3>

                <div v-if="!lightning.isLoading && lightning.blockHeight">
                  <h4 class="is-center muted" v-if="!lightning.unlocked">Refresh to unlock</h4>
                  <h4 class="is-center muted" v-else-if="lightning.unlocked && !lightning.isSynced">
                    <template v-if="lightning.percent == 1">100%</template>
                    <template v-else-if="lightning.percent === -1">Getting latest blocks...</template>
                    <template v-else>{{lightning.currentBlock}} / {{lightning.blockHeight}} blocks synced</template>
                  </h4>
                  <h4 class="is-center muted" v-else-if="lightning.unlocked && lightning.isSynced">Online </h4>
                </div>
              </div>
            </div>

            <footer class="card-footer" @click="showLightningMenu">
              <p class="card-footer-title">Manage</p>
              <a href="#" class="card-header-icon" aria-label="manage node">
                <span class="icon">
                  <img src="~assets/chevron.svg" alt="open">
                </span>
              </a>
            </footer>

            <footer class="card-footer" @click="showLightningTransactions">
              <p class="card-footer-title">Transactions</p>
              <a href="#" class="card-header-icon" aria-label="transactions">
                <span class="icon">
                  <img src="~assets/chevron.svg" alt="open">
                </span>
              </a>
            </footer>
          </div>
        </div>

        <!-- Settings Launcher -->
        <div class="column">
          <div class="card settings rounded">
            <header class="card-header">
              <h2 class="card-header-title has-text-centered">
                <img src="~assets/settings.svg" alt="Settings">
                <span> System</span>
              </h2>
            </header>
            <div class="card-content">
              <div class="content">
                <h3 class="is-center muted" v-if="system.isLoading">Loading...</h3>

                <template v-else-if="!system.isLoading">
                  <h3 class="is-center">{{system.diskUsed}} Used</h3>
                  <h4 class="is-center muted">1.0 TB Total</h4>
                </template>
              </div>
            </div>

            <footer class="card-footer" @click="showConnectionsMenu">
              <p class="card-footer-title">Connections</p>
              <a href="#" class="card-header-icon" aria-label="more options">
                <span class="icon">
                  <img src="~assets/chevron.svg" alt="open">
                </span>
              </a>
            </footer>

            <footer class="card-footer" @click="showSettingsMenu">
              <p class="card-footer-title">Settings</p>
              <a href="#" class="card-header-icon" aria-label="more options">
                <span class="icon">
                  <img src="~assets/chevron.svg" alt="open">
                </span>
              </a>
            </footer>
          </div>
        </div>
      </div>

      <update-notice v-if="system.updatesAvailable">A software update is available for your Casa Node. Click here to begin the update, or run it later from the Settings panel.</update-notice>

      <template v-else-if="displayPromo">
        <div class="extension-promo desktop-only">
          <a href="https://chrome.google.com/webstore/detail/casa-extension/lnaedehiikghclgaikolambpbpeknpef/" target="_blank" rel="noopener"></a>
          <div class="close" @click="dismissPromo"></div>
        </div>
      </template>

      <section class="footer-links">
        <div class="container is-fluid">
          <div class="columns is-mobile is-centered">
            <div class="column is-three-quarters-mobile is-two-thirds-tablet is-half-desktop is-one-third-widescreen is-one-third-fullhd">
              <img class="footer-logo" src="~/assets/gray-logo.svg" alt="footer logo">
              <p class="resources">
                <a href="https://keys.casa" target="_blank" rel="noopener">Home</a>   ∙   <a href="https://keys.casa/node-help" target="_blank" rel="noopener">Support</a>   ∙   <a href="https://keys.casa/legal" target="_blank" rel="noopener">Legal</a>
              </p>
            </div>
          </div>
        </div>
      </section>

    </section>
  </div>
</template>

<script>
// Handle Non-SSR Components
if (process.browser) {
  var {vueSlideoutPanelService} = require('vue2-slideout-panel');
}

import axios from 'axios';
import { mapGetters } from 'vuex';
import EventBus from '@/helpers/event-bus';
import API from '@/helpers/api';

// Dynamic data stores
import BitcoinData, { BitcoinSetup, BitcoinTeardown } from '@/data/bitcoin';
import LightningData, { LightningSetup, LightningTeardown } from '@/data/lightning';
import SystemData, { SystemSetup, SystemTeardown } from '@/data/system';

//Import Application Panels
import BitcoinMenu from '@/components/Bitcoin/index';
import BitcoinTransactions from '@/components/Bitcoin/Transactions';
import LightningMenu from '@/components/Lightning/index';
import LightningTransactions from '@/components/Lightning/Transactions';
import Settings from '@/components/Settings/index';
import Connections from '@/components/Settings/Connections';

// Conditional Modals
import Welcome from '@/components/Lightning/Alerts/Welcome';
import Unlock from '@/components/Lightning/Alerts/Unlock';
import ConfirmUpdate from '@/components/Settings/Alerts/ConfirmUpdate';
import UpdateNotice from '@/components/Settings/Alerts/UpdateNotice';

export default {
  name: 'Launcher',
  layout: 'default',
  // Check Auth
  middleware: 'auth',
  computed: {
    ...mapGetters(['isAuthenticated'])
  },

  components: {
    'update-notice': UpdateNotice
  },

  data() {
    return {
      // UI application state
      isActive: false,
      isLoading: false,
      loadingTimeout: false,
      loadingSpinner: false,
      warningTimeout: false,
      displayPromo: false,
      alerted: {},
      preloaded: {},

      // API application state
      bitcoin: BitcoinData,
      lightning: LightningData,
      system: SystemData,
    }
  },

  beforeMount() { // perform runtime injection
    let url = this.$env.DEVICE_HOST;
    if (window.location.href.includes('.onion')) {
      url = this.$env.CASA_NODE_HIDDEN_SERVICE;
    }
    this.$env.API_MANAGER = `${url}:3000`;

    this.$env.API_LND = `${url}:3002`;
    this.$env.UPDATE_MANAGER = `${url}:3001`;
  },

  // once view exists and data is observed
  async mounted () {
    // force confirmation before updating device
    EventBus.$on('update', this.update);
    EventBus.$on('loading-start', this.showLoadingSpinner);
    EventBus.$on('loading-stop', this.hideLoadingSpinner);
    EventBus.$on('refresh-dashboard', this.$forceUpdate);

    // Display a loading indicator if none of the API calls return anything within a couple seconds
    this.loadingTimeout = setTimeout(() => {
      this.isLoading = true;
      EventBus.$emit('loading-start');
    }, 2000);

    // Display a warning message to the user that their node is running slowly
    this.warningTimeout = setTimeout(() => {
      this.$snackbar.open({message: "Your node is taking longer than expected to load. Please wait...", position:'is-top', indefinite: true});
    }, 10000);

    // Check to see if the user is registered. If the user is not registered, redirect them to the intro page.
    const data = await API.get(axios, `${this.$env.API_MANAGER}/v1/accounts/registered`);

    // If the registered route is unavailable, redirect the user to the login page and handle further errors there.
    if (data === false) {
      this.$router.push('/login');
      return;
    }

    if (data.registered === false) {
      this.$router.push('/intro');
      return;
    }

    // Make a JWT authenticated call to ensure we're still logged in
    await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/telemetry/serial`);

    if(this.$auth.loggedIn) {
      this.isActive = true;

      // Clear the loading indicator timeout if it still exists
      clearTimeout(this.loadingTimeout);
      clearTimeout(this.warningTimeout);

      // Stop the loading indicator in case it started
      if(this.isLoading) {
        EventBus.$emit('loading-stop');
      }
    }

    this.$on('offline', function () {
      this.connectionDown();
    });

    this.$on('unlock-lnd', function() {
      this.lightning.isUnlocking = false;
    });

    this.$on('cancel-lnd', function() {
      this.lightning.isLoading = false;
      this.lightning.isStarting = false;
    });

    BitcoinSetup(this);
    LightningSetup(this);
    SystemSetup(this);
  },

  updated() {
    // Only display these warnings when the system is not resyncing
    if(!this.system.resync) {
      // If the bitcoin container is running, but bitcoind is not operational, we must be rolling forward
      if(this.system.container.bitcoind === 'running' && this.bitcoin.operational === false && !this.alerted.rollingForward) {
        // If tor is being started, suppress this notification
        if(this.system.startingTor) {
          return;
        }

        // Display a message to explain what rolling forward is
        this.$snackbar.open({message: "Your Bitcoin node is currently Rolling Forward after a restart. Your node is temporarily unusable during this time, so you may see errors or inconsistent data when viewing the Bitcoin and Lightning screens. This process can take up to 60 minutes, then everything will be back to normal.", type:'is-success', position:'is-top', indefinite: true});
        this.alerted.rollingForward = true;
      }

      // If bitcoind needs to sync at least 50 blocks, display a welcome message
      if(this.bitcoin.operational && this.bitcoin.blockHeight - this.bitcoin.blockHeight > 50 && !this.alerted.syncing) {
        this.alerted.syncing = true;
        this.$modal.open({parent: this, component: Welcome, hasModalCard: true});
      }

      // Find containers that aren't running
      Object.entries(this.system.container).forEach(([container, status]) => {
        if(status !== 'running' && !this.alerted[container]) {
          this.alerted[container] = true;
          this.$toast.open({message: `${container} is not currently running.`});
        }
      });
    }

    // If everything is synced, preload node statistics
    if(this.bitcoin.isSynced && this.lightning.isSynced && !this.preloaded.stats) {
      this.preloaded.stats = true;

      EventBus.$emit('load-bitcoin-stats', {autoupdate: false});
      EventBus.$emit('load-lightning-stats', {autoupdate: false});
    }

    // If everything is synced and lightning is unlocked, preload transactions
    if(this.bitcoin.isSynced && this.lightning.isSynced && this.lightning.unlocked && !this.preloaded.transactions) {
      this.preloaded.transactions = true;

      EventBus.$emit('load-bitcoin-transactions', {autoupdate: false});
      EventBus.$emit('load-lightning-transactions', {autoupdate: false});

      // Check if the extension promo has ever been displayed
      if(!localStorage.getItem('promo-displayed')) {
        this.displayPromo = true;
        localStorage.setItem('promo-displayed', true);
      }
    }
  },

  destroyed() {
    // Clear timeouts when redirected to the intro / loading page
    clearTimeout(this.loadingTimeout);
    clearTimeout(this.warningTimeout);

    if(this.isLoading) {
      EventBus.$emit('loading-stop');
    }

    BitcoinTeardown();
    LightningTeardown();
    SystemTeardown();

    // Remove slideout panel class from body when redirected to login
    document.body.classList.remove('slideout-panel-open');
  },

  methods: {
    bytesToSize(bytes) {
       var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
       if (bytes == 0) {
         return '0 Byte';
       }
       var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
       var total = Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
       return total;
    },

    showLoadingSpinner() {
      this.loadingSpinner = this.$loading.open({container: null});
    },

    hideLoadingSpinner() {
      this.loadingSpinner.close();
    },

    nodeIsRunning(menu) {
      let running = false;

      const errorMessages = {
        index: {
          starting: "Your node is starting, so some data may not display correctly.",
          locked: "Your node is locked, so some data may not display correctly.",
          syncing: "Your node is syncing, so some data may not display correctly.",
        },

        transactions: {
          starting: "Your node is starting, please wait until it's online to view your Transactions.",
          locked: "Your node is locked, so you can't view your Transactions. Refresh to unlock after making any necessary settings changes in the Manage Node panel.",
          syncing: "Please wait for Bitcoin and Lightning to finish syncing before viewing your Transactions.",
        },
      };

      if(this.system.container.bitcoind != 'running' || this.system.container.lnd != 'running') {
        this.$toast.open({duration: 4000, message: errorMessages[menu].starting, type: 'is-danger'});
      } else if(!this.lightning.unlocked) {
        this.$toast.open({duration: 4000, message: errorMessages[menu].locked, type: 'is-danger'});
      } else if(!this.bitcoin.isSynced || !this.lightning.isSynced) {
        this.$toast.open({duration: 4000, message: errorMessages[menu].syncing, type: 'is-danger'});
      } else {
        running = true;
      }

      return running;
    },

    async showBitcoinTransactions() {
      if(this.nodeIsRunning('transactions')) {
        await vueSlideoutPanelService.show({component: BitcoinTransactions, width: '100%'});
      }
    },

    async showBitcoinMenu() {
      // Check if the node is running to display warnings, but don't prevent this menu from being opened
      this.nodeIsRunning('index');
      await vueSlideoutPanelService.show({component: BitcoinMenu, width: '100%'});
    },

    async showLightningTransactions() {
      if(this.nodeIsRunning('transactions')) {
        await vueSlideoutPanelService.show({component: LightningTransactions, width: '100%'});
      }
    },

    async showLightningMenu() {
      this.nodeIsRunning('index');
      await vueSlideoutPanelService.show({component: LightningMenu, width: '100%'});
    },

    async showSettingsMenu() {
      await vueSlideoutPanelService.show({component: Settings, width: '100%', props: {updateAvailable: this.system.updatesAvailable}});
    },

    async showConnectionsMenu() {
      await vueSlideoutPanelService.show({
        component: Connections,
        width: '100%',
        cssClass: 'casa-sld',
      })
    },

    async update() {
      this.$snackbar.open({message:'Software updating. Please reload this tab in 5 minutes.', type:'is-success', position:'is-top', indefinite:true});
      try {
        await this.$axios.post(`${this.$env.UPDATE_MANAGER}/v1/update`);
      } catch (e) {
        this.$snackbar.open({message:'Software update failed.', type:'is-danger', position:'is-top', indefinite: true});
      }
    },

    showErrorMessage(err) {
      // Don't show toast for unauthorized errors
      if(err.response.status !== 401) {
        this.$toast.open({duration: 5000, message: 'Error initializing node service.', type: 'is-danger'});
      }
    },

    unlockModal() {
      this.$modal.open({parent: this, component: Unlock, hasModalCard: true, props: {parent: this}});
    },

    connectionDown() {
      this.$snackbar.open({
        duration: 5000,
        message:'Internet connection lost. Please reconnect then refresh the page.',
        type: 'is-danger',
        position: 'is-top',
        actionText: 'Dismiss',
        queue: false,
        onAction: () => {
          console.log('dismissed')
        }
      })
    },

    dismissPromo() {
      this.displayPromo = false;
    },
  }
};
</script>
