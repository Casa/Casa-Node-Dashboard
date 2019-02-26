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
  async beforeCreate() { // perform runtime injection
    this.$env.API_MANAGER = `${this.$env.DEVICE_HOST}:3000`;
    this.$env.API_LND = `${this.$env.DEVICE_HOST}:3002`;
    this.$env.UPDATE_MANAGER = `${this.$env.DEVICE_HOST}:3001`;
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
