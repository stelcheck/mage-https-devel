mage-https-devel
=================

Toolchain for enabling the use of HTTPS during local development.

MAGE does not support HTTPS at the moment; this is because historically, 
applications built on MAGE were placed behind a load balancer which provided
the encryption layer.

While this very practical, it may also create certain hindrances and issues.

  1. Some client-side bugs may only appear when using HTTPS
  2. Some tools may only be able to communicate with your development instance using HTTPS

This module solves the issue by providing commands and tools to:

  1. Create a self-signed SSL certificate
  2. Locally installing and trusting the certificate (Windows and macOS only)
  3. Setting an HTTPS proxy upon MAGE start

Installation
------------

```shell
npm install --save-dev mage-https-devel
```

Usage
-----

### Code modification

> ./package.json

```json
{
  "scripts": {
    "ssl:create": "mage-ssl-create"
  }
}
```

> ./config/development.yaml

```yaml
server:
  clientHost:
    httpsProxy: true
    # Other options here
```

> ./lib/index.js

```javascript
var mage = require('mage')

// This will start the proxy only when server.clientHost.httpsProxy is
// set to true in your configuration
var https = require('mage-https-devel')
https.setup(mage)
```

### Creating your local SSL certificate

Note: you **must** run this on your local machine; if you are running your MAGE
application in Docker, you must make sure to run this in a separate terminal, 
or before initializing your container.

```shell
npm run ssl:create
```

This command will create a local certificate based on your development configuration,
locally install it and mark it as trusted.

### Running your instance with the HTTPS proxy

Simply start your MAGE server the same way you would normally start it;
once MAGE is set up, this module will automatically start an HTTPS proxy server
on port 8443.

License
-------

MIT
