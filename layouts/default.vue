<template>
  <div>
    <section class="main-content columns">
      <no-ssr>
        <!-- this component will only be rendered on client-side -->
        <div class="container column is-12">
          <nuxt />
          <slideout-panel></slideout-panel>
        </div>
      </no-ssr>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'home',
  async beforeMount() { // perform runtime injection

    let url = this.$env.DEVICE_HOST;
    if (window.location.href.includes('.onion')) {
      url = this.$env.CASA_NODE_HIDDEN_SERVICE;
    }

    this.$env.API_MANAGER = `${url}:3000`;
    this.$env.API_LND = `${url}:3002`;
    this.$env.UPDATE_MANAGER = `${url}:3001`;
    this.$auth.strategies.local.options.endpoints.login = {
      url: `${this.$env.API_MANAGER}/v1/accounts/login`,
      method: 'post',
      propertyName: 'jwt'
    };
  },
  data() {
    return {}
  },
};
</script>
