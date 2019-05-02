<template>
  <form action="">
      <div class="alert-icon-container">
        <img src="~assets/green-check.svg" alt="Success">
      </div>
      <div class="alert alert-status modal-card">
        <header class="modal-card-head"></header>
        <section class="modal-card-body">
          <h2>Success.</h2>
          <p>Your changes have been saved.</p>
        </section>
        <footer class="modal-card-foot">
          <a class="button is-casa is-fullwidth" @click="$parent.close()">Continue</a>
        </footer>
      </div>
  </form>
</template>

<script>
export default {
  name: 'Success',
  data() {
    return {}
  }
};
</script>
