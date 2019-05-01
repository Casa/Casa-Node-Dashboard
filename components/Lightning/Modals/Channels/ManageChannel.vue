<template>
  <form class="withdraw channel-manager" action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span v-if="chData.autopilot">Manage Autopilot Channel</span>
          <span v-else>Manage Custom Channel</span>
        </p>
        <p class="modal-title-right">
          <span v-if="chData.status.toUpperCase() === 'OFFLINE'" class="channel-offline-status" ><span>{{chData.status.toUpperCase()}}</span></span>
          <span v-else class="channel-online-status" ><span>{{chData.status.toUpperCase()}}</span></span>
        </p>
      </header>
      <section class="modal-card-body">

        <!-- Peer Field  -->
        <h2>Peer Name</h2>
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input class="input peer-name" v-model="chData.name" type="text" required>
          </p>
        </div>

        <!-- Channel Purpose -->
        <h2>Channel Purpose</h2>
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input class="input channel-purpose" v-model="chData.purpose" type="text" placeholder="Rebel Alliance">
          </p>
          <a class="button is-info is-pink" v-if="chData.type==='OPEN'" @click="openConfirmCloseChannel()">Close Channel</a>
        </div>

        <!-- BTC Input Fields -->
        <div class="request-amount" v-if="system.displayUnit === 'btc' && chData.localBalanceBtc">
          <div class="field is-grouped">
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" type="number" v-model="chData.localBalanceBtc">
              </p>
              <p class="help">BTC ON YOUR SIDE</p>
            </div>
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" type="number" v-model="chData.remoteBalanceBtc">
              </p>
              <p class="help">BTC ON OTHER SIDE OF CHANNEL</p>
            </div>
          </div>
        </div>

        <div class="request-amount" v-else-if="system.displayUnit === 'sats' && chData.localBalance">
          <div class="field is-grouped">
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" type="number" v-model="chData.localBalance">
              </p>
              <p class="help">SATS ON YOUR SIDE</p>
            </div>
            <div class="field is-expanded input-wrapper">
              <p class="control is-expanded">
                <input class="input" type="number" v-model="chData.remoteBalance">
              </p>
              <p class="help">SATS ON OTHER SIDE OF CHANNEL</p>
            </div>
          </div>
        </div>
        <br>

        <!-- Channel Info -->
        <div class="equalColWrap eqFlexWrap">
          <div class="equalFlexCol eqFlexField">
            <span class="info-label">Remote Node ID</span><br>
            <span class="info-light">Public key of the remote peer.</span>
          </div>

          <div class="equalFlexCol eqFlexField">
            <span class="info-light">{{chData.remotePubkey}}</span>
          </div>
          <div class="equalFlexCol eqFlexField" v-if="chData.csvDelayText">
            <span class="info-label">Withdrawal Timelock</span> <br>
            <span class="info-light">Refund delay for uncooperative close.</span>
          </div>
          <div class="equalFlexCol eqFlexField" v-if="chData.csvDelayText">
            <span class="info-light">{{chData.csvDelayText}}</span>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <a class="button cancel" type="button" @click="$parent.close()">Go Back</a>
        <a class="button is-casa" type="button" @click="save()" disabled>Save</a>
      </footer>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import EventBus from '@/helpers/event-bus';
import SystemData from '@/data/system';
import ConfirmCloseChannel from '@/components/Lightning/Modals/Channels/ConfirmCloseChannel';

export default {
  name: 'ManageChannel',

  mounted() {
    var vm = this; // avoid scope problems
    EventBus.$on('closeChannel', () => {
      this.$parent.close();
    });
  },

  props: {
    chData: this.chData
  },

  data() {
    return {
      system: SystemData,
    };
  },

  methods: {
    save() {
      // TODO: add backend route to update peer name/channel purpose. This is low priority.
    },

    async openConfirmCloseChannel() {
      this.$modal.open({parent: this, props: {chData: this.chData}, component: ConfirmCloseChannel, hasModalCard: true});
    }
  }
};
</script>
