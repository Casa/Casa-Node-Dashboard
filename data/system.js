import API from '@/helpers/api';
import IntervalBus from '@/helpers/interval-bus';
import EventBus from '@/helpers/event-bus';

const SystemData = {
  isLoading: true,
  updatesAvailable: 0,
  container: {},
  settings: {bitcoind: {}, lnd: {}},
  resync: null,
  status: {},
  localAddress: false,
  torAddress: false,
  displayUnit: 'btc',
  version: {},
};

// Variable to prevent requests from being made before setup and after teardown
let initialized = false;

// Object to track which functions have loaded
const loaded = {};

// Functions for populating data from the API
const populate = {
  async containers() {
    if(!initialized) return;

    const healthCall = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/telemetry/status`);

    if(healthCall) {
      healthCall.containers.forEach(container => {
        SystemData.container[container.service] = container.status;
      });

      if(!loaded.containers) {
        loaded.containers = true;

        // Check container status every 5 minutes by default
        IntervalBus.set(populate.containers, 300);
      }
    } else if(!loaded.containers) {
      // There was an error? Try to refresh
      IntervalBus.set(populate.containers, 10);
    }
  },

  async disk() {
    if(!initialized) return;

    const data = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/telemetry/volumes`);

    if(data) {
      var totalBytesUsed = data.reduce(function(prev, cur) {
        return prev + cur.usage;
      }, 0);

      SystemData.diskUsed = this.bytesToSize(totalBytesUsed);
      SystemData.isLoading = false;

      if(!loaded.disk) {
        loaded.disk = true;
        IntervalBus.set(populate.disk, 300);
      }
    } else if(!loaded.disk) {
      IntervalBus.set(populate.disk, 10);
    }
  },

  async updates() {
    if(!initialized) return;

    const containers = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/telemetry/version`);

    if(containers) {
      const containerCollection = Object.keys(containers).map(i => containers[i]);
      const updates = containerCollection.filter(x => x.updatable === true);
      SystemData.updatesAvailable = updates.length;

      if(!loaded.updates) {
        loaded.updates = true;
        IntervalBus.set(populate.updates, 3600);
      }
    } else if(!loaded.updates) {
      IntervalBus.set(populate.updates, 10);
    }
  },

  async settings() {
    if(!initialized) return;

    const settings = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/settings/read`);

    if(settings) {
      SystemData.settings = settings;

      if(settings.system && settings.system.systemDisplayUnits) {
        SystemData.displayUnit = settings.system.systemDisplayUnits;
      }
    }
  },

  async status() {
    if(!initialized) return;

    const status = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/telemetry/system-status`);

    if(status) {
      if(status.resync !== undefined && status.resync === true) {
        // Automatically refresh the system status when resync is true during initialization (user refreshed the page during a resync)
        if(SystemData.resync === null) {
          EventBus.$emit('load-system-stats');
        }

        SystemData.resync = true;
        SystemData.status = status;
      } else {
        SystemData.resync = false;
      }
    }
  },

  async addresses() {
    if(!initialized) return;

    const addresses = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/telemetry/addresses`);

    if(addresses) {
      addresses.forEach(address => {
        if(address.includes('.onion')) {
          SystemData.torAddress = address;
        } else {
          SystemData.localAddress = address;
        }
      });
    }
  },

  async versions() {
    if(!initialized) return;

    const bitcoind = await API.get(this.$axios, `${this.$env.API_LND}/v1/bitcoind/info/version`);
    const lnd = await API.get(this.$axios, `${this.$env.API_LND}/v1/lnd/info/version`);

    if(bitcoind) {
      SystemData.version.bitcoind = bitcoind.version;
      EventBus.$emit('load-version');
    }

    if(lnd) {
      SystemData.version.lnd = lnd.version;
      EventBus.$emit('load-version');
    }

    if(!bitcoind || !lnd) {
      IntervalBus.set(populate.versions, 10);
    } else {
      IntervalBus.clear(populate.versions);
    }
  }
};

// We need the scope of a Vue component to get the JWT for making API calls
function SystemSetup(scope) {
  // Give the IntervalBus access to this.$axios for the JWT
  IntervalBus.scope(scope);
  initialized = true;

  // Immediately start populating data
  populate.containers.call(scope);
  populate.updates.call(scope);
  populate.settings.call(scope);
  populate.status.call(scope);
  populate.addresses.call(scope);
  populate.versions.call(scope);

  // Set a timeout to avoid race condition
  setTimeout(() => {
    populate.disk.call(scope);
  }, 2000);

  // Bind event handlers
  EventBus.$on('load-system-stats', (options = {autoupdate: true}) => {
    populate.status.call(scope);
    populate.disk.call(scope);

    if(options.autoupdate) {
      IntervalBus.set(populate.status, 10);
      IntervalBus.set(populate.disk, 60);
    }
  });

  EventBus.$on('stop-system-stats', () => {
    IntervalBus.clear(populate.status);
    IntervalBus.clear(populate.disk);
  });

  EventBus.$on('load-system-addresses', (options = {autoupdate: true}) => {
    populate.addresses.call(scope);

    if(options.autoupdate) {
      IntervalBus.set(populate.addresses, 30);
    }
  });

  EventBus.$on('stop-system-addresses', () => {
    IntervalBus.clear(populate.addresses);
  });
}

function SystemTeardown() {
  initialized = false;
  IntervalBus.clear(populate.containers);
  IntervalBus.clear(populate.disk);
  IntervalBus.clear(populate.updates);
  IntervalBus.clear(populate.settings);

  // Remove event bindings
  EventBus.$off('load-system-stats');
  EventBus.$off('stop-system-stats');
  EventBus.$off('stop-system-addresses');
  EventBus.$off('stop-system-addresses');
}

export default SystemData;
export { SystemSetup, SystemTeardown };
