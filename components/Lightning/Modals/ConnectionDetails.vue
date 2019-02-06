<template>
  <form @submit.prevent="validate()">
    <div class="generic-modal alert alert-status modal-card connection-details">
      <header class="modal-card-head">Your Connection Details</header>
      <section class="modal-card-body">
        <p>If you've set up port forwarding, you need to tell the Lightning Network your node connection details. This makes your node visible in explorers and to others on the network.</p>

        <p>Please enter the external IP address and port that you opened in your router settings.</p>

        <strong>Connection Details</strong>

        <div class="columns">
          <div class="column is-three-quarters">
            <div class="field">
              <p class="control">
                <input type="text" class="input" placeholder="IP Address" :class="{ 'is-danger': errors.has('ip')}" name="ip" v-model="ip" v-validate="'required'">
              </p>
            </div>
          </div>

          <div class="column is-one-quarter">
            <div class="field">
              <p class="control">
                <input type="text" class="input" placeholder="Port" :class="{ 'is-danger': errors.has('port')}" name="port" v-model="port" v-validate="'integer'">
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-gray" type="button" @click="$parent.close()">
          Close
        </a>

        <button class="button is-casa" type="submit">
          Save and Restart
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {
  name: 'ConnectionDetails',
  props: ['lnAddress'],

  data() {
    return {
      ip: this.lnAddress.ip,
      port: '',
    }
  },

  methods: {
    validate() {
      // Trigger validation to make sure all required fields are set
      this.$validator.validate().then(valid => {
        if(valid) {
          this.save();
        }
      });
    },

    async save() {
      EventBus.$emit('loading-start');

      const data = {
        // Concatenate port with a colon if it exists
        externalIP: this.ip + (this.port ? ':' + this.port : '')
      };

      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
        this.$toast.open({duration: 3000, message: 'Settings saved. Reloading...', type: 'is-success'});

        setTimeout(() => {
          location.reload();
        }, 3000);
      } catch (err) {
        this.showErrorMessage(err);
      } finally {
        EventBus.$emit('loading-stop');
        this.$emit('close');
      }
    }
  }
};
</script>
