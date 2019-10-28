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

    <div class="app-slideout connections">
      <div class="app-title">
        <img src="~assets/settings.svg" alt="">
        <h2>Connections</h2>
      </div>

      <div class="app-content">
        <h3>Access your connection codes and unlock Tor for increased anonymity and privacy.</h3>

        <div class="tor-description columns">
          <div class="column is-2">
            <img src="~assets/icon-tor.png" alt="">
          </div>

          <div class="column">
            <p>
              Tor gives you more privacy when running your Bitcoin and Lightning Node, but there are some things to know in order to keep running your node smoothly on Tor.
              Check out our <a class="blue" href="https://blog.keys.casa/node-tutorial-running-your-casa-node-on-tor/" target="_blank" rel="noopener">explainer post to learn more</a>.
            </p>
          </div>
        </div>

        <hr>

        <h4>Sats App and Dashboard Connection</h4>

        <div class="columns">
          <div class="column is-half">
            <strong>Local Dashboard IP Address</strong>

            <div class="copyable" :class="{ copied: lastCopy === 'local'}"
                v-clipboard:copy="system.localAddress"
                @click="clickedCopy('local')">
              {{ system.localAddress }}
            </div>

            <p>Access your Casa node from your home network.</p>
          </div>

          <div class="column is-half">
            <strong>Sats App &amp; Tor Dashboard Address</strong>

            <template v-if="system.settings.bitcoind.bitcoindTor || system.settings.lnd.lndTor">
              <template v-if="loading.system">
                <div class="loading-dots"></div>
              </template>

              <template v-else-if="system.torAddress">
                <div class="copyable" :class="{ copied: lastCopy === 'localTor'}"
                    v-clipboard:copy="system.torAddress"
                    @click="clickedCopy('localTor')">
                  {{ system.torAddress }}
                </div>

                <div class="links">
                  <a class="blue" @click="openTorAddressModal()">View Sats App QR Code</a>
                </div>

                <p class="description">
                  You can access your web dashboard from outside your home network using the <a href="https://www.torproject.org/" class="blue" target="_blank" rel="noopener">Tor browser</a> and the address above.
                </p>
              </template>

              <template v-else>
                <div class="copyable locked">
                  Restart Needed
                </div>

                <p class="description">
                  To fully activate your dashboard Tor address, we need to restart your node.
                  <a class="blue" @click="confirmShutdown()">Shutdown Now</a>
                </p>
              </template>
            </template>

            <template v-else>
              <p class="description">
                You can access your Node Dashboard outside your home network if you enable Bitcoin or Lightning Tor Connections above.
              </p>
            </template>
          </div>
        </div> <!-- .columns -->

        <hr>

        <h4>
          <img src="~assets/bitcoin.svg" alt="">
          Share Your Bitcoin Node
        </h4>

        <div class="columns">
          <div class="column is-half" v-visibility-change="visibilityChange">

            <strong>Bitcoin Node IP Address</strong>

            <template v-if="bitcoin.address.external">
              <div class="copyable" :class="{ copied: lastCopy === 'bitcoin'}"
                v-clipboard:copy="bitcoin.address.external"
                @click="clickedCopy('bitcoin')">
                {{ bitcoin.address.external }}:{{ system.settings.bitcoind.bitcoindPort || 8333 }}
              </div>

              <a class="blue" @click="openBitcoinPortModal()">Configure Port</a>
            </template>

            <template v-else>
              <div class="loading-dots"></div>
            </template>
          </div>

          <div class="column is-half">
            <strong>
              Enable Bitcoin Tor Connections

              <span class="field" :class="{'is-loading': loading.bitcoind}">
                <b-switch v-model="system.settings.bitcoind.bitcoindTor" @input="saveSettings('bitcoind')" type="is-info" :disabled="loading.bitcoind || loading.lnd" @click.native="displayWarningIfDisabled"></b-switch>
              </span>
            </strong>

            <template v-if="system.settings.bitcoind.bitcoindTor">
              <template v-if="loading.bitcoind">
                <p>Activating Tor mode. This typically takes a few minutes.</p>

                <div class="loading-dots"></div>
              </template>

              <template v-else>
                <div class="copyable" :class="{ copied: lastCopy === 'bitcoinTor'}"
                  v-clipboard:copy="bitcoin.address.tor"
                  @click="clickedCopy('bitcoinTor')">
                  {{ bitcoin.address.tor }}:{{ system.settings.bitcoind.bitcoindPort || 8333 }}
                </div>
              </template>
            </template>

            <template v-else>
              <template v-if="loading.bitcoind">
                <p>Deactivating Tor mode. This typically takes a few minutes.</p>

                <div class="loading-dots"></div>
              </template>

              <template v-else>
                <p class="description">
                  Enabling this allows you to run your Bitcoin node over Tor.
                  Soon you'll be able to run solely on Tor for maximum privacy.
                </p>
              </template>
            </template>
          </div>
        </div> <!-- .columns -->

        <hr>

        <h4>
          <img src="~assets/lightning.svg" alt="">
          Share Your Lightning Node
        </h4>

        <div class="columns">
          <div class="column is-half">
            <strong>Lightning Node IP Address</strong>

            <template v-if="system.settings.lnd.lndTor">
              <p>Disable Tor to connect via IP address.</p>
            </template>

            <template v-else>
              <template v-if="loading.lnd || !lightning.address.code">
                <div class="loading-dots"></div>

                <div class="links">
                  <a class="blue" @click="openLightningPortModal()">Configure Port</a>
                </div>
              </template>

              <template v-else>
                <div class="copyable" :class="{ copied: lastCopy === 'lightning'}"
                  v-clipboard:copy="lightning.address.code"
                  @click="clickedCopy('lightning')">
                  {{ lightning.address.code }}
                </div>

                <div class="links">
                  <a class="blue" @click="openLightningCodeModal()">View QR Code</a>
                  <a class="blue" @click="openLightningPortModal()">Configure Port</a>
                </div>
              </template>
            </template>
          </div>

          <div class="column is-half">
            <strong>
              Enable Lightning Tor Connections

              <span class="field" :class="{'is-loading': loading.lnd}">
                <b-switch v-model="system.settings.lnd.lndTor" @input="saveSettings('lnd')" type="is-info" :disabled="loading.bitcoind || loading.lnd" @click.native="displayWarningIfDisabled"></b-switch>
              </span>
            </strong>

            <template v-if="system.settings.lnd.lndTor">
              <template v-if="loading.lnd">
                <p>Activating Tor mode. This typically takes a few minutes.</p>

                <div class="loading-dots"></div>
              </template>

              <template v-else>
                <div class="copyable" :class="{ copied: lastCopy === 'lightningTor'}"
                  v-clipboard:copy="lightning.address.code"
                  @click="clickedCopy('lightningTor')">
                  {{ lightning.address.code }}
                </div>

                <div class="links">
                  <a class="blue" @click="openLightningCodeModal()">View QR Code</a>
                </div>
              </template>
            </template>

            <template v-else>
              <template v-if="loading.lnd">
                <p>Deactivating Tor mode. This typically takes a few minutes.</p>
              </template>

              <template v-else>
                <p class="description">
                  Enabling this allows you to run your Lightning node over Tor.
                </p>
              </template>
            </template>
          </div>
        </div> <!-- .columns -->
      </div> <!-- .app-content -->
    </div> <!-- .app-slideout -->

  </section>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import LightningData from '@/data/lightning';
import SystemData from '@/data/system';

import TorAddress from '@/components/Settings/Modals/TorAddress';
import LightningConnectionCode from '@/components/Lightning/Modals/ConnectionCode';
import LightningConnectionDetails from '@/components/Lightning/Modals/ConnectionDetails';
import BitcoinConnectionDetails from '@/components/Bitcoin/Modals/ConnectionDetails';
import ConfirmShutdown from '@/components/Settings/Alerts/ConfirmShutdown';

export default {
  name: 'Connections',

  data() {
    return {
      bitcoin: BitcoinData,
      lightning: LightningData,
      system: SystemData,
      lastCopy: '',
      loading: {
        bitcoind: false,
        lnd: false,
        system: false,
      }
    }
  },

  watch: {
    bitcoin: {
      deep: true,

      handler(bitcoin) {
        if(bitcoin.operational) {
          if(this.system.settings.bitcoind.bitcoindTor) {
            if(bitcoin.address.tor) {
              this.loading.bitcoind = false;
            } else {
              this.loading.bitcoind = true;
            }
          } else if(!this.system.settings.bitcoind.bitcoindTor) {
            this.loading.bitcoind = false;
          }
        }

        this.$forceUpdate();
      }
    },

    lightning: {
      deep: true,

      handler(lightning) {
        if(lightning.operational && lightning.address.code) {
          if(this.system.settings.lnd.lndTor) {
            if(lightning.address.code.includes('.onion')) {
              this.loading.lnd = false;
            } else {
              this.loading.lnd = true;
            }
          } else if(!this.system.settings.lnd.lndTor) {
            if(lightning.address.code.includes('.onion')) {
              this.loading.lnd = true;
            } else {
              this.loading.lnd = false;
            }
          }
        }

        this.$forceUpdate();
      }
    },

    system: {
      deep: true,

      handler(system) {
        if((system.settings.bitcoind.bitcoindTor || system.settings.lnd.lndTor) && system.torAddress) {
          this.loading.system = false;
        }

        this.$forceUpdate();
      }
    }
  },

  created() {
    // Automatically refresh bitcoin and lnd data so we can watch for IP address updates
    EventBus.$emit('load-bitcoin-stats');
    EventBus.$emit('load-lightning-stats');
    EventBus.$emit('load-system-addresses');

    if(this.bitcoin.isLoading) {
      this.loading.bitcoind = true;
      this.loading.system = true;
    }

    if(this.lightning.isLoading) {
      this.loading.lnd = true;
      this.loading.system = true;
    }
  },

  destroyed() {
    EventBus.$emit('stop-bitcoin-stats');
    EventBus.$emit('stop-lightning-stats');
    EventBus.$emit('stop-system-addresses');
  },

  methods: {
    closePanel() {
      this.$emit('closePanel');
      this.$destroy();
    },

    visibilityChange(evt, hidden) {
        if (hidden) {
           EventBus.$emit('stop-bitcoin-stats');
           EventBus.$emit('stop-lightning-stats');
           EventBus.$emit('stop-system-addresses');
        } else {
           EventBus.$emit('load-bitcoin-stats');
           EventBus.$emit('load-lightning-stats');
           EventBus.$emit('load-system-addresses');
        }
    },

    openLightningCodeModal() {
      this.$modal.open({parent: this, component: LightningConnectionCode, hasModalCard: true, props: {lnAddress: this.lightning.address}});
    },

    openLightningPortModal() {
      this.$modal.open({parent: this, component: LightningConnectionDetails, hasModalCard: true, props: {lnAddress: this.lightning.address}});
    },

    openBitcoinPortModal() {
      this.$modal.open({parent: this, component: BitcoinConnectionDetails, hasModalCard: true});
    },

    openTorAddressModal() {
      this.$modal.open({parent: this, component: TorAddress, hasModalCard: true});
    },

    async saveSettings(changed) {
      try {
        const data = {
          lndTor: this.system.settings.lnd.lndTor,
          bitcoindTor: this.system.settings.bitcoind.bitcoindTor,
        };

        this.loading[changed] = true;
        this.loading.system = true;

        // Hacks to prevent the unlock modal and rolling forward message from appearing
        // TODO: Come up with a better way of doing this?
        this.system.startingTor = true;
        this.bitcoin.operational = false;
        this.bitcoin.isLoading = true;
        this.lightning.operational = false;
        this.lightning.isUnlocking = true;
        this.lightning.isLoading = true;
        EventBus.$emit('refresh-dashboard');

        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
      } catch (error) {
        let errorMessage = error.response.data || 'Unable to save settings';
        this.$toast.open({duration: 10000, message: errorMessage, type: 'is-danger'});
      }
    },

    clickedCopy(copied) {
      this.lastCopy = copied;
    },

    displayWarningIfDisabled() {
      if(this.loading.lnd || this.loading.bitcoind) {
        this.$toast.open({duration: 10000, message: "Your Bitcoin and Lightning nodes are currently restarting. Please wait for both to come back online before changing this setting.", type: 'is-danger'});
      }
    },

    confirmShutdown() {
      this.$modal.open({parent: this, component: ConfirmShutdown, hasModalCard: true});
    },
  }
};
</script>
