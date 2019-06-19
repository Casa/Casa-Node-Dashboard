<template>
  <div class="login">
    <nuxt />
  </div>
</template>

<script>
import updateEnv from '@/helpers/env';

export default {
  name: 'login',

  beforeMount() { // perform runtime injection
    updateEnv(this);

    this.$auth.strategies.local.options.endpoints.login = {
      url: `${this.$env.API_MANAGER}/v1/accounts/login`,
      method: 'post',
      propertyName: 'jwt'
    };
  },
  data() {
    return {}
  }
};
</script>

<style>

.flex-wrapper {
  margin: 10px 0 10px 10px
}

.login-wrapper {
  height: 100%;
}

.login-form .button {
  width: 355px;
  height: 60px;
  display: block;
  object-fit: contain;
  border: none;
  box-shadow: none;
  padding-top: 15px;
  padding-bottom: 15px;
}

.login-form .button.is-casa {
  margin: 2em auto 1em;
}

.login-form .button.is-default {
  background-color: #eeeeee;
  color: #8d8e8e;
  font-weight: bold;
  margin: 1em auto 2em;
}

.login {
  background: url("~assets/auth-bg.png") no-repeat 0 260px;
  background-size: 100% auto;
  background-color: #f7f7f7;
}

.login > div {
  min-height: 100vh;
}

.login .hero-body {
  padding: 5rem 1.5rem;
}

.button.is-casa:hover,
.button.is-casa:focus,
.button.is-casa:active {
  background-color: #572bf9;
  border: none;
}

.subtitle {
  color: #0a0525;
  margin-bottom: .25em;
}

.alt-text {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.7;
  text-align: center;
  color: #696969;
}

.alt-text a {
  font-weight: bold;
  color: #3bccfc;
}

.auth-header {
  text-align: center;
}

.login-form .is-casa {
  font-size: 20px;
  width: 100%;
}
.login-form .field-label {
  text-align: left;
  padding-top: 0;
}

.login-form .label {
  padding-left: 1.75em;
}

.login-form-wrapper {
  background-color: #FFF;
  border-radius: 6px;
  padding: 0;
  border:1px solid #eeeeee;
  box-shadow: 0 7px 14px 0 rgba(74, 74, 74, 0.09);
}

.login-form-wrapper input, .login-form-wrapper input:focus {
  border: none;
  box-shadow: none;
}

.login-form-wrapper .field.is-horizontal {
  margin: 0;
  padding: 0.5em;
  border-bottom: 1px solid #eeeeee;
  align-items: center;
}

.login-form-wrapper .field.is-horizontal:last-child {
  border-bottom: none;
}

.login-form .column.is-three-quarters-mobile {
  padding: 0;
}

.password-help {
  font-size: 15px;
  text-align: center;
  color: #8d8e8e;
  margin-top: 1em;
}

.password-help a {
  color: #3bccfc;
}

.login-form p > a {
  margin-left: .25em;
}

/* Retain Horizontal Labels on Mobile */
@media screen and (max-width: 768px) {

  .login-form-wrapper .field.is-horizontal {
    padding-left: 1em;
  }

  .login-form-wrapper .field-label.is-medium {
    margin-right: .5em;
  }

  .login-form-wrapper .field.is-horizontal {
    display: flex;
    align-items: center;
  }

  .login-form-wrapper .field-label {
    flex-basis: 0;
    flex-grow: .5;
    flex-shrink: 0;
    margin-right: 1.5rem;
    text-align: right;
  }

  .login-form-wrapper .field-label.is-medium {
    font-size: 1.25rem;
  }

}

.auth-error {
  color: #f0649e;
  font-size: 18px;
  font-weight: 500;
  background-color: #FFE2EE;
  border-radius: 5px;
  height: 40px;
  display: inline-flex;
  padding: 0 .5em;
  margin-left: .5em;
}

.auth-error img {
  display: inline-block;
  vertical-align: top;
  margin-right: .5em;
  height: 25px;
}

.footer-logo {
  width: 40px;
  height: 40px;
  display: block;
  margin: 0 auto;
}

.footer-logo {
  width: 40px;
  height: 40px;
  display: block;
  margin: 0 auto;
}

.footer-links {
  margin-top: 4em;
}

.footer-links p {
  text-align: center;
  margin-top: .25em;
  color: #8d8e8e;
}

.footer-links .resources a {
  font-size: 15px;
  text-align: center;
  color: #8d8e8e;
  margin: 1em 1em 0 1em;
  display: inline-block;
  text-decoration: none;
}
</style>
