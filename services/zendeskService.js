const axios = require('axios');
const config = require('../config/config');

async function getZendeskTickets() {
  try {
    const response = await axios.get(`https://${config.zendesk.domain}.zendesk.com/api/v2/views/${config.zendesk.syncOrcanosID}/tickets.json`, {
      auth: {
        username: `${config.zendesk.email}/token`,
        password: config.zendesk.apiToken,
      },
    });
    return response.data.tickets;
  } catch (error) {
    console.error(`Failed to fetch tickets from Zendesk: ${error.response.status}`);
    return [];
  }
}

async function getTicket(ticket_id) {
  try {
    const response = await axios.get(`https://${config.zendesk.domain}.zendesk.com/api/v2/tickets/${ticket_id}`, {
      auth: {
        username: `${config.zendesk.email}/token`,
        password: config.zendesk.apiToken,
      },
    });
    return response.data.ticket;
  } catch (error) {
    console.error(`Failed to fetch ticket from Zendesk: ${error.response.status}`);
    return [];
  }
}

async function getTicketFields() {
  try {
    const response = await axios.get(`https://${config.zendesk.domain}.zendesk.com/api/v2/ticket_fields.json`, {
      auth: {
        username: `${config.zendesk.email}/token`,
        password: config.zendesk.apiToken,
      },
    });
    const ticketFields = {};
    response.data.ticket_fields.forEach((field) => {
      ticketFields[field.title] = field.id;
    });
    return ticketFields;
  } catch (error) {
    console.error(`Failed to fetch ticket fields from Zendesk: ${error.response.status}`);
    return {};
  }
}

async function getUserInfo(user_id) {
  try {
    const response = await axios.get(`https://${config.zendesk.domain}.zendesk.com/api/v2/users/${user_id}`, {
      auth: {
        username: `${config.zendesk.email}/token`,
        password: config.zendesk.apiToken,
      },
    });
    const userInfo = {};
    if (response.data.user.user_fields.first_name === null || response.data.user.user_fields.last_name === null) {
      userInfo.name = response.data.user.name;
    } else if (response.data.user.name === null) {
      userInfo.name = '';
    } else {
      userInfo.name = response.data.user.user_fields.first_name + ' ' + response.data.user.user_fields.last_name;
    }
    userInfo.email = response.data.user.email;
    userInfo.registration_date = response.data.user.created_at;
    userInfo.country = response.data.user.user_fields.country;

    return userInfo;
  } catch (error) {
    console.error(`Failed to fetch user info from Zendesk: ${error.response.status}`);
    return {};
  }
}

function getTicketFieldValues(ticket, field_id) {
  return ticket.custom_fields.find((field) => field.id === field_id)?.value ?? '';
}

module.exports = {
  getZendeskTickets,
  getTicket,
  getTicketFields,
  getUserInfo,
  getTicketFieldValues,
};
