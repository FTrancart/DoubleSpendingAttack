"use strict";

const url = require('url');
const express = require("express");
var app = express()
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const rq = require("request");
const fs = require('fs');
const helmet = require('helmet');
const csp = require('helmet-csp')
const request = require("request");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const logger =  require('./logger.js')('server', "./logs/");
const Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// checking if password is valid
function validPassword(password, good_password) {
	return true;
};

function authenticate_user(req, res, next) {
	var remote = req.ip || req.connection.remoteAddress;
	var islocal = (remote === '::1') || (remote === 'localhost') || (remote === '::ffff:127.0.0.1');
	var auth = islocal || req.isAuthenticated();
	if (auth) {
		return next();
	}
	res.redirect(302, '/login');
}

function log_req(req, res, next) {
	var query = url.parse(req.url, true, true).query;
	var cookies = cookie.parse(req.headers.cookie || '');
	var rr = req.get('Referer');
	var realip = req.get('X-Real-IP');
	if (realip === undefined) {
		realip = "";
	}
	if (req.path != "/subscribe") {
		logger.info(req.method + " " + req.ip + " " + realip + " " + req.path + " " + cookies.cookie + " " + JSON.stringify(query) + " " + rr);
	}
	return next();
}

var appRouter = function(app) {
	var nocache = require('nocache')
	app.use(helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'", "https://ropsten.infura.io"],
			sandbox: ['allow-forms', 'allow-scripts'],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:"],
			styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
			fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
			connectSrc :["'self'", "https://ropsten.infura.io"]
		},
		reportOnly: true,
		browserSniff: false
	}));
//  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
//  app.use(nocache());
//  app.disable('x-powered-by')
app.use(cookieParser());
app.use(log_req);
app.use('/', express.static(app.opt.webroot));
app.use('/abi', express.static('../dapp/build/contracts/'));
app.use(function (err, req, res, next) {
 //   console.error(err.stack)
 res.status(500).send('Internal Error, sorry.')
})

logger.info("Express init done");
};

module.exports = appRouter;
