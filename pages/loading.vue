<template>
  <div class="node-loading">
    <img src="~assets/logo-casa-white.svg" alt="Casa Logo">

    <div class="loading-bar">
      <div class="loading-progress" :style="{ width: percent + '%' }"></div>
    </div>

    <div class="loading-error" v-if="error">
      Having trouble? Contact help@team.casa with questions.

      <a class="button" @click="ignoreLoading">View Dashboard</a>
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

    // If we have been on the loading screen for longer than 5 minutes, something is probably wrong
    setTimeout(() => {
      this.error = true;
    }, 5 * 60 * 1000);
  },

  destroyed() {
    clearInterval(loadingInterval);
  },

  data() {
    return {
      percent: 1, // Always give the user a little something to see
      error: false,
    };
  },

  methods: {
    async getLoadingPercent() {
      const loading = await API.get(axios, `${this.$env.API_MANAGER}/v1/telemetry/boot`);

      // If the API returns a lower boot percent than we already had, something is probably wrong
      if(this.percent > loading.percent) {
        this.error = true;
      }

      this.percent = loading.percent;

      if(loading && parseInt(this.percent) === 100) {
        // Make sure we only redirect once
        if(!redirectTimeout) {
          // Wait 10 seconds to let the animation finish
          redirectTimeout = setTimeout(() => {
            this.$router.push('/');
          }, 10000);
        }
      }
    },

    ignoreLoading() {
      sessionStorage.setItem('loading', 'ignored');
      this.$router.push('/');
    },
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
