<template>
  <div class="unit-switch">
    <label class="toggle">
      <input type="checkbox" :checked="system.displayUnit === 'sats'" @change="toggle">

      <span class="toggle-slider"></span>
      <div class="toggle-options">
        <div class="toggle-option one" :class="{active: system.displayUnit === 'btc'}">BTC</div>
        <div class="toggle-option two" :class="{active: system.displayUnit === 'sats'}">SATS</div>
      </div>
    </label>
  </div>
</template>

<script>
import SystemData from '@/data/system';

export default {
  data() {
    return {
      system: SystemData,
    }
  },

  methods: {
    async toggle() {
      if(this.system.displayUnit === 'btc') {
        this.system.displayUnit = 'sats';
      } else {
        this.system.displayUnit = 'btc';
      }

      try {
        await this.$axios.post(`${this.$env.API_MANAGER}/v1/settings/save`, {systemDisplayUnits: this.system.displayUnit});
      } catch (error) {
        console.error(error);
      }

      this.$forceUpdate();
    },
  }
};
</script>
