<template>
  <form class="withdraw channel-manager" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span>Confirm Lightning Payment Request</span>
        </p>
      </header>
      <section class="modal-card-body">
        <!-- Payment Request Info -->
        <div class="equalColWrap eqFlexWrap">

          <div class="equalFlexCol eqFlexField">
            <span class="info-label">Amount Requested</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{invoice.amt}} BTC</span>
          </div>
          {{invoice}}
          <div class="equalFlexCol eqFlexField">
            <span class="info-label">Timeout</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">1 hour</span>
          </div>

          <div class="equalFlexCol eqFlexField">
            <span class="info-label">Memo</span>
          </div>
          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{invoice.memo}}</span>
          </div>

        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Cancel</a>
        <a class="button is-casa" type="button" @click="confirm()">Confirm</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';

export default {
  name: 'ConfirmInvoice',

  props: {
    invoice: this.invoice
  },

  data() {
    return {};
  },

  methods: {
    confirm() {
      const data = this.invoice;
      this.$emit('close');
      EventBus.$emit('confirmedInvoice', data);
    }
  }
};
</script>
