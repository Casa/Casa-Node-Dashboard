<template>
  <form action="caution" class="resync">
    <div class="alert-icon-container">
      <img src="~assets/red-excl.svg" alt="">
    </div>
    <div class="alert modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Are you sure?</p>
      </header>
      <section class="modal-card-body">
        <p><b>WARNING: DO NOT DO THIS UNLESS INSTRUCTED BY CASA SUPPORT.</b></p>
        <p>This will wipe your wallet data and you will lose funds if you don't do this correctly.</p>
        <br>
        <p>If you have funds on the Node:</p>
        <br>
        <ul>
          <li>- Close all channels with funds in them.</li>
          <li>- Wait for the BTC to appear in your on chain wallet.</li>
          <li>- Recommended to transfer all on chain BTC to a different wallet.</li>
          <li>- Make sure you have your seed phrase.</li>
        </ul>
        <br>
        <p>
          After wiping and factory resetting the device, you will get a new seed phrase and will need to resync the Lightning Network. This should take 2-3 hours. Make sure to contact Casa support before taking this action.
        </p>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Cancel</a>
        <a class="button is-casa" type="button" @click="confirm()">I understand, reset device</a>
      </footer>
    </div>
  </form>
</template>

<script>
import EventBus from '@/helpers/event-bus';

export default {
  name: 'ConfirmFactoryReset',
  data() {
    return {}
  },
  methods: {
    confirm() {
      this.$emit('close');
      EventBus.$emit('factory-reset');
    }
  }
};
</script>
