import Vue from 'vue';
import VueNumeric from 'vue-numeric'
import {satsToBtc, btcToSats, formatSats} from '@/helpers/units';
import BitcoinData from '@/data/bitcoin';
import SystemData from '@/data/system';

// Convert Satoshis to Bitcoin
Vue.filter('btc', value => satsToBtc(value));

// Convert Bitcoin to Satoshis
Vue.filter('sats', value => btcToSats(value));

// Convert Satoshis to USD
Vue.filter('usd', value => (satsToBtc(value) * BitcoinData.price).toFixed(2));

// Display value in whatever unit that user has selected
Vue.filter('inUnits', value => {
  if(SystemData.displayUnit === 'btc') {
    return satsToBtc(value);
  } else if(SystemData.displayUnit === 'sats') {
    return formatSats(value);
  }

  // Something must have gone wrong?
  return 0;
});

// Display the currently selected unit as a suffix
Vue.filter('withSuffix', value => {
  if(SystemData.displayUnit === 'btc') {
    return value + ' BTC';
  } else if(SystemData.displayUnit === 'sats') {
    return value + ' sats';
  }

  return value;
});

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
