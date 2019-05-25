<template>
  <div class="extension-promo desktop-only">
    <a :href="extensionUrl" target="_blank"
      rel="noopener"></a>
    <div class="close" @click="$emit('closeClick')"></div>
  </div>
</template>

<script>
  import { detect } from 'detect-browser'
  export default {
    computed: {
      extensionUrl() {
        const browser = detect();
        switch (browser.name) {
          case "firefox":
            return "https://addons.mozilla.org/en-US/firefox/addon/casa-extension/"
          default: 
            return "https://chrome.google.com/webstore/detail/casa-extension/lnaedehiikghclgaikolambpbpeknpef/"
        }
        return this.data 
      }
    },
  };
</script>