require('dotenv').config();

module.exports = {
  zendesk: {
    domain: process.env.ZENDESK_DOMAIN,
    email: process.env.ZENDESK_EMAIL,
    apiToken: process.env.ZENDESK_API_TOKEN,
    syncOrcanosID: process.env.SYNC_ORCANOS_ID,
  },
  orcanos: {
    domain: process.env.ORCANOS_DOMAIN,
    user: process.env.ORCANOS_USER,
    password: process.env.ORCANOS_PASSWORD,
  },
};