<template>
  <div class="node-loading-wrap">
    <nuxt />
  </div>
</template>

<script>
import updateEnv from '@/helpers/env';

export default {
  name: 'loading',

  beforeMount() { // perform runtime injection
    updateEnv(this);
  }
};
</script>

<style>
html {
  overflow: hidden;
}

.node-loading-wrap {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #0a0525;
  display: flex;
  justify-content: center;
  align-content: center;
}
</style>
