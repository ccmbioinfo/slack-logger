// Setup the database for use with the slack-logger
app_pw = cat('/run/secrets/MONGO_APP_PASSWORD');

// Connect and auth to root user
conn = new Mongo();
db = conn.getDB('slacklog');

// Create non-root user with readWrite perms for application
db.createUser({
  user: 'slacklogger',
  pwd: app_pw,
  roles: ['readWrite']  
});

db.messages.createIndex({ channel: 1, ts: -1 });
