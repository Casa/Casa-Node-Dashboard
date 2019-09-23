<template>
  <div class="intro">
    <nuxt />
  </div>
</template>

<script>
import updateEnv from '@/helpers/env';

export default {
  name: 'intro',
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

html, body {
  background-color: #0a0525!important;
  height: 100%;
}

#__layout, #__nuxt, .intro {
  height: 100%;
}

.intro-wrapper {
  height: 100%;
}

.intro-sync-status {
  position: absolute;
  z-index: 9;
  top: 2em;
  width: 100%;
  text-align: center;
}

.intro-sync-status span:first-child {
  color: #3bccfc;
  font-size: 22px;
  font-weight: bold;
  display: block;
}

.intro-sync-status span:last-child {
  color: #555075;
  font-size: 20px;
  font-weight: bold;
  display: block;
}

.intro-container {
  height: 100%;
  background-color: #0a0525;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: -2em;
}

.intro-container.tall {
  height: auto;
  margin-top: 0;
  margin-bottom: 1.5em;
}

.intro-icon img {
  max-height: 70px;
}

.intro-form {
  max-width: 100vw;
  margin: 0 auto;
}

.intro-form .intro-heading {
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  color: #ffffff;
  margin: 0.5em 0;
  display: inline-block;
}

.intro-form .intro-text {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.33;
  text-align: center;
  color: #8d8e8e;
  display: inline-block;
  margin: 0 0.5em;
}

.intro-form .intro-text.small {
  font-size: 26px;
  line-height: 32px;
}

.intro-form span.is-danger {
  color: #f0649e;
}

.input.is-danger,
.seed-phrase .word.is-danger {
  border-color: #f0649e;
}

.seed-phrase {
  margin: 0 auto;
  margin-top: 2em;
}

.seed-phrase .word {
  margin: 0.4em;
  background: none;
  border: 1px solid #d7d8d9;
  border-radius: 4px;
  width: 85vw;
  height: 60px;
  color: #fff;
  padding: 0 1em;
  font-size: 20px;
  box-sizing: border-box;
}

.init-password {
  max-width: 85vw;
  margin: 1.75em auto 0;
}

.password-label {
  float: left;
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 0;
}

.init-password input {
  background-color: transparent;
  font-size: 2rem!important;
  color: #d8d8d8;
  height: 1.8em;
}

.seed-phrase-count {
  width: 80px;
  height: 80px;
  display: flex;
  border: none;
  color: #FFF;
  background-color: #38344d;
  margin: 0 auto 2em;
  font-size: 22px;
  font-weight: bold;
  border-radius: 50%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.seed-card {
  max-width: 90vw;
  margin: 0 auto;
  width: 500px;
  height: 159px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: 500;
  text-align: center;
  color: #ffffff;
  background-color: #2fb4b5;
}

.button.is-casa {
  max-width: 85vw;
  width: 355px;
  height: 60px;
  font-size: 1em;
  object-fit: contain;
  margin-top: 8vh;
  margin-bottom: .5em;
}

.button.is-back {
  max-width: 85vw;
  width: 355px;
  height: 60px;
  margin-top: .5em;
  border: none;
  border-radius: 4px;
  background-color: rgba(238, 238, 238, 0.2);
  color: #d7d8d9;
  font-weight: bold;
}

.button.horizontal {
  margin-top: 0.75em;
  margin-bottom: .5em;
  font-size: 1em;
}

.button.is-casa {
  border: none;
  box-shadow: none;
}


a {
  display: inline-block;
  margin: 0 1em;
  color: #34495e;
  text-decoration: none;
}

a.disabled {
  color: #ccc;
}

ul {
  margin: auto;
  padding: 0;
  width: 100%;
  max-width: 400px;
  padding-top: 40px;
}

li {
  list-style-type: none;
  width: 400px;
  border: 1px #ddd solid;
  overflow: hidden;
}

li img {
  float: left;
  width: 100px;
  height: 100px;
}

li span {
  display: inline-block;
  padding-top: 40px;
  text-transform: uppercase;
}

.intro-wrapper {
  text-align: center;
  font-size: 20px;
  transition: all .5s cubic-bezier(.55,0,.1,1);
}

.margin-top {
  margin-top: 3em;
}

/*
==============================================
Animate Introductory View
==============================================
*/

.page-enter-active, .page-leave-active {
  transition: opacity .5s
}
.page-enter, .page-leave-active {
  opacity: 0
}

.bounce-enter-active {
  animation: bounce-in .8s;
}
.bounce-leave-active {
  animation: bounce-out .5s;
}
@keyframes bounce-in {
  0% { transform: scale(0) }
  50% { transform: scale(1.5) }
  100% { transform: scale(1) }
}
@keyframes bounce-out {
  0% { transform: scale(1) }
  50% { transform: scale(1.5) }
  100% { transform: scale(0) }
}

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(30px, 0);
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-30px, 0);
}

/*
==============================================
Animation for Seed Phrase Cards
==============================================
*/

.slideLeft {
  opacity: 0;
  transition: opacity .40s ease-in;

	animation-name: slideLeft;
	-webkit-animation-name: slideLeft;

	animation-duration: 1s;
	-webkit-animation-duration: 1s;

	animation-timing-function: ease-in-out;
	-webkit-animation-timing-function: ease-in-out;
	visibility: visible !important;
}

@keyframes slideLeft {
	0% {
		transform: translateX(100%);
	}
	100% {
		transform: translateX(0%);
	}
}

@-webkit-keyframes slideLeft {
  0% {
		transform: translateX(100%);
	}
	100% {
		transform: translateX(0%);
	}
}

/*
==============================================
Tween & Cubic Bezier for Seed Phrase Animation
==============================================
*/

.x-l-move, .x-r-move {
  transition: -webkit-transform 0.6s cubic-bezier(0.29, 0.15, 0.24, 0.97);
  transition: transform 0.6s cubic-bezier(0.29, 0.15, 0.24, 0.97);
  transition: transform 0.6s cubic-bezier(0.29, 0.15, 0.24, 0.97), -webkit-transform 0.6s cubic-bezier(0.29, 0.15, 0.24, 0.97);
}

.x-l-leave-active, .x-r-leave-active {
  transition: opacity 0.3s linear, -webkit-transform 0.3s cubic-bezier(0.64, 0.01, 0.67, 0.92);
  transition: opacity 0.3s linear, transform 0.3s cubic-bezier(0.64, 0.01, 0.67, 0.92);
  transition: opacity 0.3s linear, transform 0.3s cubic-bezier(0.64, 0.01, 0.67, 0.92), -webkit-transform 0.3s cubic-bezier(0.64, 0.01, 0.67, 0.92);
}

.x-l-enter-active, .x-r-enter-active {
  transition: opacity 0.3s linear, -webkit-transform 0.3s cubic-bezier(0.29, 0.15, 0.24, 0.97);
  transition: opacity 0.3s linear, transform 0.3s cubic-bezier(0.29, 0.15, 0.24, 0.97);
  transition: opacity 0.3s linear, transform 0.3s cubic-bezier(0.29, 0.15, 0.24, 0.97), -webkit-transform 0.3s cubic-bezier(0.29, 0.15, 0.24, 0.97);
  transition-delay: 0.25s, 0.3s;
}

.x-l-enter, .x-r-enter, .x-l-leave-to, .x-r-leave-to {
  opacity: 0;
}

.x-l-leave-to, .x-r-enter {
  -webkit-transform: translateX(50%);
  transform: translateX(50%);
}

.x-l-enter, .x-r-leave-to {
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.slide-group {
  max-width: 30em;
  text-align: center;
}


/*
==============================================
Mobile / Responsive styles
==============================================
*/

/* Tablet */
@media screen and (min-width: 769px) {
  .intro-form .intro-heading {
    font-size: 52px;
  }

  .intro-form .intro-text {
    font-size: 34px;
  }

  .intro-sync-status {
    left: 3em;
    text-align: left;
  }

  .seed-phrase {
    width: 760px;
  }

  .seed-phrase .word {
    width: 360px;
  }

  .init-password {
    max-width: 500px;
  }
}

/* Desktop */
@media screen and (min-width: 1088px) {
  .intro-form {
    max-width: 750px;
    margin: 0 auto;
  }

  .intro-form.wide {
    max-width: 880px;
  }

  .seed-phrase {
    width: 1080px;
    margin-left: -100px;
  }

  .seed-phrase .word {
    width: 250px;
  }
}

</style>
