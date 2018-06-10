## Practicing Authentication Methods

All the authentication methods here listed go over a HTTPS server. Thus, certificates are required.

The code is probably incomplete, buggy and the protocols are implemented as I best understand. Please do not use it for any production server.

### Naive
This type encodes on Base64 the user input, and sends it on the body. 

#### Installation
Configure the certificates location on config.js
$ cd naive
$ npm install
$ npm start

### Basic
Implement Basic Auth. 
User/Pass go in the Authentication header, encoded.
Everything under /private/ required authentication, so the user is prompted to log in.

#### Installation
Configure the certificates location on config.js
$ cd basic
$ npm install
$ npm start
