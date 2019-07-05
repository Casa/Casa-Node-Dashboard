export default function ({$axios, app}) {
  $axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      const code = parseInt(error.response && error.response.status);

      if ([401].includes(code)) {
        app.$auth.logout();
        app.router.push('/login');

        console.log('401 Unauthorized. Redirecting to Login Page.');
      }

      return Promise.reject(error);
    }
  );
}
