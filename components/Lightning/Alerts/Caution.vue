<template>
  <form class="caution" action="">
    <div class="alert-icon-container">
      <img src="~assets/yellow-excl.svg" alt="Alert">
    </div>
    <div class="alert alert-status modal-card">
        <header class="modal-card-head"></header>
        <section class="modal-card-body">
          <h2>Lightning sync in progress.</h2>
          <p>Please wait a few minutes and try again.</p>
        </section>
        <footer class="modal-card-foot">
          <a class="button is-casa is-fullwidth" @click="$parent.close()">Continue</a>
        </footer>
    </div>
  </form>
</template>

<script>
export default {
  name: 'Caution',
  data() {
    return {
      email: 'email', password: 'password'
    }
  }
};
</script>
