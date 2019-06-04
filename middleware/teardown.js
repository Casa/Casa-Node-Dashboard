import BitcoinData, { BitcoinSetup, BitcoinTeardown } from '@/data/bitcoin';
import LightningData, { LightningSetup, LightningTeardown } from '@/data/lightning';
import SystemData, { SystemSetup, SystemTeardown } from '@/data/system';

export default async function (context) {
  // Make sure we aren't still trying to make API calls for the dashboard after navigating to another page
  BitcoinTeardown();
  LightningTeardown();
  SystemTeardown();
}
