const path = require('path');
const fs = require('fs');
const { authenticated } = require('./authentication.js');

const handleAuth = (req, res) => {
  authenticated(req.headers)
    .then((granted) => {
      res.end(JSON.stringify({
        granted,
      }));
    })
    .catch((err) => {
      if (err) {
        console.error(err);

        res.statusCode = 500;
        res.end();
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

const privateResource = (req, res) => {
  authenticated(req.headers)
    .then((granted) => {
      if (granted) {
        fs.readFile('./private/index.html', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end('Error getting the file.');
          } else {
            res.setHeader('Content-type', 'text/html');
            res.end(data);
          }
        });
      } else {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="private", charset="UTF-8"');
        res.end();
      }
    })
    .catch((err) => {
      if (err) {
        console.error(err);

        res.statusCode = 500;
        res.end();
      }
    });
};

exports.authResource = authResource;
exports.rootResource = rootResource;
exports.notFoundResource = notFoundResource;
exports.faviconResource = faviconResource;
exports.publicResource = publicResource;
exports.privateResource = privateResource;
