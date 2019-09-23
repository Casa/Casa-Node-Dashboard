import axios from 'axios';
import API from '@/helpers/api';

// Helper function to check if the node is currently loading
// If the node is loading, redirect to the loading screen
export async function checkLoading(context) {
  // Check to see if the node is still booting up
  const loading = await API.get(axios, `${context.$env.API_MANAGER}/v1/telemetry/boot`);

  if(typeof sessionStorage !== 'undefined') {
    const session = sessionStorage.getItem('loading');

    // This session data is used to bypass the loading page in case the node is unable to start
    if(session === 'ignored') {
      return false;
    }
  }

  // If there is a network failure, an exception will be thrown and loading will return false
  if(loading === false || (loading && parseInt(loading.percent) !== 100)) {
    context.$router.push('/loading');
    return true;
  }

  return false;
}

// Helper function to check if the node already has a user account
// If no user account exists, redirect to the intro
export async function checkAccount(context) {
  // Check to see if the user is registered. If the user is not registered, redirect them to the intro page.
  const data = await API.get(axios, `${context.$env.API_MANAGER}/v1/accounts/registered`);

  if(data && data.registered === false) {
    context.$router.push('/intro');
    return true;
  }

  return false;
}

// Helper function to check if the user is logged in
export async function checkLoggedIn(context) {
  // Make a JWT authenticated call to check if we're logged in
  const serial = await API.get(context.$axios, `${context.$env.API_MANAGER}/v1/telemetry/serial`);

  if(serial === false) {
    context.$router.push('/login');
    return true;
  }

  return false;
}
