## Practicing Authentication Methods

All the authentication methods here listed go over a HTTPS server. Thus, certificates are required.

### Naive
This type encodes on Base64 the user input, and sends it on the body. 

### Installation
Configure the certificates location on config.js
$ cd naive
$ npm install
$ npm start
