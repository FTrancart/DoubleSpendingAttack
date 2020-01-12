"use strict";

const local_api_port = 9201;
const ssl_port = 8443;

const express = require("express");
const bodyParser = require("body-parser");
const logger =  require('./logger.js')('server', "./logs/");
const argv = require('minimist')(process.argv.slice(2));
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const httpApp = express();

process.env.TZ = "UTC";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.opt = parse_args(argv);

if (app.opt.nossl === false) {

  httpApp.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
  });

  const options = {
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem')
  };

  http.createServer(httpApp).listen(local_api_port, function() {
    logger.info('HTTP server listening on port ' + local_api_port);
  });

  https.createServer(options, app).listen(ssl_port, function() {
    logger.info('HTTPS server listening on port ' + ssl_port);
  });
} else {
  const server = app.listen(local_api_port, function () {
    logger.info("Listening on port %s...", server.address().port);
  });
};

const routes = require("./routes.js")(app);

function parse_args(args) {
  let opt = {};

  if (args.nologin == true) {
    opt.nologin = true;
  } else {
    opt.nologin = false;
  }

  if (args.ssl == true) {
    opt.nossl = false;
  } else {
    opt.nossl = true;
  }
  if (args.web3rpc !== undefined && args.web3rpc !== "") {
    opt.web3rpc = args.web3rpc;
  }
  if (args.contract !== undefined && args.contract !== "") {
    opt.contract = "0"+ args.contract;
  }
  if (args.webroot !== undefined && args.webroot != "") {
    opt.webroot = args.webroot;
  } else {
    opt.webroot = "../www/"
  }
  return opt;
}
