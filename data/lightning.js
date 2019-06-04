import API from '@/helpers/api';
import IntervalBus from '@/helpers/interval-bus';
import EventBus from '@/helpers/event-bus';

const LightningData = {
  // API data
  unlocked: false,
  operational: false,
  currentBlock: 0,
  blockHeight: 0,
  balance: {
    confirmed: 0,
    pending: 0,
  },
  channels: [],
  maxPaymentOut: 0,
  maxPaymentIn: 0,
  pubkey: false,
  address: {},
  transactions: [],
  pending: [],

  // Application state
  isStarting: true,
  isLoading: true,
  isSynced: false,
  isSyncing: false,
  isUnlocking: false,
  isOnline: false,
};

let setupStartedTime;

// Variable to prevent requests from being made before setup and after teardown
let initialized = false;

// Functions for populating data from the API
const populate = {
  async status() {
    if(!initialized) return;

    const status = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/info/status`);

    if(status) {
      const responseTime = API.responseTime(`${this.$env.API_LND}/v1/lnd/info/status`);
      const bestInterval = IntervalBus.bestInterval(responseTime, 30);

      LightningData.operational = status.operational;
      LightningData.unlocked = status.unlocked;
      IntervalBus.set(populate.status, bestInterval);

      // Calculate the time since setup started
      const timeSinceSetupStarted = Date.now() - setupStartedTime;
      let enoughTimeToUnlock = false;

      // 15 Seconds should be enough time to unlock lnd from a Raspberry Pi 3B+
      if(timeSinceSetupStarted > 15000) {
        enoughTimeToUnlock = true;
      }

      // Lnd will be unlocking in the background as soon as the dashboard loads. We only need to display the unlock
      // modal if something has gone wrong. rp
      if(!status.unlocked && status.operational && !LightningData.isUnlocking && enoughTimeToUnlock) {
        LightningData.isUnlocking = true;

        // TODO: Use updated lifecycle method in the index?
        this.unlockModal();

        // Update the lnd status every 10 seconds while unlocking
        IntervalBus.set(populate.status, 10);
      }

      // Check the syncing status immediately since lightning is operational
      if(LightningData.operational && (LightningData.percent !== '1.0000' || LightningData.isLoading)) {
        populate.sync.call(this);
      }
    } else {
      IntervalBus.set(populate.status, 10);
    }
  },

  async sync() {
    if(!initialized) return;

    if(LightningData.operational && LightningData.unlocked) {
      const sync = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/info/sync`);

      if(sync) {
        const responseTime = API.responseTime(`${this.$env.API_LND}/v1/lnd/info/sync`);
        const bestInterval = IntervalBus.bestInterval(responseTime);
        const longestInterval = IntervalBus.longestInterval();

        LightningData.percent = sync.percent;
        LightningData.currentBlock = sync.processedBlocks;
        LightningData.blockHeight = sync.knownBlockCount;

        if(sync.status && sync.status === 'calibrating') {
          LightningData.isStarting = true;
          IntervalBus.set(populate.sync, bestInterval);
        } else if(sync.percent === '1.0000') {
          LightningData.isSynced = true;
          LightningData.isSyncing = false;
          LightningData.isStarting = false;
          IntervalBus.set(populate.sync, longestInterval);
        } else {
          LightningData.isSynced = false;
          LightningData.isSyncing = true;
          LightningData.isStarting = false;
          IntervalBus.set(populate.sync, bestInterval);
        }

        LightningData.isLoading = false
      } else {
        // Clear the interval and wait for the previous connection to load
        IntervalBus.clear(populate.sync);
      }
    } else {
      IntervalBus.set(populate.sync, 10);
    }
  },

  async channels() {
    if(!initialized) return;

    if(LightningData.operational && LightningData.unlocked) {
      // Get lightning channel settings
      const lightning = await API.get(this.$axios, `${this.$env.API_LND}/v1/pages/lnd`);

      if(lightning) {
        const {externalIP, balance, channels, lightningInfo} = lightning;

        LightningData.balance = {
          confirmed: parseInt(balance.channel.balance),
          pending: 0,
        };

        LightningData.channels = [];

        // Loop through channels to determine pending balance, max payment amount, and sort channels by type
        channels.forEach((channel) => {
          const localBalance = parseInt(channel.localBalance) || 0;
          const remoteBalance = parseInt(channel.remoteBalance) || 0;

          if (channel.type === 'OPEN') {
            channel.status = 'open';

            if(remoteBalance > LightningData.maxPaymentIn) {
              LightningData.maxPaymentIn = remoteBalance;
            }

            if(localBalance > LightningData.maxPaymentOut) {
              LightningData.maxPaymentOut = localBalance;
            }
          } else if (['WAITING_CLOSING_CHANNEL', 'FORCE_CLOSING_CHANNEL', 'PENDING_CLOSING_CHANNEL', 'PENDING_OPEN_CHANNEL'].indexOf(channel.type) > -1) {
            LightningData.balance.pending += localBalance;
            channel.status = 'pending';
          } else {
            channel.status = 'unknown';
          }

          LightningData.channels.push(channel);
        });

        // If lnd detected our external IP, we are online
        if(externalIP.length) {
          LightningData.isOnline = true;
        }

        // Determine lightning connection code
        if(lightningInfo.uris.length) {
          LightningData.address.code = lightningInfo.uris[0];
          LightningData.address.autoGenerated = true;

          if(LightningData.address.code.includes('.onion')) {
            LightningData.address.onion = true;
          } else {
            LightningData.address.onion = false;
          }
        } else {
          LightningData.address.code = lightningInfo.identityPubkey + '@' + externalIP[0];
          LightningData.address.autoGenerated = false;
        }

        LightningData.address.ip = externalIP[0];
        LightningData.pubkey = lightningInfo.identityPubkey;
      }
    }
  },

  async transactions() {
    if(!initialized) return;

    if(LightningData.operational && LightningData.unlocked) {
      // Get invoices and payments
      const invoices = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/lightning/invoices`);
      const payments = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/lightning/payments`);

      // Loop through invoices and payments to determine which are pending and completed
      if(invoices && payments) {
        // Clear out existing data
        LightningData.transactions = [];
        LightningData.pending = [];

        invoices.forEach((invoice) => {
          if(invoice.settled) {
            LightningData.transactions.push(invoice);
          } else {
            // If this invoice hasn't expired
            if(parseInt(invoice.creationDate) + parseInt(invoice.expiry) > new Date().getTime() / 1000) {
              LightningData.pending.push(invoice);
            }
          }
        });

        payments.forEach((payment) => {
          // Payments should be negative to match the display of BTC transactions
          payment.value *= -1;
          LightningData.transactions.push(payment);
        });

        // Sort the transactions by date now that invoices and payments been combined
        LightningData.transactions.sort(sortTransactions);
      }
    }
  },
};

// Helper function to sort lightning transactions by date
function sortTransactions(a, b) {
  if (a.creationDate > b.creationDate) {
    return -1;
  }

  if (a.creationDate < b.creationDate) {
    return 1;
  }

  return 0;
}

// We need the scope of a Vue component to get the JWT for making API calls
function LightningSetup(scope) {
  // Record the time setup started
  setupStartedTime = Date.now();

  // Give the IntervalBus access to this.$axios for the JWT
  IntervalBus.scope(scope);
  initialized = true;

  // Immediately start populating data
  populate.status.call(scope);

  // Bind event handlers
  EventBus.$on('load-lightning-stats', (options = {autoupdate: true}) => {
    populate.channels.call(scope);

    if(options.autoupdate) {
      IntervalBus.set(populate.channels, 30);
    }
  });

  EventBus.$on('stop-lightning-stats', () => {
    IntervalBus.clear(populate.channels);
  });

  EventBus.$on('load-lightning-transactions', (options = {autoupdate: true}) => {
    populate.transactions.call(scope);

    if(options.autoupdate) {
      IntervalBus.set(populate.transactions, 10);
    }
  });

  EventBus.$on('stop-lightning-transactions', () => {
    IntervalBus.clear(populate.transactions);
  });
}

function LightningTeardown() {
  initialized = false;

  // Make sure every function stops auto-updating
  IntervalBus.clear(populate.status);
  IntervalBus.clear(populate.sync);
  IntervalBus.clear(populate.channels);
  IntervalBus.clear(populate.transactions);

  // Remove event bindings
  EventBus.$off('load-lightning-stats');
  EventBus.$off('stop-lightning-stats');
  EventBus.$off('load-lightning-transactions');
  EventBus.$off('stop-lightning-transactions');
}

export default LightningData;
export { LightningSetup, LightningTeardown };
