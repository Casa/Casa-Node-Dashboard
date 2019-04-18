import Vue from 'vue';
import VueNumeric from 'vue-numeric'
import {satsToBtc, btcToSats} from '@/helpers/units';
import BitcoinData from '@/data/bitcoin';

// Convert Satoshis to Bitcoin
Vue.filter('btc', value => satsToBtc(value));

// Convert Bitcoin to Satoshis
Vue.filter('sats', value => btcToSats(value));

// Convert Satoshis to USD
Vue.filter('usd', value => (satsToBtc(value) * BitcoinData.price).toFixed(2));

/**
 * Vue filter to convert the given value to percent.
 *
 * @param {String} value    The value string.
 * @param {Number} decimals The number of decimal places.
 */
Vue.filter('percentage', function(value, decimals) {
  if(!value) {
    value = 0;
  }

  if(!decimals) {
    decimals = 0;
  }

  value = value * 100;
  value = Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  value = value + '%';
  return value;
});

Vue.use(VueNumeric);
