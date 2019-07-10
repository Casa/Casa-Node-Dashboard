<template>
  <form class="deposit" action="">
    <div class="alert alert-status modal-card connection-details">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Public Dashboard Tor Address
        </p>
      </header>
      <section class="modal-card-body">
        <div class="address-info">
          <div class="address-info-left">
            <template v-if="system.torAddress">
              <p>Scan this QR code with the Sats app to access your Casa Node remotely. Note: The QR does not currently display in the Tor browser - this will be fixed in the next update.</p>

              <div class="qr-code" v-clipboard:copy="system.torAddress">
                <qr-code :text="system.torAddress" size="320"></qr-code>
                <p>{{system.torAddress}}</p>
              </div>
            </template>

            <template v-else>
              <p>You must have Tor enabled to access your Casa Node from outside your home network.</p>
            </template>
          </div>
          <br>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-gray" type="button" @click="$parent.close()">
          Close
        </a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import SystemData from '@/data/system';

export default {
  name: 'TorAddress',

  data() {
    return {
      system: SystemData,
    }
  }
};
</script>
