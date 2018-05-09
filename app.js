const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express()
const port = config.port;
const slackSecret = config.slack.secret;
const slackToken = config.slack.verificationToken;

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  console.log(`Received call of type ${req.body.type} || Token Status: ${req.body.token == slackToken}`);

  if (req.body.token !== slackToken) {
    console.error('Token received does not match the token provided by Slack. Ignoring call...');
    return;
  }

  if (req.body.type === 'url_verification') {
    console.log("Responding to Slack's Events URL verification request.");
    res.json({ challenge: req.body.challenge });
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
