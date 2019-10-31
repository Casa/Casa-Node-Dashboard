<template>
  <form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Manage Custom Channel</span>
          <span class="tag is-rounded is-online">Online</span>
        </p>
        <span class="modal-title-right">.05 BTC</span>
      </header>
      <section class="modal-card-body">
        <b-field label="Email">
          <b-input type="email" :value="email" placeholder="Channel Purpose" required></b-input>
        </b-field>
        <b-field label="Password">
          <b-input type="password" :value="password" password-reveal placeholder="Your password" required></b-input>
        </b-field>
        <b-checkbox>Remember me</b-checkbox>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="$parent.close()">Save</a>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  name: 'Alert',
  data() {
    return {}
  }
};
</script>
