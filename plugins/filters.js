import Vue from 'vue';
import VueNumeric from 'vue-numeric'
import {BigNumber} from 'bignumber.js';

// Convert Satoshis to Bitcoin
Vue.filter('btc', val => {
  // Never display numbers as exponents
  BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
  const sats = new BigNumber(val);
  const btc = sats.dividedBy(100000000);

  if(isNaN(btc)) {
    return 0;
  }

  return btc.decimalPlaces(8).toString();
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
