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

  else if (req.body.type === 'event_callback') {
    let event = req.body.event;
    console.log(`Received ${event.type} event.`);
    if (event.type === 'message') {
      console.log(`${event.user} in the ${event.channel} ${event.channel_type} said ${event.text}`);
    }
  }
});

app.post('/activate', bodyParser.urlencoded(), (req, res) => {
  console.log(`Received enablelogger command call || Token Status: ${req.body.token === slackToken}`);

  if (!verifiyToken(res.body.token)) return;

  request.get({
    url: 'https://slack.com/api/apps.permissions.request', 
    
    form: {
      token: workspaceToken,
      scopes: 'channels:history,channels:read,' +
              'groups:history,groups:read,' +
              'im:history,im:read,' +
              'mpim:history,mpim:read',
      trigger_id: req.body.trigger_id
    }}, 

    (error, response, body) => {
      let message;
      body = JSON.parse(body)
      if (body.ok && !error && response.statusCode === 200) message = "Success!";
      else message = 'Something went wrong. Please try again later!';

      request.post({url: req.body.response_url, json: true, body: {
        response_type: 'ephemeral',
        text: message
      }});
  });

});

app.listen(port, () => console.log(`App listening on port ${port}!`))
