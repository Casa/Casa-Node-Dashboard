<template>
  <form @submit.prevent="validate()">
    <div class="generic-modal alert alert-status modal-card connection-details">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Configure Bitcoin Node Port Number
        </p>
      </header>
      <section class="modal-card-body">
        <p>We recommend leaving the port at 8333 unless you're an advanced user with multiple nodes on your local network.</p>

        <strong>Connection Details</strong>

        <div class="columns">
          <div class="column">
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

  data() {
    return {
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
      const data = {
        bitcoindPort: parseInt(this.port)
      };

      try {
        EventBus.$emit('loading-start');
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, data);
        this.$toast.open({duration: 3000, message: 'Settings saved. Reloading...', type: 'is-success'});

        setTimeout(() => {
          location.reload();
        }, 3000);
      } catch (error) {
        let errorMessage = error.response.data || 'Unable to save settings';
        this.$toast.open({duration: 10000, message: errorMessage, type: 'is-danger'});
      } finally {
        EventBus.$emit('loading-stop');
        this.$emit('close');
      }
    }
  }
};
</script>
