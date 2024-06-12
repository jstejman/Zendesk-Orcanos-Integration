
const axios = require('axios');

// Zendesk credentials and API token
const zendeskDomain = 'cardiacsense';
const zendeskEmail = 'julian.stejman@cardiacsense.com';
const zendeskApiToken = 'ud0yeUOH4x1bMORI1xOEBTMwwxPOpfQMjveym5Eo';
const syncOrcanosID = '360076578078';
// Orcanos credentials
const orcanosDomain = 'cardiacsense';
const orcanosUser = 'Julian.Stejman';
const orcanosPassword = 'Nailuj98';
const orcanosAuth = Buffer.from(`${orcanosUser}:${orcanosPassword}`).toString('base64');


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

// create a dictionary from the ticket field titles and their IDs 
async function getTicketFields() {
    try {
        const response = await axios.get(`https://${zendeskDomain}.zendesk.com/api/v2/ticket_fields.json`, {
            auth: {
                username: `${zendeskEmail}/token`,
                password: zendeskApiToken
            }
        });
        const ticketFields = {};
        response.data.ticket_fields.forEach(field => {
            ticketFields[field.title] = field.id; 

        });
        return ticketFields;
    } catch (error) {
        console.error(`Failed to fetch ticket fields from Zendesk: ${error.response.status}`);
        return {};
    }
}

class WorkItem {
    //Overview Items
    summary = '';
    priority = '';
    category = '';
    customerEmail = '';
    customerCountry = '';
    status = '';
    assignedTo = '';
    dateZendesk = '';
    dateOrcanos = '';
    dateDiscovered = '';
    //Input from Zendesk
    ticketID = '';
    ticketURL = '';
    customerName = '';
    registrationDate = '';
    watch_s_n = '';
    phoneAppVersion = '';
    OSVersion = '';
    watchSoftwareVersion = '';
    phoneManufacturer = '';
    phoneModel = '';
    complaintCategory = '';
    caseDescription = '';
    //RMA
    isRMA = false;
    rmaNumber = '';
    rmaReason = '';
    dateReceived = '';
    inspectionDetails = '';
    //Injury

    //Update to Zendesk
    details = '';
    dateResolved = '';
    ticketSolvedUpdateZD = '';
    
    async createFromTicket(ticket){
        const ticketFields = await getTicketFields();
        this.summary = ticket.subject;
        this.priority = ticket.priority;
        this.category; //must be able to handle it from the ticket
        this.customerCountry = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: Country'])?.value) ?? ''
        this.status // "Unsolved"
        this.dateZendesk = ticket.created_at;
        this.dateOrcanos = new Date();
        this.dateDiscovered = ticket.created_at;
        this.ticketID = ticket.id;
        this.ticketURL = ticket.url;
        this.customerName //get from customer ID
        this.customerEmail //get from customer ID
        this.registrationDate = //get from customer ID
        this.watch_s_n = (ticket.custom_fields.find(field => field.id === ticketFields['Watch S/N'])?.value) ?? '';
        this.phoneAppVersion = (ticket.custom_fields.find(field => field.id === ticketFields['Phone App Version'])?.value) ?? '';
        this.OSVersion = (ticket.custom_fields.find(field => field.id === ticketFields['OS Version'])?.value) ?? '';
        this.watchSoftwareVersion = (ticket.custom_fields.find(field => field.id === ticketFields['Watch Software Version'])?.value) ?? '';
        this.phoneManufacturer = (ticket.custom_fields.find(field => field.id === ticketFields['Phone Manufacturer'])?.value) ?? '';
        this.phoneModel = (ticket.custom_fields.find(field => field.id === ticketFields['Phone Model'])?.value) ?? '';
        this.complaintCategory = (ticket.custom_fields.find(field => field.id === ticketFields['Complaint Category'])?.value) ?? '';
        this.caseDescription = (ticket.custom_fields.find(field => field.id === ticketFields['Case Description'])?.value) ?? '';
        this.isRMA; //get from ticket form
        this.rmaReason; //get from ticket 
    }
    async postToOrcanos(){}
    async updateZendesk(){}
}

async function createWorkItemsFromTickets() {
    
    tickets = await getZendeskTickets();
    workItems = [];
    tickets.forEach(ticket => {
        workItem = new WorkItem();
        workItem.createFromTicket(ticket);
        workItems.push(workItem);
    });
    return workItems;
}


async function main() {
    workItems = await createWorkItemsFromTickets();
    console.log(workItems);
}

main()




