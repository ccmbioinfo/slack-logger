const express = require('express');
const mongodb = require('mongodb');
const request = require('request');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express()
const port = config.port;
const slackSecret = config.slack.secret;
const slackToken = config.slack.verificationToken;
const workspaceToken = config.slack.workspaceToken;

const MongoClient = mongodb.MongoClient;
const mongoAddress = config.mongo.address;
const mongoDatabase = config.mongo.database;
const mongoPassword = config.mongo.password;
const address = `mongodb://slacklogger:${mongoPassword}@${mongoAddress}/${mongoDatabase}`;
let db;

function establishConnection() {
  MongoClient.connect(address, (err, database) => {
    if (err) {
      // try to reconnect in 5s
      console.log('Reconnecting to db in 5 seconds...');
      setTimeout(establishConnection, 5000);
    }

    else {
      // established db connection, start app
      db = database.db('slacklog');
      console.log('Established connection to db.');
      app.listen(port, () => console.log(`App listening on port ${port}!`));
    }
  });
}


function verifySlackToken(token) {
  if (token !== slackToken) {
    console.error('Token received does not match the token provided by Slack.');
    return false;
  }
  return true;
}

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  console.log(`Received event logging call of type ${req.body.type} || Token Status: ${req.body.token === slackToken}`);

  if (!verifySlackToken(req.body.token)) return;

  if (req.body.type === 'url_verification') {
    console.log("Responding to Slack's Events URL verification request.");
    res.json({ challenge: req.body.challenge });
  }

  else if (req.body.type === 'event_callback') {
    res.sendStatus(200);
    let event = req.body.event;
    console.log(`Received ${event.type} event.`);

    if (event.type === 'message') {
      let messages = db.collection('messages');
      console.log(`${event.user} in the ${event.channel_type} ${event.channel} said ${event.text}`);
      
      // Appends to edited array in message
      // push the edited object with text and ts at position 0
      if (event.edited) {
        message.findOneAndUpdate({ // search params
          channel: event.channel,
          ts: event.ts
        },
        {
          $push: {
            edited: {
              $each: [{
                text: event.text,
                ts: event.edited.ts
              }],
              $position: 0
            }
          }
        });
      }
      
      // Inserts event as is into messages collection, adding arr for edited
      else {
        event.edited = [];
        messages.insertOne(event);
      }
    }

    }
  }
});

// allow db some time to initialize
setTimeout(establishConnection, 2000);
