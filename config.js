const secrets = require('secrets');

module.exports = {

  port: 80,

  slack: {
    clientID: secrets.get('SLACK_CLIENT_ID'),
    secret: secrets.get('SLACK_SECRET'),
    verificationToken: secrets.get('SLACK_VERIFICATION_TOKEN')
  }

}
