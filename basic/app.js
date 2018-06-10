const https = require('https');
const fs = require('fs');
const url = require('url');
const resources = require('./resources.js');
const config = require('../config.json');

const options = {
  key: fs.readFileSync(config.certificates.key),
  cert: fs.readFileSync(config.certificates.crt),
};

const PORT = 9000;
const HOSTNAME = 'localhost';


console.log(`Serving on https://${HOSTNAME}:${PORT}`);

https.createServer(options, (req, res) => {
  req.on('error', (err) => {
    console.error(err);
    res.statusCode = 400;
    res.end();
  });

  res.on('error', (err) => {
    console.error(err);
  });

  const parsedUrl = url.parse(req.url);
  const pathName = parsedUrl.pathname;
  console.log(`pathName ${pathName}`);

  if (parsedUrl.pathname.match(/^\/public\//i)) {
    resources.publicResource(req, res, parsedUrl);
  } if (parsedUrl.pathname.match(/^\/private\//i)) {
    resources.privateResource(req, res);
  } else {
    const resourceMap = {
      '/': 'rootResource',
      '/auth': 'authResource',
      '/favicon.ico': 'faviconResource',
    };

    const handler = resourceMap[pathName] || 'notFoundResource';
    resources[handler](req, res);
  }
}).listen(PORT, HOSTNAME);

