<template>
  <div class="is-vcentered change-password">
    <section class="hero">
      <div class="hero-body">
        <div class="columns">
          <div class="column is-12">
            <div class="container content auth-header">
              <h1 class="title is-spaced">
                <img src="~assets/logo.svg" alt="">
              </h1>
              <h3 class="subtitle" v-if="basicAuth">Please change your password.</h3>
              <h3 class="subtitle" v-else>Let's change your password.</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="login-form">
      <div class="container is-fluid">
        <div class="columns is-mobile is-centered">
          <div class="column is-three-quarters-mobile is-two-thirds-tablet is-half-desktop is-one-half-widescreen is-one-half-fullhd">

            <p class="password-warning" v-if="basicAuth">
              We recently found an issue with special characters in node passwords affecting some customers' ability to connect Casa Node to Sats App.
              We've fixed the issue for everyone, but it requires you to change your password before logging in again.
            </p>

            <div class="auth-error" v-if="error">
              <div class="level-item">
                <img src="~/assets/icon-circle-warning.svg" alt=""> <p>{{errorMessage}}</p>
              </div>
            </div>

            <form @submit.prevent="validatePassword">
              <!-- Begin Login Form -->
              <div class="login-form-wrapper">
                <!-- Password Field -->
                <div class="field is-horizontal">
                  <div class="field-label is-medium">
                    <label class="label">Current Password</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <div class="control">
                        <input class="input is-medium" v-model="currentPassword" name="currentPassword" type="password" placeholder="s0meTh!ng-str0ng" v-validate="'required|min:12'" @input="clearErrors">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-medium">
                    <label class="label">New Password</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <div class="control">
                        <input class="input is-medium" v-model="newPassword" name="newPassword" type="password" placeholder="s0meTh!ng-str0ng3r" v-validate="'required|min:12'" ref="newPassword" @input="clearErrors">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-medium">
                    <label class="label">Confirm Password</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <div class="control">
                        <input class="input is-medium" name="confirmPassword" type="password" placeholder="s0meTh!ng-str0ng3r" v-validate="'required|min:12|confirmed:newPassword'" @input="clearErrors">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p class='password-help'>
                Please generate your new password with a dedicated password manager. <br>
                You can't reset your password if you forget it.
              </p>

              <button class="button is-casa" type="submit" name="button">Set New Password</button>
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

.login .change-password .hero-body {
  padding: 5em 1.5em 0 1.5em;
}

.login .change-password .subtitle {
  padding-bottom: 1.5em;
}

.login .change-password .password-warning {
  font-size: 18px;
  margin-top: -1em;
  padding: 0em 1em 1.5em 1em;
}

.login .change-password .auth-error {
  padding: 1em;
  margin: 0 0 2em 0;
}

.login .change-password .password-help {
  padding-top: 1em;
  font-size: 18px;
}

.login .change-password .field-label {
  flex-grow: 3;
  min-width: 210px;
}

/* Tablet */
@media screen and (min-width: 769px) {
  .login .change-password .field-label {
    flex-grow: 2;
  }
}
</style>


<script>
import axios from 'axios';
import API from '@/helpers/api';
import * as redirect from '@/helpers/redirects';

// TODO: Use a real localization library instead
const lang = {
  wrongPassword: 'Wrong password entered. Please try again',
  unknownError: 'Unable to change password. Please send your logs to support',
  alreadyStarted: 'Another change password process has already been started'
};

export default {
  layout: 'login',

  data() {
    return {
      error: false,
      errorMessage: '',
      basicAuth: false,
      currentPassword: null,
      oldPassword: '',
      newPassword: '',
    };
  },

  async created() {
    await redirect.checkLoggedIn(this);
    const basicAuth = sessionStorage.getItem('basicAuth');

    if(String(basicAuth) === 'true') {
      this.basicAuth = true;
    }

    if(String(this.$route.query.forbidden) === 'true') {
      this.error = true;
      this.errorMessage = lang.wrongPassword;
    }

    if(String(this.$route.query.error) === 'true') {
      this.error = true;
      this.errorMessage = lang.unknownError;
    }
  },

  methods: {
    validatePassword() {
      // Remove any previously set errors
      this.clearErrors();

      this.$validator.validate().then((valid) => {
        if(valid) {
          this.changePassword();
        } else {
          if(this.errors.items) {
            let error = this.errors.items.shift();

            if(error.msg) {
              this.error = true;
              this.errorMessage = error.msg;
            }
          }
        }
      });
    },

    clearErrors() {
      this.errors.clear();
      this.error = false;
      this.errorMessage = '';
    },

    showLoading() {
      this.$router.push({path: 'loading-password'});
    },

    async changePassword() {
      const data = {
        password: this.currentPassword,
        newPassword: this.newPassword,
      };

      try {
        if(this.basicAuth) {
          await axios.post(`${this.$env.API_MANAGER}/v1/accounts/changePassword`, data, {auth: {password: this.currentPassword, username: 'user'}});
        } else {
          await axios.post(`${this.$env.API_MANAGER}/v1/accounts/changePassword`, data);
        }

        this.showLoading();
      } catch(error) {
        this.error = true;

        if(error.response.status === 403) {
          this.errorMessage = lang.wrongPassword;
        } else if(error.response.status === 409) {
          this.errorMessage = lang.alreadyStarted;

          // Wait a moment so we can read the error message
          setTimeout(() => {
            this.showLoading();
          }, 3000);
        }
      }
    },
  }
}
</script>
