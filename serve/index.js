const selfSSL = false;
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const corrosion = require('../');
const port = process.env.PORT || 7070;
const app = express();
const ssl = {
    key: fs.readFileSync(path.join(__dirname, '/ssl.key')),
    cert: fs.readFileSync(path.join(__dirname, '/ssl.cert')),
};
const server = selfSSL ? https.createServer(ssl, app) : http.createServer(app);
const proxy = new corrosion({
    codec: 'plain',
    prefix: '/service/',
    forceHttps: !selfSSL
});
proxy.bundleScripts();

app.use(express.static(path.join(__dirname, '/public')));
app.use((req, res) => {
    if (req.url.startsWith(proxy.prefix)) return proxy.request(req, res);
    res.status(404).send('<pre>Error 404</pre>');
});
server.on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead));

server.listen(port);
console.log('Listening on port ' + port);
