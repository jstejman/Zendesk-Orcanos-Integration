
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
        this.customerCountry = (ticket.custom_fields.find(field => field.id === 1900000216213)?.value) ?? '' //needs to be hardcoded because of a duplicate field
        this.status = "New"
        this.dateZendesk = ticket.created_at;
        this.dateOrcanos = new Date();
        this.dateDiscovered = ticket.created_at;
        this.ticketID = ticket.id;
        this.ticketURL = (ticket.url).split(".json")[0];
        this.customerName //get from customer ID
        this.customerEmail //get from customer ID
        this.registrationDate//get from customer ID
        this.watch_s_n = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: Watch S/N'])?.value) ?? '';
        this.phoneAppVersion = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: Phone app. version'])?.value) ?? '';
        this.OSVersion = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: OS Version'])?.value) ?? '';
        this.watchSoftwareVersion = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: Watch firmware version'])?.value) ?? '';
        this.phoneManufacturer = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: Phone Manufacturer'])?.value) ?? '';
        this.phoneModel = (ticket.custom_fields.find(field => field.id === ticketFields['Client data: Phone Model'])?.value) ?? '';
        this.complaintCategory = (ticket.custom_fields.find(field => field.id === ticketFields['Complaint Category'])?.value) ?? '';
        this.caseDescription = ticket.description ?? '';
        this.isRMA; //get from ticket form
        this.rmaReason; //get from ticket 
    }
    async postToOrcanos() {
        // replaces all occurrences of \n with actual newline characters in this.caseDescription
        let formattedDescription = this.caseDescription.replace(/\\n/g, '\n');
        
        let data = {
            "Project_ID": 9347,
            "Major_Version": 31,
            "Minor_Version": 1,
            "Object_Type": "Complaint",
            "Object_Name": this.summary,
            "Description": formattedDescription,
            "Insert_to_Pool": "N",
            "SkipIfNameExists": "N",
            "CS318_value": this.customerCountry,
            "Due_date": this.dateZendesk,
            "Created_date": this.dateOrcanos,
            "CS8_value": this.dateDiscovered,
            "CS313_value": this.ticketID,
            "CS314_value": this.ticketURL,
            "CS299_value": this.customerName,
            "Cust_email": this.customerEmail,
            "CS56_value": this.registrationDate,
            "CS309_value": this.watch_s_n,
            "CS308_value": this.phoneAppVersion,
            "CS319_value": this.OSVersion,
            "CS311_value": this.watchSoftwareVersion,
            "CS42_value": this.phoneManufacturer,
            "CS75_value": this.phoneModel,
            "CS191_value": this.complaintCategory,
            "CS128_value": this.isRMA ? 1 : 0, // checkbox
            "CS17_value": this.rmaReason
        };
    
        try {
            let response = await axios.post(`https://app.orcanos.com/${orcanosDomain}/api/v2/json/QW_Add_Object`, data, {
                headers: {
                    'Authorization': `Basic ${orcanosAuth}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error posting to Orcanos:', error);
        }
    }
    
    async updateZendesk(){}
    async updateWorkItem(){}
}

async function createWorkItemsFromTickets() {
    
    tickets = await getZendeskTickets();
    workItems = [];
    for (const ticket of tickets) {
        const workItem = new WorkItem();
        await workItem.createFromTicket(ticket);
        workItems.push(workItem);
    }
    return workItems;
}


async function main() {
    workItems = await createWorkItemsFromTickets();
    for(i in workItems){
        console.log(workItems[i]);
    }
}   

main()




