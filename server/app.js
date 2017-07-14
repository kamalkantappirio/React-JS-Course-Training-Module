/* eslint-disable no-useless-escape,no-unused-vars */
// server/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const session = require('express-session');
const api = require('./routes');
const account = require('./sfdc');
const herokuProxy = require('heroku-proxy');
const pgClient = require('./sfdc/pgclient')
const passport = require('passport');
// const WEB_ROOT = process.env.WEB_ROOT;

const {
    WEB_ROOT
} = process.env;

require('./connectors/passport-sfdc');
require('newrelic');
require('dotenv').config();

app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 'loopback');

app.use(session({ secret: 'keyboard cat' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

app.post('/account', function(req, res){

  const accessToken = req.body.accessToken;
  const instanceUrl = req.body.instanceUrl;
  const aDetail = account.getAccountList(accessToken, instanceUrl);

  aDetail.then((response) => {
    console.log(response);
    return res.status(200).json(response);
  })
        .catch((error) => {
          console.log(error);
          return error;
        });
});

app.get('/login', (req, res) => passport.authenticate('forcedotcom')(req, res));


app.get('/mapping', (req, res) => {
  const aMapping = pgClient.getFieldsMapping();

  aMapping.then(rows => res.json(rows))
        .catch((error) => {
          console.error(error);
          return error;
        });
});

/* app.get('/mapping/:field',function(req, res) {
 console.log(req);
 const aMapping = pgClient.getMapping(req.params.field);

 aMapping.then(function(rows) {
 return res.json(rows);
 })
 .catch(function(error) {
 console.error(error)
 return error;
 });

 });*/

app.post('/mapping', (req, res) => {
  console.log(req.body);
  const aMapping = pgClient.updateMapping(req.body);

  aMapping.then(() => res.status(200).json('success'));
});


app.post('/login', (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;

  const aDetail = account.authUserSfdc(username, password);

  aDetail.then((response) => {
    console.log(response);
    return res.status(200).json(response);
  })
        .catch((error) => {
          console.log(error);
          return error;
        });
});

// GET /auth/forcedotcom
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Force.com authentication will involve
//   redirecting the user to your domain.  After authorization, Force.com will
//   redirect the user back to this application at /auth/forcedotcom/callback
app.get('/auth/forcedotcom', passport.authenticate('forcedotcom'), (req, res) => {
    // The request will be redirected to Force.com for authentication, so this
    // function will not be called.
});
// GET /auth/forcedotcom/callback
//   PS: This MUST match what you gave as 'callback_url' earlier
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/forcedotcom/callback', passport.authenticate('forcedotcom', {
  failureRedirect: `${WEB_ROOT}/`
}), (req, res) => {
  res.redirect(`${WEB_ROOT}/?access_token=${res.req.user.params.access_token}&instance_url=${res.req.user.params.instance_url}&user_id=${res.req.user.params.id}`);
});

app.get('/logout', (req, res) => {
  res.redirect('/');
});

// app.listen(3001);
// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Redirect all routes back to index.html, as this is simply serves up a SPA
app.get('/[^\.]+$', (req, res) => {
  res.set('Content-Type', 'text/html')
        .sendFile(`${__dirname}/build/index.html`);
});


module.exports = app;
