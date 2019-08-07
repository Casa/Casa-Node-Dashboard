import Vue from 'vue';
import VeeValidate, { Validator } from 'vee-validate';

// Custom error messages for validation
const dictionary = {
  en: {
    attributes: {
      chansize: 'Minimum Channel Size',
      nickname: 'Node Nickname',
      nodeColor: 'Node Color',
      maxChanSize: 'Value per Channel',
      maxChannels: 'Number of Channels',
      peerName: 'Peer Name',
      channelPurpose: 'Channel Purpose',
      connectionCode: 'Connection Code',
      pubKey: 'Public Key',
      fundingAmount: 'Channel Funding',
    },

    custom: {
      chansize: {
        decimal: 'Minimum Channel Size must be a number',
        integer: 'Minimum Channel Size must be an integer',
      },

      nickname: {
        max: 'Node Nickname must be less than 32 characters',
      },

      nodeColor: {
        regex: 'Node Color must be a six digit hex code or empty',
      },

      maxChanSize: {
        decimal: 'Value per channel must be a number',
        integer: 'Value per channel must be an integer',
      }
    }
  }
};

Vue.use(VeeValidate);
Validator.localize(dictionary);

// Custom validation functions
Validator.extend('max_bytes', {
  getMessage: (field, params) => {
    return `${field} must be less than ${params[0]} bytes. This can happen if your nickname uses emojis or other special characters`;
  },

  validate: (input, params) => {
    const blob = new Blob([input]);
    const max = parseInt(params[0]);

    if(blob.size > max) {
      return false;
    }

    return true;
  },
});
