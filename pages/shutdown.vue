<template>
  <div class="node-loading">
    <img src="~assets/logo-casa-white.svg" alt="">

    <div class="loading-bar">
      <div class="loading-progress" :style="{ width: percent + '%' }"></div>
    </div>

    <div class="shutdown-status" v-if="!finished">
      Shutting down...
    </div>

    <div class="shutdown-status" v-else>
      It is now safe to unplug your node.
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import API from '@/helpers/api';

export default {
  layout: 'loading',

  data() {
    return {
      percent: 100,
      finished: false
    };
  },

  mounted() {
    // Animate the loading bar
    setTimeout(() => {
      this.percent = 0;
    }, 100);

    // Display "safe to unplug" message after 10 seconds
    setTimeout(() => {
      this.finished = true;
    }, 10000);
  },
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

.shutdown-status {
  margin-top: 3em;
  width: 470px;
  font-size: 28px;
  color: #fff;
}
</style>
