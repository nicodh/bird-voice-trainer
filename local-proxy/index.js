/**
 * Module dependencies.
 */
const express = require('express');
const httpProxy = require('http-proxy');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiForwardingUrl = 'https://www.xeno-canto.org';

const proxyOptions = {
    changeOrigin: true
};

httpProxy.prototype.onError = function (err) {
    console.log(err);
};

const apiProxy = httpProxy.createProxyServer(proxyOptions);

console.log('Forwarding API requests to ' + apiForwardingUrl);

// Node express server setup.
const server = express();
server.set('port', 3000);
server.use(express.static(__dirname + '/app'));
server.use(cors());

server.all("/api/*", function(req, res) {
    apiProxy.web(req, res, {target: apiForwardingUrl});
});


server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: true
}));

// Start Server.
server.listen(server.get('port'), function() {
  console.log('Express server listening on port ' + server.get('port'));
});