const querystring = require('querystring');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const { Base64 } = require('js-base64');

const saltRounds = 10;
const passwords = {};
const myPlaintextPassword = '1234';

bcrypt.hash(myPlaintextPassword, saltRounds).then((hash) => {
  passwords.guadix = hash;
});


const parseBody = (req, isFormData, isEncoded, callback) => {
  let body = [];

  req
    .on('data', (chunk) => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();

      if (isEncoded) {
        body = Base64.decode(body);
      }

      if (isFormData) {
        body = querystring.parse(body);
      }

      callback(body);
    });
};


const handleAuth = (req, res) => {
  const authHeader = req.headers.Authorization;
  return ;
  const user = req.headers;
  const pass = req.headers;

  if (!Reflect.has(passwords, user)) {
    console.log(`Unknown user: ${user}`);
    res.end('Authenticate, human!');
    return;
  }

  const retrievedPass = passwords[user];

  bcrypt.compare(pass, retrievedPass, (err, granted) => {
    if (err) {
      console.error(err);

      res.statusCode = 500;
      res.end();

      return;
    }

    if (granted) {
      res.end(`Known human ${user}, welcome!`);
    } else {
      res.end('Authenticate, human!');
    }
  });
};

const notFoundResource = (req, res) => {
  res.writeHead(404, {
    'Content-type': 'text/plain',
  });
  res.write('Page Was Not Found');
  res.end();
};

const authResource = (req, res) => {
  switch (req.method.toLowerCase()) {
    case 'post':
      handleAuth(req, res);

      break;
    default:
      notFoundResource(res);
  }
};

const rootResource = (req, res) => {
  fs.readFile(path.join(__dirname, 'main.html'), (err, data) => {
    if (err) {
      notFoundResource(res);
    } else {
      res.writeHead(200, { 'Content-type': 'text/html' });
      res.write(data);
      res.end();
    }
  });
};

const faviconResource = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'image/x-icon' });
  res.end();
};

const publicResource = (req, res, parsedUrl) => {
  let pathname = `.${parsedUrl.pathname}`.replace(/^(\.)+/, '.');
  const { ext } = path.parse(pathname);

  const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
  };

  // This is secure. We already forced on the distacher that the pathnames begins with /public
  fs.access(pathname, fs.constants.F_OK, (notAccessError) => {
    if (notAccessError) {
      notFoundResource(req, res);
      return;
    }

    // if is a directory search for index file matching the extention
    if (fs.statSync(pathname).isDirectory()) pathname += `/index ${ext}`;

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Error getting the file.');
      } else {
        res.setHeader('Content-type', map[ext] || 'text/plain');
        res.end(data);
      }
    });
  });
};

exports.authResource = authResource;
exports.rootResource = rootResource;
exports.notFoundResource = notFoundResource;
exports.faviconResource = faviconResource;
exports.publicResource = publicResource;
