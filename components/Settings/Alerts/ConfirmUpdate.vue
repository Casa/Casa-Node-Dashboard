<template>
  <form @submit.prevent="update()">
      <div class="alert modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Ready to update?</p>
        </header>
        <section class="modal-card-body">
          <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
          <p>You can <a href="https://github.com/Casa/Casa-Node-Dashboard/blob/master/CHANGELOG.md" target="_blank">view the list of changes here</a>. Your device will restart while it updates. You will not be able to connect to your node while it's updating. Please enter your password to confirm the update.</p><br>
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

export default {
  name: 'ConfirmUpdate',

  data() {
    return {
      basicAuth: false,
      password: '',
      isLoading: false
    }
  },

  created() {
    const basicAuth = sessionStorage.getItem('basicAuth');

    if(String(basicAuth) === 'true') {
      this.basicAuth = true;
    }
  },

  methods: {
    async update() {
      try {
        this.isLoading = true;

        if(this.basicAuth) {
          const basicAuthConfig = {
            method: 'post',
            url: `${this.$env.UPDATE_MANAGER}/v1/update`,
            auth: {username: 'user', password: this.password}
          };

          await axios(basicAuthConfig);
        } else{
          const data = {
            password: this.password,
          };

          await axios.post(`${this.$env.UPDATE_MANAGER}/v1/update`, data);
        }

        // Close Modal and Settings Panel
        this.$emit('close');
        EventBus.$emit('updating');
        this.$snackbar.open({message:'Software is updating. Please check back in a few minutes.', type:'is-success', position:'is-top', indefinite: true});
        this.$router.push('/loading');
      } catch (err) {
        this.$snackbar.open({message:`Update failed: ${err.response.data}`, type:'is-danger', position:'is-top', indefinite: true});
      } finally {
        this.isLoading = false;
        this.password = '';
      }
    }

  }
};
</script>
