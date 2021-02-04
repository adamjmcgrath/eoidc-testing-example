const express = require('express');
const { auth } = require('express-openid-connect');

const app = express();

app.use(auth({
  authRequired: true,
  issuerBaseURL: 'https://issuer.example.com',
  clientID: '__client_id__',
  baseURL: 'https://example.com',
  secret: '__some_long_secret_string__'
}));

app.get('/', (req, res) => {
  res.json({ user: req.oidc.user.sub });
});

module.exports = app;
