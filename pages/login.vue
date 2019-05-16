<template>
  <div class="is-vcentered">
    <section class="hero">
      <div class="hero-body">
        <div class="columns">
          <div class="column is-12">
            <div class="container content auth-header">
              <h1 class="title is-spaced">
                <img src="~assets/logo.svg" alt="Casa Logo">
              </h1>
              <h3 class="subtitle">Welcome home.</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="login-form">
      <div class="container is-fluid">

        <div class="columns is-mobile is-centered">

          <div class="column is-three-quarters-mobile is-two-thirds-tablet is-half-desktop is-one-half-widescreen is-one-half-fullhd">

            <form @submit.prevent="handleLogin">
              <!-- Begin Login Form -->
              <div class="login-form-wrapper">
                <!-- Password Field -->
                <div class="field is-horizontal">
                  <div class="field-label is-medium">
                    <label class="label">Password</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <div class="control">
                        <input class="input is-medium" v-model="password" type="password" placeholder="Password">
                      </div>
                      <!-- Error Message Component -->
                      <div v-if="this.wrongPassword" class="auth-error">
                        <div class="level-item">
                          <img src="~/assets/icon-circle-warning.svg" alt="error"> <p>Wrong password</p>
                        </div>
                      </div>
                      <div v-if="this.error" class="auth-error">
                        <div class="level-item">
                          <img src="~/assets/icon-circle-warning.svg" alt="error"> <div>Your node's internal IP address has changed. Please restart the device to continue.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <p class="password-help">Forgot your credentials? <a href="https://keys.casa/support/" target="_blank" rel="noopener">Contact Us</a>.</p> -->
              <button class="button is-casa" type="submit" name="button">Sign In</button>
            </form>
            <!-- End Form -->
          </div>
        </div>
      </div>
    </section>
    <!-- Load Component with Footer Links -->
    <section class="footer-links">
      <div class="container is-fluid">
        <div class="columns is-mobile is-centered">
          <div class="column is-three-quarters-mobile is-two-thirds-tablet is-half-desktop is-one-third-widescreen is-one-third-fullhd">
            <img class="footer-logo" src="~/assets/gray-logo.svg" alt="footer logo">
            <p class="resources">
              <a href="https://keys.casa" target="_blank" rel="noopener">Home</a>   ∙   <a href="https://keys.casa/support/" target="_blank" rel="noopener">Support</a>   ∙   <a href="https://keys.casa/legal" target="_blank" rel="noopener">Legal</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.auth-error {
  display: block;
  height: auto;
}
</style>


<script>
import axios from 'axios';
import API from '@/helpers/api';
import * as redirect from '@/helpers/redirects';

export default {
  layout: 'login',

  data() {
    return {
      password: '',
      wrongPassword: false,
      error: false
    };
  },

  async created() {
    await redirect.checkLoading(this);
  },

  methods: {
    async handleLogin() {
      // try setting auth endpoint here
      try {
        await this.$auth.loginWith('local', {auth: {password: this.password, username: 'user'}});
        this.$router.push('/');
      } catch (err) {
        if(err && err.response && err.response.status === 401) {
          this.wrongPassword = true;
          this.error = false;
        } else {
          this.wrongPassword = false;
          this.error = true;
        }
      }
    }
  }

}
</script>
