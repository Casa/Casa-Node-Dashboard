// Helper function to define API URLs
export default function updateEnv(app) {
  let url = app.$env.DEVICE_HOST;

  // We have to check process.browser to prevent server-side rendering errors
  if (process.browser && window.location.href.includes('.onion')) {
    url = app.$env.CASA_NODE_HIDDEN_SERVICE;
  }

  app.$env.API_MANAGER = `${url}:3000`;
  app.$env.API_LND = `${url}:3002`;
  app.$env.UPDATE_MANAGER = `${url}:3001`;
}
