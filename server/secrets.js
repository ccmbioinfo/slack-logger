const fs = require('fs');
const util = require('util');

module.exports = {
  get(secret) {
    try {
      return fs.readFileSync(util.format(`/run/secrets/${secret}`),
      'utf8').trim();
    }
    catch(e) {
      console.log(`failed to fetch secret ${secret}, err: ${e}`);
      return false;
    }
  }
}
