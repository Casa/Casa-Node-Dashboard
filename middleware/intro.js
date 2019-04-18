import axios from 'axios';

async function isRegistered(ctx) {
  // Check if user is registered
  const data = (await axios.get(`${ctx.env.DEVICE_HOST}:3000/v1/accounts/registered`)).data;
  if (data.registered === false) {
    // redirect unregistered user to /intro
    ctx.app.router.push('/intro');
  }
}

export default async function (ctx) {

  // TODO - run registration check as middleware and cookie the user so we don't have to make
  // an HTTP request each time we refresh index. We can simply check for the cookie.

  // await isRegistered(ctx);
}
