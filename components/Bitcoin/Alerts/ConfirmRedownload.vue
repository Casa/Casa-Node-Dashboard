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
        <p><b>Only do this if instructed by Casa support.</b><br> This will take about half a day to finish syncing.</p>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="confirm()">Yes, Sync from Casa</a>
      </footer>
    </div>
  </form>
</template>

<script>
import EventBus from '@/helpers/event-bus';

export default {
  name: 'ConfirmRedownload',
  data() {
    return {}
  },
  methods: {
    confirm() {
      this.$emit('close');
      EventBus.$emit('redownload');
    }
  }
};
</script>
