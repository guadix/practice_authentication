const bcrypt = require('bcrypt');
const { Base64 } = require('js-base64');

const saltRounds = 10;
const passwords = {};
const myPlaintextPassword = '1234';

bcrypt.hash(myPlaintextPassword, saltRounds).then((hash) => {
  passwords.guadix = hash;
});

exports.authenticated = (headers) => {
  let authHeader = '';

  if (headers.authorization) {
    authHeader = headers.authorization.replace(/^Basic/i, '').trim();
  } else {
    return Promise.resolve(false);
  }

  const params = Base64.decode(authHeader).split(':');
  console.log(Base64.decode(authHeader));

  const user = params[0];
  const pass = params[1];

  if (!Reflect.has(passwords, user)) {
    console.log(`Unknown user: ${user}`);
    return Promise.resolve(false);
  }

  return bcrypt.compare(pass, passwords[user]);
};

