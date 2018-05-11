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
    console.error('Token received does not match the token provided by Slack.');
    return false;
  }
  return true;
}

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  console.log(`Received event logging call of type ${req.body.type} || Token Status: ${req.body.token === slackToken}`);

  if (!verifiyToken(req.body.token)) return;

  if (req.body.type === 'url_verification') {
    console.log("Responding to Slack's Events URL verification request.");
    res.json({ challenge: req.body.challenge });
  }

  else if (req.body.type === 'event_callback') {
    res.statusCode(200);
    let event = req.body.event;
    console.log(`Received ${event.type} event.`);
    if (event.type === 'message') {
      console.log(`${event.user} in the ${event.channel} ${event.channel_type} said ${event.text}`);
    }
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
