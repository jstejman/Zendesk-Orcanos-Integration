const config = require('../config/config');

function getOrcanosAuth() {
  return Buffer.from(`${config.orcanos.user}:${config.orcanos.password}`).toString('base64');
}

module.exports = {
  getOrcanosAuth,
};