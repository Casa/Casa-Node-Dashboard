<template>
  <div class="restart-container">
    <div class="please-restart">
      <img @click="redirect()" src="~assets/logo-casa-white.svg" alt="">

      <div class="intro-container">
        <div class="intro-form">
          <span class="intro-heading">Please restart to apply new updates.</span><br>
          <span class="intro-text">We've downloaded some new software updates for you. Please restart your node by unplugging it to apply the updates.</span><br>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import API from '@/helpers/api';


export default {
  layout: 'intro',

  methods: {
    redirect() {
      this.$router.push('/intro');
    }
  }
}
</script>

<style>
.please-restart {
  text-align: center;
}

.restart-container .intro-container {
  max-width: 900px;
}

.restart-container .intro-text {
  max-width: 700px;
}

.restart-container img {
  margin-bottom: 2em;
}

.restart-container {
  height:100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
