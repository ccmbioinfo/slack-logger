const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express()
const port = process.env.PORT || config.port || 3000;
const slackToken = process.env.SLACK_VERIFICATION_TOKEN || config.token;

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  if (req.body.type === 'url_verification') {
    console.log('Received challenge from Slack, checking token...');
    
    if (req.body.token !== slackToken) {
      console.error('Token received from Slack and token given do not match!');
      throw Error('Mismatched tokens, please check the token.');
    }

    else {
      console.log('Token is OK, responding to challenge.');
      res.json({ challenge: req.body.challenge });
    }
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
