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
            <b-input type="password" v-model="data.password" placeholder="Enter password" required></b-input>
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

export default {
  name: 'ConfirmShutdown',

  data() {
    return {
      data: {
        password: '',
        isLoading: false
      }
    }
  },

  methods: {

    async shutdown() {
      const basicAuthConfig = {
        method: 'post',
        url: `${this.$env.API_MANAGER}/v1/device/shutdown`,
        auth: {username: 'user', password: this.data.password}
      };

      try {
        this.data.isLoading = true;
        EventBus.$emit('loading-start');

        this.$snackbar.open({message:'Shutting down...', type:'is-success', position:'is-top', duration: 5000});

        // Shutdown process is blocking
        await axios(basicAuthConfig);

        // Close Modal and Settings Panel
        this.$emit('close');
        EventBus.$emit('updating');

        this.$snackbar.open({message:'It is now safe to unplug your node', type:'is-success', position:'is-top', indefinite: true});
      } catch (err) {
        this.$snackbar.open({message:`Shutdown failed: ${err.response.data}`, type:'is-danger', position:'is-top', indefinite: true});
      } finally {
        this.data.isLoading = false;
        this.data.password = '';

        EventBus.$emit('loading-stop');
      }
    }

  }
};
</script>
