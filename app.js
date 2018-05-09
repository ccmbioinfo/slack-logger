const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express()
const port = config.port;
const slackSecret = config.slack.secret;
const slackToken = config.slack.verificationToken;

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  if (req.body.type === 'url_verification') {
    console.log('Received challenge from Slack, checking token...');
    
    if (req.body.token !== slackToken) {
      console.error('Token received from Slack and token given do not match!');
    }

    else {
      console.log('Token is OK, responding to challenge.');
      res.json({ challenge: req.body.challenge });
    }
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
