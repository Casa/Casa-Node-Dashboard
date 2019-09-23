<template>
  <div class="node-loading">
    <img src="~assets/logo-casa-white.svg" alt="">

    <div class="loading-bar">
      <div class="loading-progress" :style="{ width: percent + '%' }"></div>
    </div>

    <div class="loading-error">
      Changing your password will take about a minute to complete.
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import API from '@/helpers/api';

let loadingInterval;
let redirectTimeout;

export default {
  layout: 'loading',

  created() {
    // Immediately check the node boot status
    this.getLoadingPercent();

    // Periodically check for updates
    loadingInterval = setInterval(this.getLoadingPercent, 5000);
  },

  destroyed() {
    clearInterval(loadingInterval);
  },

  data() {
    return {
      percent: 1, // Always give the user a little something to see
    };
  },

  methods: {
    async getLoadingPercent() {
      const loading = await API.get(this.$axios, `${this.$env.API_MANAGER}/v1/accounts/changePassword/status`);

      if(loading) {
        this.percent = loading.percent;

        if(loading.forbidden) {
          this.$router.push({path: 'change-password', query: { forbidden: true }});
        } else if(loading.error) {
          this.$router.push({path: 'change-password', query: { error: true }});
        } else if(parseInt(this.percent) === 100) {
          // Clear session variable after password has been changed
          sessionStorage.removeItem('basicAuth');

          // Make sure we only redirect once
          if(!redirectTimeout) {
            // Wait 10 seconds to let the animation finish
            redirectTimeout = setInterval(() => {
              clearInterval(redirectTimeout);
              this.$router.push('/');
            }, 10000);
          }
        }
      }
    }
  }
}
</script>

<style>
.node-loading {
  align-self: center;
  text-align: center;
}

.node-loading img {
  margin-bottom: 6em;
}

.loading-bar {
  width: 300px;
  margin: 0 85px;
  height: 3px;
  background-color: #3e3b53;
}

.loading-progress {
  height: 3px;
  background-color: #865efc;
  transition: width 10s;
}

.loading-error {
  margin-top: 3em;
  width: 470px;
  font-size: 28px;
  color: #fff;
}

.loading-error .button {
  border: 2px solid #3e3b53;
  background-color: transparent;
  font-weight: bold;
  color: #fff;
  font-size: 18px;
  margin-top: 2em;
  padding: 1.5em 4.5em;
}
</style>
