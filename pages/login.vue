<template>
  <div class="is-vcentered">
    <section class="hero">
      <div class="hero-body">
        <div class="columns">
          <div class="column is-12">
            <div class="container content auth-header">
              <h1 class="title is-spaced">
                <img src="~assets/logo.svg" alt="">
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

            <form @submit.prevent="jsonLogin">
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
                          <img src="~/assets/icon-circle-warning.svg" alt=""> <p>Wrong password</p>
                        </div>
                      </div>
                      <div v-if="this.error" class="auth-error">
                        <div class="level-item">
                          <img src="~/assets/icon-circle-warning.svg" alt=""> <div>Your node's internal IP address has changed. Please restart the device to continue.</div>
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
            <img class="footer-logo" src="~/assets/gray-logo.svg" alt="">
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

  mounted() {
    // Preload images that will be displayed on the dashboard after logging in
    this.preload([
      require('~/assets/icon-circle-warning.svg'),
      require('~/assets/bitcoin.svg'),
      require('~/assets/chevron.svg'),
      require('~/assets/lightning.png'),
      require('~/assets/settings.svg'),
    ]);

    // Hide any modals that might be open
    // TODO: Use the EventBus for this instead of DOM manipulation...
    document.querySelectorAll('.modal.is-active').forEach(function(element) {
      element.className = element.className.replace('is-active', '');
    });
  },

  methods: {
    async jsonLogin() {
      try {
        await this.$auth.loginWith('local', {data: {password: this.password}});
        this.$router.push('/');
      } catch (err) {
        if(err && err.response && err.response.status === 401) {
          // Try doing a basic auth login as a fallback
          this.basicLogin();
        } else {
          this.wrongPassword = false;
          this.error = true;
        }
      }
    },

    async basicLogin() {
      try {
        // If basic auth works but json didn't, redirect to the change password page
        await this.$auth.loginWith('local', {auth: {password: this.password, username: 'user'}});

        // That worked? Set the session storage
        sessionStorage.setItem('basicAuth', 'true');
        this.$router.push('/change-password');
      } catch (err) {
        if(err && err.response && err.response.status === 401) {
          this.wrongPassword = true;
          this.error = false;
        } else {
          this.wrongPassword = false;
          this.error = true;
        }
      }
    },

    preload(imageArray) {
      imageArray.forEach(function(imageURL) {
        // Use setTimeout all images load in parallel
        setTimeout(function() {
          const img = new Image();
          img.src = imageURL;
        }, 0);
      });
    }
  }

}
</script>
