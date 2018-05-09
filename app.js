const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express()
const port = config.port;
const slackSecret = config.slack.secret;
const slackToken = config.slack.verificationToken;
const workspaceToken = config.slack.workspaceToken;

function verifiyToken(token) {
  if (token !== slackToken) {
    console.error('Token received does not match the token provided by Slack.')
    return false;
  }
  return true;
}

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  console.log(`Received logging call of type ${req.body.type} || Token Status: ${req.body.token === slackToken}`);

  if (!verifiyToken(res.body.token)) return;

  if (req.body.type === 'url_verification') {
    console.log("Responding to Slack's Events URL verification request.");
    res.json({ challenge: req.body.challenge });
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
