import axios from 'axios';
import API from '@/helpers/api';
import IntervalBus from '@/helpers/interval-bus';
import EventBus from '@/helpers/event-bus';
import LightningData from '@/data/lightning';

// Default values for all possible bitcoin data
const BitcoinData = {
  // API data
  operational: null,
  currentBlock: 0,
  blockHeight: 0,
  address: {},
  connections: {},
  wallet: {},
  transactions: [],
  pending: [],
  price: 0,

  // Application state
  isLoading: true,
  isStarting: false,
  isSynced: false,
  isSyncing: false,
  isRollingForward: false,
};

// Variable to prevent requests from being made before setup and after teardown
let initialized = false;

// Functions for populating data from the API
const populate = {
  async status() {
    const status = await API.get(this.$axios, `${this.$env.API_LND}/v1/bitcoind/info/status`);

    if(status) {
      const responseTime = API.responseTime(`${this.$env.API_LND}/v1/bitcoind/info/status`);
      const bestInterval = IntervalBus.bestInterval(responseTime, 60);

      BitcoinData.operational = status.operational;
      IntervalBus.set(populate.status, bestInterval);

      // Check the syncing status immediately since bitcoin is operational
      if(BitcoinData.operational && (BitcoinData.percent !== '1.0000' || BitcoinData.isLoading)) {
        populate.sync.call(this);
      }
    } else {
      IntervalBus.set(populate.status, 30);
    }
  },

  async sync() {
    if(!initialized) return;

    if(BitcoinData.operational) {
      const sync = await API.get(this.$axios, `${this.$env.API_LND}/v1/bitcoind/info/sync`);

      if(sync) {
        const responseTime = API.responseTime(`${this.$env.API_LND}/v1/bitcoind/info/sync`);
        const bestInterval = IntervalBus.bestInterval(responseTime);
        const longestInterval = IntervalBus.longestInterval();

        BitcoinData.percent = sync.percent || BitcoinData.percent;
        BitcoinData.currentBlock = sync.currentBlock || BitcoinData.currentBlock;
        BitcoinData.blockHeight = sync.headerCount || BitcoinData.blockHeight;
        BitcoinData.isLoading = false;

        // bitcoind is operational, but still starting up
        if(sync.status && sync.status === 'calibrating') {
          BitcoinData.isStarting = true;
          IntervalBus.set(populate.sync, bestInterval);

        // bitcoind is operational, fully started up, and synced
        } else if(sync.percent === '1.0000') {
          BitcoinData.isSynced = true;
          BitcoinData.isSyncing = false;
          BitcoinData.isStarting = false;
          IntervalBus.set(populate.sync, longestInterval);

        // bitcoind is operational, fully started up, but still syncing the chain
        } else {
          BitcoinData.isSynced = false;
          BitcoinData.isSyncing = true;
          BitcoinData.isStarting = false;
          IntervalBus.set(populate.sync, bestInterval);
        }
      } else {
        // Clear the interval and wait for the previous connection to load
        IntervalBus.clear(populate.sync);
      }
    } else {
      BitcoinData.isStarting = true;
      IntervalBus.set(populate.sync, 30);
    }
  },

  async addresses() {
    if(!initialized) return;

    if(BitcoinData.operational) {
      const addresses = await API.get(this.$axios, `${this.$env.API_LND}/v1/bitcoind/info/addresses`);

      if(addresses) {
        addresses.forEach(address => {
          if(address.includes('.onion')) {
            BitcoinData.address.tor = address;
          } else {
            BitcoinData.address.external = address;
          }
        });
      }
    }
  },

  async connections() {
    if(!initialized) return;

    if(BitcoinData.operational) {
      const connections = await API.get(this.$axios, `${this.$env.API_LND}/v1/bitcoind/info/connections`);

      if(connections) {
        BitcoinData.connections = connections;
      }
    }
  },

  async balance() {
    if(!initialized) return;

    if(BitcoinData.operational && LightningData.operational && LightningData.unlocked) {
      const balance = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/wallet/btc`);

      if(balance) {
        BitcoinData.wallet = balance;
      }
    }
  },

  async transactions() {
    if(!initialized) return;

    if(BitcoinData.operational && LightningData.operational && LightningData.unlocked) {
      const transactions = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/transaction`);

      if(transactions) {
        // Clear previously loaded data
        BitcoinData.transactions = [];
        BitcoinData.pending = [];

        // Loop through transactions and sort them by type
        transactions.forEach((transaction) => {
          // Only display Bitcoin transactions
          if(transaction.type === 'ON_CHAIN_TRANSACTION_SENT' || transaction.type === 'ON_CHAIN_TRANSACTION_RECEIVED') {
            if(transaction.numConfirmations > 0) {
              BitcoinData.transactions.push(transaction);
            } else {
              BitcoinData.pending.push(transaction);
            }
          }
        });
      }
    }
  },

  async price() {
    // TODO: Make an API helper method for unauthenticated calls?
    const {data: {USD}}  = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD');

    if(USD) {
      BitcoinData.price = USD;
    }
  }
};

// We need the scope of a Vue component to get the JWT for making API calls
function BitcoinSetup(scope) {
  // Give the IntervalBus access to this.$axios for the JWT
  IntervalBus.scope(scope);
  initialized = true;

  // Immediately start populating data
  populate.status.call(scope);

  // Bind event handlers
  EventBus.$on('load-bitcoin-stats', (options = {autoupdate: true}) => {
    populate.addresses.call(scope);
    populate.connections.call(scope);

    if(options.autoupdate) {
      IntervalBus.set(populate.addresses, 30);
      IntervalBus.set(populate.connections, 30);
    }
  });

  EventBus.$on('stop-bitcoin-stats', () => {
    IntervalBus.clear(populate.connections);
  });

  EventBus.$on('load-bitcoin-transactions', (options = {autoupdate: true}) => {
    populate.balance.call(scope);
    populate.transactions.call(scope);
    populate.price.call(scope);

    if(options.autoupdate) {
      IntervalBus.set(populate.balance, 60);
      IntervalBus.set(populate.transactions, 60);
      IntervalBus.set(populate.price, 3600);
    }
  });

  EventBus.$on('stop-bitcoin-transactions', () => {
    IntervalBus.clear(populate.balance);
    IntervalBus.clear(populate.transactions);
    IntervalBus.clear(populate.price);
  });
}

function BitcoinTeardown() {
  initialized = false;

  // Make sure every function stops auto-updating
  IntervalBus.clear(populate.status);
  IntervalBus.clear(populate.sync);
  IntervalBus.clear(populate.addresses);
  IntervalBus.clear(populate.connections);
  IntervalBus.clear(populate.transactions);

  // Remove event bindings
  EventBus.$off('load-bitcoin-stats');
  EventBus.$off('stop-bitcoin-stats');
  EventBus.$off('load-bitcoin-transactions');
  EventBus.$off('stop-bitcoin-transactions');
}

export default BitcoinData;
export { BitcoinSetup, BitcoinTeardown };
