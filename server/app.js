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
      
      // Comment in a thread
      if (event.thread_ts) {
        // Update thread head
        // Doesn't push text since should
        // reference comment message itself
        messages.findOneAndUpdate({
          channel: event.channel,
          ts: event.thread_ts
        },
        {
          $push: {
            thread: {
              $each: [{
                user: event.user,
                ts: event.ts
              }],
              $position: 0
            }
          }
        });

        // Push event as is with edited array
        event.edited = [];
        messages.insertOne(event);
      }

      else if (event.subtype === 'message_changed') {
        // Thread broadcasts are ignored because they do not really
        // follow the standard convention and are fairly unnecessary
        // as comments are caught as normal messages anyways.
        if (event.message.subtype !== 'thread_broadcast') {

          // Appends to edited array in message
          // push the edited object with text and ts at position 0
          messages.findOneAndUpdate({
            channel: event.message.channel,
            ts: event.message.ts
          },
          {
            $push: {
              edited: {
                $each: [{
                  user: event.message.edited.user,
                  text: event.message.text,
                  ts: event.message.edited.ts
                }],
                $position: 0
              }
            }
          });
          
        }
      }

      // Sets deleted and time deleted in message object
      else if (event.subtype === 'message_deleted') {
        messages.findOneAndUpdate({
          channel: event.channel,
          ts: event.deleted_ts
        },
        {
          $set: {
            deleted: true,
            deleted_ts: event.ts
          }
        });
      }
      
      // Inserts event as is into messages collection
      else {
        event.edited = [];
        event.thread = [];
        messages.insertOne(event);
      }
    }
  }
});

// allow db some time to initialize
setTimeout(establishConnection, 2000);
