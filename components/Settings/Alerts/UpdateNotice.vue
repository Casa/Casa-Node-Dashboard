<template>
  <transition name="fade">
    <article v-if="isActive" class="notification is-update" :class="type">
      <button v-if="closable" class="delete" type="button" @click="close"/>
      <div class="media" @click="confirmUpdate">
        <div class="media-content">
          <slot/>
        </div>
      </div>
    </article>
  </transition>
</template>

<script>
  import ConfirmUpdate from '@/components/Settings/Alerts/ConfirmUpdate';

  export default {
    name: 'UpdateNotice',
    props: {
      active: {
        type: Boolean,
        default: true
      },
      title: String,
      closable: {
        type: Boolean,
        default: true
      },
      type: String,
      size: String,
      autoClose: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 5000
      }
    },

    data() {
      return {
        isActive: this.active
      }
    },

    watch: {
      active(value) {
        this.isActive = value;
      },
      isActive(value) {
        if (value) {
          this.setAutoClose();
        } else {
          if (this.timer) {
            clearTimeout(this.timer);
          }
        }
      }
    },

    methods: {
      /* Close the Message and emit events. */
      close() {
        this.isActive = false;
        this.$emit('close');
        this.$emit('update:active', false);
      },

      /* Set timer to auto close message */
      setAutoClose() {
        if (this.autoClose) {
          this.timer = setTimeout(() => {
            if (this.isActive) {
              this.close();
            }
          }, this.duration)
        }
      },

      confirmUpdate() {
        this.isActive = false;
        this.$emit('close');
        this.$emit('update:active', false);
        this.$modal.open({parent: this, component: ConfirmUpdate, hasModalCard: true});
      }
    },

    mounted() {
      this.setAutoClose();
    }

  };
</script>
