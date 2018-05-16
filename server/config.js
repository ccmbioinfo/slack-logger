const secrets = require('./secrets');

module.exports = {

  port: process.env.PORT || 80,

  slack: {
    clientID: secrets.get('SLACK_CLIENT_ID') || process.env.SLACK_CLIENT_ID,
    secret: secrets.get('SLACK_SECRET') || process.env.SLACK_SECRET,
    verificationToken: secrets.get('SLACK_VERIFICATION_TOKEN') || process.env.SLACK_VERIFICATION_TOKEN,
    workspaceToken: secrets.get('SLACK_WORKSPACE_TOKEN') || process.env.WORKSPACE_TOKEN,
  },

  mongo: {
    address: 'db:27017',
    database: 'slacklog',
    password: secrets.get('MONGO_APP_PASSWORD') || process.env.MONGO_APP_PASSWORD,
  }
}
