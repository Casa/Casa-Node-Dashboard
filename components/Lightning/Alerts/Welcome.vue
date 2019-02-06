<template>
  <form class="welcome" action="">
    <div class="alert-icon-container">
      <img src="~assets/hand.png" alt="Success">
    </div>
    <div class="alert modal-card" style="width: auto">
      <header class="modal-card-head"></header>
      <section class="modal-card-body">
        <h2>Welcome to Casa Node.</h2>
        <p>It will take a few hours to finish syncing. In the meantime, check out our tips on getting started with Lightning.</p>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" @click="$parent.close()">Not Now</a>
        <a class="button is-casa" href="https://keys.casa/node-help" target="_blank" rel="noopener">Lightning Tips</a>
      </footer>
    </div>
  </form>
</template>

<script>
import EventBus from '@/helpers/event-bus';

export default {
  name: 'Welcome',
  data() {
    return {}
  }
};
</script>
