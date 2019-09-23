export const actions = {
  async onHttpRequest(store, context) {},
};

export const getters = {
  isAuthenticated(state) {
    console.log('state.auth', state.auth);
    return state.auth.loggedIn;
  },

  loggedInUser(state) {
    return state.auth.user;
  }
};
