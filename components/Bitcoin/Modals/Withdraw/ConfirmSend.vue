<template>
  <form class="withdraw" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Confirm Payment</span>
        </p>
        <p class="modal-title-right">
          <span class="amount">.401 BTC</span><br>
          <span class="amount-description">Request Pending</span>
        </p>
      </header>
      <section class="modal-card-body">
        <b-field label="Recipient's BTC Address">
          <b-input v-model="txData.address" type="text" required></b-input>
        </b-field>
        <br>
        <div class="withdrawal-amount">
          <h2>Amount to Withdraw</h2>
          <p>You have .401 BTC available immediately from your wallet and .823 BTC in the Lightning Network.</p>
          <b-field grouped>
            <b-field label="btc" expanded>
              <b-input type="number" v-model="txData.amount" placeholder="BTC" required></b-input>
            </b-field>
            <b-field label="exchange.usd" expanded>
              <b-input type="number" v-model="exchange.usd" placeholder="USD"></b-input>
            </b-field>
          </b-field>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="save()">Confirm</a>
      </footer>
    </div>
  </form>
</template>



<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {
  name: 'Withdraw',
  data() {
    return {
      txData: {}
    };
  },
  async created() {
    const data = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD');
    console.log('data', data);
  },
  methods: {
    save() {
      const data = {
        addr: this.txData.address, // "2NCZmJjoYmuvZBtWczUQD7WdNjgKcnoDiz4"
        amt: parseInt(this.txData.amount), // BTC in Sats
      };
      this.$emit('close');
      EventBus.$emit('withdraw', data);
    }
  }
};
</script>
