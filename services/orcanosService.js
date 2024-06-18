const axios = require('axios');
const config = require('../config/config');
const { getOrcanosAuth } = require('../utils/auth');

async function postToOrcanos(workItem) {
  let formattedDescription = workItem.caseDescription.replace(/\\n/g, '\n');

  let data = {
    Project_ID: 9347,
    Major_Version: 31,
    Minor_Version: 1,
    Object_Type: 'Complaint',
    Object_Name: workItem.summary,
    Description: formattedDescription,
    Insert_to_Pool: 'N',
    SkipIfNameExists: 'N',
    CS318_value: workItem.customerCountry,
    Due_date: workItem.dateZendesk,
    Created_date: workItem.dateOrcanos,
    CS8_value: workItem.dateDiscovered,
    CS313_value: workItem.ticketID,
    CS314_value: workItem.ticketURL,
    CS299_value: workItem.customerName,
    Cust_email: workItem.customerEmail,
    CS56_value: workItem.registrationDate,
    CS309_value: workItem.watch_s_n,
    CS308_value: workItem.phoneAppVersion,
    CS319_value: workItem.OSVersion,
    CS311_value: workItem.watchSoftwareVersion,
    CS42_value: workItem.phoneManufacturer,
    CS75_value: workItem.phoneModel,
    CS191_value: workItem.complaintCategory,
    CS128_value: workItem.isRMA ? 1 : 0, // checkbox
    CS17_value: workItem.rmaReason,
  };

  try {
    let response = await axios.post(`https://app.orcanos.com/${config.orcanos.domain}/api/v2/json/QW_Add_Object`, data, {
      headers: {
        Authorization: `Basic ${getOrcanosAuth()}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error posting to Orcanos:', error);
  }
}

module.exports = {
  postToOrcanos,
};
