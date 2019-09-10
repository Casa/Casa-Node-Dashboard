<template>
  <form @submit.prevent="shutdown()">
      <div class="alert modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Ready to shutdown?</p>
        </header>
        <section class="modal-card-body">
          <p>It's important to shut down before unplugging your node. Sudden power loss could cause your node to resync, which often takes several hours.</p><br>
          <p>Please enter your password to confirm the shutdown.</p><br>
          <b-field>
            <b-input type="password" v-model="password" placeholder="Enter password" required></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <a class="button cancel" type="button" @click="$parent.close()">Abort</a>
          <button class="button is-casa" type="submit">Confirm</button>
        </footer>
      </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import BitcoinData from '@/data/bitcoin';
import LightningData from '@/data/lightning';
import SystemData from '@/data/system';

export default {
  name: 'ConfirmShutdown',

  data() {
    return {
      bitcoin: BitcoinData,
      lightning: LightningData,
      system: SystemData,
      password: '',
    }
  },

  methods: {

    async shutdown() {
      const basicAuthConfig = {
        method: 'post',
        url: `${this.$env.API_MANAGER}/v1/device/shutdown`,
        auth: {username: 'user', password: this.password}
      };

      try {
        EventBus.$emit('loading-start');
        this.$snackbar.open({message:'Shutting down...', type:'is-success', position:'is-top', duration: 5000});

        // Prevent the rolling forward message from appearing
        this.system.shuttingDown = true;

        // Shutdown process is blocking
        await axios(basicAuthConfig);

        // Close Modal and Settings Panel
        this.$emit('close');
        EventBus.$emit('updating');

        // Redirect to shutdown screen after shutdown completes
        this.$router.push('/shutdown');
      } catch (err) {
        this.$snackbar.open({message:`Shutdown failed: ${err.response.data}`, type:'is-danger', position:'is-top', indefinite: true});
        this.system.shuttingDown = false;
      } finally {
        this.password = '';

        EventBus.$emit('loading-stop');
      }
    }

  }
};
</script>
