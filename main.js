
const axios = require('axios');

// Zendesk API credentials
const zendeskDomain = 'cardiacsense';
const zendeskEmail = 'julian.stejman@cardiacsense.com';
const zendeskApiToken = 'ud0yeUOH4x1bMORI1xOEBTMwwxPOpfQMjveym5Eo';
const syncOrcanosID = '360076578078';


// Function to get tickets from Zendesk
async function getZendeskTickets() {
    try {
        const response = await axios.get(`https://${zendeskDomain}.zendesk.com/api/v2/views/${syncOrcanosID}/tickets.json`, {
            auth: {
                username: `${zendeskEmail}/token`,
                password: zendeskApiToken
            }
        });
        return response.data.tickets;

    } catch (error) {
        console.error(`Failed to fetch tickets from Zendesk: ${error.response.status}`);
        return [];
    }
    
}
//I'd like to see the tickets in the console
getZendeskTickets().then(tickets => {
    for(i in tickets){
    console.log(tickets[i].id);
    }
});