const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Base64 } = require('js-base64');

const parseCookies = (headers) => {
  let rawCookies = [];
  if (Reflect.has(headers, 'cookie')) {
    rawCookies = headers.cookie.split(';');
  }

  return rawCookies.map((cookie) => {
    const temp = cookie.split('=');

    return {
      [temp[0].trim()]: temp[1].trim(),
    };
  });
};


// const shortToken = await generateToken({byteLength: 20});
const Auth = (storage) => {
  const myPlaintextPassword = '1234';
  const saltRounds = 10;

  this.storage = storage;
  bcrypt.hash(myPlaintextPassword, saltRounds)
    .then((hashed) => {
      this.storage.guadix = {};
      this.storage.guadix.hash = hashed;
    })
    .catch((err) => {
      console.log(err);
    });

  const authenticated = (headers) => {
    let granted = false;

    // See if auth headers were sent
    let authHeader = '';
    if (headers.authorization) {
      authHeader = headers.authorization.replace(/^Basic/i, '').trim();
      const params = Base64.decode(authHeader).split(':');

      const user = params[0];
      const pass = params[1];

      if (!Reflect.has(this.storage, user)) {
        console.log(`Unknown user: ${user}`);
        granted = false;
      } else {
        return bcrypt.compare(pass, this.storage[user].hash);
      }
    }

    // Else Seek if it has an access token
    const cookies = parseCookies(headers);
    granted = (Reflect.has(cookies, 'access_token') &&
      Reflect.has(storage, 'guadix') &&
      Reflect.has(storage.guadix, 'token') &&
      cookies.access_token === storage.guadix.token);

    return Promise.resolve(granted);
  };


  const generateToken = ({ stringBase = 'base64', byteLength = 48 } = {}) =>
    (new Promise((resolve, reject) => {
      crypto.randomBytes(byteLength, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          this.storage.guadix.token = buffer.toString(stringBase);
          resolve(this.storage.guadix.token);
        }
      });
    }));


  return {
    authenticated,
    generateToken,
  };
};

module.exports = Auth;
