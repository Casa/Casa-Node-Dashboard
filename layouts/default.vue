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
import updateEnv from '@/helpers/env';

export default {
  name: 'home',
  async beforeMount() { // perform runtime injection
    updateEnv(this);

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

<style>
html {
  overflow: auto;
}
</style>
