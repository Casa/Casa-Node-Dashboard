<template>
  <div class="intro-wrapper">
    <div class="intro-sync-status" v-if="setup.btcSync !== 0">
      <span>BTC Node Syncing<i class="status-circle status-syncing"></i></span>
      <span>{{setup.btcSync | percentage}}</span>
    </div>

    &nbsp; <!-- We need a non breaking space here to fix an animation glitch in firefox... -->

    <div class="intro-container container" :class="{tall: isTall}">
      <div class="intro-form" v-if="step === 'hello'">
        <span class="intro-heading">Hello there.</span><br>
        <span class="intro-text">Let's set up your Casa Node.</span><br>
        <nuxt-link :to="'?step=lets-talk'" class="button is-casa">Begin Setup</nuxt-link>
      </div>

      <div class="intro-form wide" v-if="step === 'lets-talk'">
        <div class="intro-icon"><img src="~assets/icon-password.svg" alt=""></div>
        <span class="intro-heading">Let's talk about your seed phrase.</span><br>
        <span class="intro-text">
          Do you want to generate a new seed phrase or <br>
          import an existing one?
        </span><br>
        <nuxt-link :to="'?step=new-seed'" class="button is-casa">Generate New Seed Phrase</nuxt-link>
        <nuxt-link :to="'?step=import-seed'" class="button is-casa">Import Existing Seed Phrase</nuxt-link>
      </div>

      <div class="intro-form" v-if="step === 'new-seed' && seedInit">
        <div class="intro-icon"><img src="~assets/lightning.png" alt=""></div>
        <span class="intro-heading">Okay, let's create your key.</span><br>
        <span class="intro-text">
          It's imperative that you write these 24 words in the proper order and store in a safe place.<br>
          Creating your key can take a minute or two since the chain is currently syncing.
        </span><br>
        <a @click="getSeed()" class="button is-casa" :disabled="isLoading">I Understand, Continue</a>
      </div>

      <!--  Set Seed Phrase -->
      <div class="intro-form" v-if="(step === 'new-seed' && !seedInit)">
        <div class="seed-phrase-count">{{setup.progress + 1}}</div>

        <transition-group tag="div" class="slide-group" :name="transitionName" @before-leave="smoothSnap">
          <div :key="setup.progress">
            <div class="seed-card">{{setup.seed[setup.progress]}}</div>
          </div>
        </transition-group>

        <!-- Handle seed progress -->
        <a v-if="setup.progress < 23" @click="next()" class="button is-casa">Next</a>
        <nuxt-link v-else :to="{ query: { step: 'password' }, params: { seed: setup.seed }}" class="button is-casa">Finish</nuxt-link>
        <br>

        <!-- Go back to previous -->
        <a v-if="setup.progress > 0" @click="previous()" class="button is-back">Go Back</a>
        <nuxt-link v-else :to="'?step=lets-talk'" class="button is-back">Go Back</nuxt-link>
      </div>

      <div class="intro-form" v-if="(step === 3 && !isTrezor && !isStdAuth)">
        <span class="intro-heading">Secure your Node.</span><br>
        <span class="intro-text">We recommend using Trezor for increased security. However, a password option is also available.</span><br>
        <a @click="setTrezor()" class="button is-casa">Trezor</a><br>
        <a @click="setPassword()" class="button is-back">Password</a>
      </div>

      <!--  Register with Trezor -->
      <div class="intro-form" v-if="(isTrezor && step === 3)">
        <span class="intro-heading">Authenticate with Trezor.</span><br>
        <span class="intro-text">Plug in your Trezor, then click the button below. Keep your Trezor seed phrase in case you lose your device.</span><br>
        <nuxt-link :to="'?step=' + (step + 1)" class="button is-casa">Authenticate</nuxt-link><br>
        <nuxt-link :to="{ query: { step: step + 1 }, params: { seed: setup.seed }}" class="button is-back">Go Back</nuxt-link>
      </div>

      <div class="intro-form wide" v-if="step === 'import-seed'">
        <div class="intro-icon"><img src="~assets/icon-password.svg" alt=""></div>
        <span class="intro-heading">Okay, let's import your seed phrase.</span><br>
        <span class="intro-text small">
          Important: you can only import seed phrases from LND wallets.
          Importing from a typical Bitcoin wallet won’t work.
        </span><br>

        <div class="seed-phrase">
          <template v-for="count in 24">
            <input type="text" class="word" :class="{ 'is-danger': seedError[count - 1] }" @input="removeError(count)" v-bind:key="count" v-model="setup.seed[count - 1]" v-bind:placeholder="count">
          </template>
        </div>
        <br>

        <span class="is-danger" v-if="isError">
          {{ errorMessage }}
          <br><br>
        </span>

        <nuxt-link :to="'?step=lets-talk'" class="button is-back horizontal">Cancel and Go Back</nuxt-link>
        <a @click="checkSeed()" class="button is-casa horizontal">Next</a>
      </div>

      <!--  Register with Password -->
      <div class="intro-form wide" v-if="step === 'password'">
        <span class="intro-heading">Secure your Node with a password.</span><br>
        <span class="intro-text is-danger" v-if="isError">
          <span v-if="setup.password !== setup.confirmPassword">
            Your passwords do not match.
          </span>
          <span v-else-if="setup.password.length < 12">
            Please use 12 or more characters.
          </span>
        </span>
        <span class="intro-text" v-else>
          12+ characters. We recommend using a password manager to generate your password.
        </span>
        <br><br>
        <form @submit.prevent="initWalletAndRegister()">
          <div class="init-password">
            <span class="password-label">Password</span><br>
            <input class="input is-medium" v-bind:class="{ 'is-danger': isError }" type="password" v-model="setup.password"><br><br>
            <span class="password-label">Confirm</span><br>
            <input class="input is-medium" v-bind:class="{ 'is-danger': isError }" type="password" v-model="setup.confirmPassword">
          </div>
          <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
          <button type="submit" class="button is-casa">Continue</button><br>
          <nuxt-link :to="{ query: { step: 'lets-talk' }, params: { seed: setup.seed }}" class="button is-back">Go Back</nuxt-link>
        </form>
      </div>

      <div class="intro-form" v-if="step === 'got-it'">
        <div class="intro-icon"><img src="~assets/green-check.svg" alt=""></div>
        <span class="intro-heading">Got it.</span><br>
        <span class="intro-text">Make sure you store your login credentials in a safe place. There is no "Forgot Password" button.</span><br>
        <nuxt-link :to="'?step=sync-time'" class="button is-casa">Continue Setup</nuxt-link>
      </div>

      <div class="intro-form" v-if="step === 'sync-time'">
        <span class="intro-heading">Sync time.</span><br><br>
        <span class="intro-text">
          It will take a few hours for your Node to finish its first sync. We recommend waiting until it's fully synced before using your Casa Node.
        </span><br>
        <nuxt-link :to="'?step=fine-print'" class="button is-casa">Continue</nuxt-link><br>
      </div>

      <div class="intro-form margin-top" v-if="step === 'fine-print'">
        <span class="intro-heading">Don't be <i>too</i> reckless.</span><br><br>
        <span class="intro-text">
          Just one last thing to remember. The Lightning Network and the Casa Node are experimental technology.
          Casa is not liable for any funds lost while using the Casa Node. Have fun with Lightning, but only store funds here that you're willing to lose.
        </span><br>
        <a href="/" class="button is-casa">I Agree</a><br>
        <a href="https://keys.casa/legal" target="_blank" rel="noopener" class="button is-back">Read the Fine Print</a>
      </div>
    </div>

  </div>

</template>

<script>
import axios from 'axios';
import API from '@/helpers/api';
import * as redirect from '@/helpers/redirects';

const steps = [
  'hello',
  'lets-talk',
  'new-seed',
  'import-seed',
  'password',
  'got-it',
  'sync-time',
  'fine-print'
];

export default {
  layout: 'intro',
  watchQuery: ['step'], // Use $route.query.step to call methods asyncData
  key: to => to.fullPath, // Key for <nuxt-child> (transitions)
  transition(to, from) { // Called for specific transition
    if (!from) {
      return 'slide-left';
    }
    return + to.query.step < + from.query.step ? 'slide-right' : 'slide-left';
  },

  data() {
    return {
      steps,
      setup: {
        progress: 0,
        direction: 0,
        btcSync: 0,
        password: '',
        confirmPassword: '',
        seed: [],
      },
      seedInit: true,
      isLoading: false,
      loadingComponent: false,
      isError: false,
      seedError: [],
      errorMessage: '',
      isTrezor: false, // Trezor not currently supported
      isStdAuth: true, // Temporarily force password auth
      isSyncing: false,
      walletCreated: false,
      percentSynced: ''
    }
  },

  async created() {
    await redirect.checkLoading(this);
  },

  async mounted() {
    // Get seed from the route parameters, since local variables are cleared between pages
    if(this.$route.params.seed !== undefined) {
      this.setup.seed = this.$route.params.seed;
      this.setup.progress = this.setup.seed.length - 1;
      this.seedInit = false;
    }

    // Check if there was an error with the provided seed phrase
    if(this.$route.params.seedError !== undefined) {
      this.handleSeedError(this.$route.params.seedError);
    }

    // We can't get the syncing status until after the user is registered
    if(steps.indexOf(this.$route.query.step) >= steps.indexOf('sync-time')) {
      let {data} = await this.$axios.get(`${this.$env.API_LND}/v1/bitcoind/info/sync`);
      this.setup.btcSync = data.percent;
    }

    // Preload images that will be displayed during the intro and on the dashboard after logging in
    this.preload([
      require('~/assets/icon-password.svg'),
      require('~/assets/green-check.svg'),
      require('~/assets/icon-circle-warning.svg'),
      require('~/assets/bitcoin.svg'),
      require('~/assets/chevron.svg'),
      require('~/assets/lightning.png'),
      require('~/assets/settings.svg'),
    ]);
  },

  // Renders some magic on the backend. Allows us to use step from query sting.
  async asyncData({query}) {
    let step = 'hello';

    // Make sure this is a valid page
    if(steps.indexOf(query.step) > -1) {
      step = query.step;
    }

    return {
      step,
    }
  },

  computed: {
    transitionName() {
      return 'x-' + (this.setup.direction > 0 ? 'r' : 'l');
    },

    isTall() {
      let tall = ['import-seed', 'password', 'fine-print'];

      if(tall.indexOf(this.step) > -1) {
        return true;
      }

      return false;
    }
  },

  methods: {
    onCopy: function(e) {
      this.$toast.open({duration: 3000, message:`Copied ${e.text}`});
    },

    onError: function(e) {
      console.log('Failed to copy address text', e);
    },

    next() {
      this.setup.direction = 1;
      this.setup.progress = this.setup.progress + 1;
    },

    previous() {
      this.setup.direction = -1;
      this.setup.progress = this.setup.progress - 1;
    },

    finishSeed() {
      this.seedComplete = true;
    },

    setTrezor() {
      this.isTrezor = true;
    },

    setPassword() {
      this.isStdAuth = true;
    },

    showLoadingSpinner() {
      this.loadingComponent = this.$loading.open({container: null});
    },

    hideLoadingSpinner() {
      this.loadingComponent.close();
    },

    async getSeed() {
      // If we are already getting a seed. Do not make a second call.
      if (this.isLoading) {
        return;
      }

      this.showLoadingSpinner();
      this.isLoading = true;
      let seedResponse = null;

      // The device could still be starting up at this point. We cannot use the status route yet, because status
      // requires auth. Because of this, we will loop on calling the seed route until it returns successfully.
      do {
        try {
          seedResponse = await axios.get(`${this.$env.API_LND}/v1/lnd/wallet/seed`);
          this.setup.seed = seedResponse.data.seed;
          this.seedInit = false;
          this.isLoading = false;
          this.hideLoadingSpinner();
        } catch (err) {
          // ignore err
          await this.sleep(5000);
        }
      } while (seedResponse === null);

    },

    checkSeed() {
      let error = false;
      this.seedError = [];

      // Loop through seed phrase to make sure no fields are empty
      for(let i = 0; i < 24; i++) {
        if(!this.setup.seed[i]) {
          this.seedError[i] = true;
          error = true;
        }
      }

      if(error) {
        this.isError = true;
        this.errorMessage = "It looks like you didn't fill out all of the seed words!";
      } else {
        this.$router.push({ query: { step: 'password' }, params: { seed: this.setup.seed }});
      }
    },

    // Parse the error message from LND to determine what kind of wallet failure occured
    parseWalletError(error) {
      let errorMessage = error.response.data || 'Wallet Creation Failed';
      let seedError = errorMessage.match(/^Unable to initialize wallet, word (.*) isn't a part of default word list$/);

      if(seedError) {
        this.$router.push({ query: { step: 'import-seed' }, params: { seed: this.setup.seed, seedError }});
      } else {
        this.$toast.open({duration: 10000, message: errorMessage, type: 'is-danger'});
      }
    },

    // Display error message when user entered an invalid seed word
    handleSeedError(seedError) {
      this.isError = true;
      this.errorMessage = seedError[0];
      this.seedError = [];

      // Loop through seed words to determine which ones are invalid
      for(let i = 0; i < 24; i++) {
        if(this.setup.seed[i] == seedError[1]) {
          this.seedError[i] = true;
        }
      }
    },

    removeError(index) {
      this.seedError[index - 1] = false;
      this.isError = false;
    },

    async initWalletAndRegister() {
      if(!this.walletCreated) {
        // Check password length
        if(this.setup.password.length < 12 || this.setup.password !== this.setup.confirmPassword) {
          this.isError = true;
          return false;
        } else {
          this.isError = false;
        }

        this.isLoading = true;
        const payload = {password: this.setup.password, seed: this.setup.seed};

        // Init Wallet
        try {
          let {data} = await axios.post(`${this.$env.API_LND}/v1/lnd/wallet/init`, payload);
          this.walletCreated = true;
        } catch (error) {
          this.parseWalletError(error);
          this.isLoading = false;
          return false;
        }

        // Register User
        try {
          const basicAuth = 'Basic ' + btoa('disregarded:' + this.setup.password);
          const headers = {headers: { 'Authorization': basicAuth }};
          const user = await axios.post(`${this.$env.API_MANAGER}/v1/accounts/register`, {}, headers);
          await this.$auth.loginWith('local', {auth: {password: this.setup.password, username: 'disregarded'}});
          // returns jwt via user.data.jwt
        } catch (err) {
          this.$toast.open({duration: 3000, message: `Failed to Register Creation Failed`, type: 'is-danger'});
          this.isLoading = false;
          return false;
        }

        this.isLoading = false;
      }

      this.$router.push({path: 'intro', query: {step: 'got-it'}});
    },

    // Simulates synchronous sleep function.
    async sleep(milliseconds) {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    },

    // Set position for seed card so they don't snap in odd ways.
    smoothSnap(el) {
      var rect = el.getBoundingClientRect();
      el.style.width = (rect.right - rect.left) + 'px';
      el.style.height = (rect.bottom - rect.top) + 'px';
      el.style.position = 'fixed';
      el.style.top = rect.top + 'px';
      el.style.left = rect.left + 'px';
    },

    preload(imageArray) {
      imageArray.forEach(function(imageURL) {
        // Use setTimeout all images load in parallel
        setTimeout(function() {
          const img = new Image();
          img.src = imageURL;
        }, 0);
      });
    },
  }

}
</script>
