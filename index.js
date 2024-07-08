const axios = require('axios');
require('dotenv').config();

function getOrcanosAuth() {
    return Buffer.from(`${process.env.ORCANOS_USER}:${process.env.ORCANOS_PASSWORD}`).toString('base64');
}


async function getZendeskTickets() {
    try {
        const response = await axios.get(`https://${process.env.ZENDESK_DOMAIN}.zendesk.com/api/v2/views/${process.env.SYNC_ORCANOS_ID}/tickets.json`, {
            auth: {
                username: `${process.env.ZENDESK_EMAIL}/token`,
                password: process.env.ZENDESK_API_TOKEN,
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
        const response = await axios.get(`https://${process.env.ZENDESK_DOMAIN}.zendesk.com/api/v2/tickets/${ticket_id}`, {
            auth: {
                username: `${process.env.ZENDESK_EMAIL}/token`,
                password: process.env.ZENDESK_API_TOKEN,
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
        const response = await axios.get(`https://${process.env.ZENDESK_DOMAIN}.zendesk.com/api/v2/ticket_fields.json`, {
            auth: {
                username: `${process.env.ZENDESK_EMAIL}/token`,
                password: process.env.ZENDESK_API_TOKEN,
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
        const response = await axios.get(`https://${process.env.ZENDESK_DOMAIN}.zendesk.com/api/v2/users/${user_id}`, {
            auth: {
                username: `${process.env.ZENDESK_EMAIL}/token`,
                password: process.env.ZENDESK_API_TOKEN,
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

async function postToOrcanos(workItem) {
    let formattedDescription = workItem.caseDescription.replace(/\\n/g, '\n');

    let data = {
        Project_ID: 9347,
        Major_Version: 31,
        Minor_Version: 1,
        Object_Type: "Complaint",
        Object_Name: workItem.summary,
        Description: formattedDescription,
        CS27_Name: "Case Description",
        CS27_value: formattedDescription.slice(0, 200),
        Insert_to_Pool: "Y",
        SkipIfNameExists: "N",
        CS42_Name: "Customer-Country",
        CS42_value: workItem.customerCountry,
        Due_date: workItem.dateZendesk,
        Created_date: workItem.dateOrcanos,
        CS8_Name: "Date fault was discovered",
        CS8_value: workItem.dateDiscovered,
        CS13_Name: "Zendesk Ticket ID",
        CS13_value: workItem.ticketID,
        CS14_Name: "Zendesk Ticket URL",
        CS14_value: workItem.ticketURL,
        CS3_Name: "Customer Name",
        CS3_value: workItem.customerName,
        CS41_Name: "Customer E-mail",
        CS41_value: workItem.customerEmail,
        CS4_Name: "Registration Date",
        CS4_value: workItem.registrationDate,
        CS6_Name: "Watch S/N",
        CS6_value: workItem.watch_s_n,
        CS32_Name: "Phone App version",
        CS32_value: workItem.phoneAppVersion,
        CS18_Name: "OS Version",
        CS18_value: workItem.OSVersion,
        CS5_Name: "Watch Software version",
        CS5_value: workItem.watchSoftwareVersion,
        CS34_Name: "Phone Manufacturer",
        CS34_value: workItem.phoneManufacturer,
        CS24_Name: "Phone Model",
        CS24_value: workItem.phoneModel,
        Category: workItem.category,
        CS25_Name: "Complaint Category",
        CS25_value: workItem.complaintCategory,
        CS35_Name: "Is RMA",
        CS35_value: workItem.isRMA ? 1 : 0, // checkbox
        CS36_Name: "RMA Reason",
        CS36_value: workItem.rmaReason
    };

    try {
        let response = await axios.post(`https://app.orcanos.com/${process.env.ORCANOS_DOMAIN}/api/v2/json/QW_Add_Object`, data, {
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

async function createWorkItemsFromTickets() {
    const tickets = await getZendeskTickets();
    const workItems = [];
    for (const ticket of tickets) {
        const workItem = new WorkItem();
        await workItem.createFromTicket(ticket);
        workItems.push(workItem);
    }
    return workItems;
}


class WorkItem {
    // Overview Items
    constructor() {
        this.summary = '';
        this.priority = '';
        this.category = '';
        this.customerEmail = '';
        this.customerCountry = '';
        this.status = '';
        this.assignedTo = '';
        this.dateZendesk = '';
        this.dateOrcanos = '';
        this.dateDiscovered = '';
        // Input from Zendesk
        this.ticketID = '';
        this.ticketURL = '';
        this.customerName = '';
        this.registrationDate = '';
        this.watch_s_n = '';
        this.phoneAppVersion = '';
        this.OSVersion = '';
        this.watchSoftwareVersion = '';
        this.phoneManufacturer = '';
        this.phoneModel = '';
        this.complaintCategory = '';
        this.caseDescription = '';
        // RMA
        this.isRMA = false;
        this.rmaNumber = '';
        this.rmaReason = '';
        this.dateReceived = '';
        this.inspectionDetails = '';
        // Update to Zendesk
        this.details = '';
        this.dateResolved = '';
        this.ticketSolvedUpdateZD = '';
        // Extra
        this.isSafetyInvolved = false;
        this.injurySeverity = '';
        this.investigationRequired = false;
        this.jiraID = '';
        this.jiraDescription = '';
    }

    async createFromTicket(ticket) {
        let ticketFields = await getTicketFields();
        let userInfo = await getUserInfo(ticket.requester_id);
        this.summary = ticket.subject;
        this.priority = ticket.priority;
        this.category = getTicketFieldValues(ticket, ticketFields['Category']);
        this.customerCountry = userInfo.country;
        this.status = "New";
        this.dateZendesk = ticket.created_at;
        this.dateOrcanos = new Date();
        this.dateDiscovered = ticket.created_at;
        this.ticketID = ticket.id;
        this.ticketURL = ticket.url.split(".json")[0];
        this.customerName = userInfo.name;
        this.customerEmail = userInfo.email;
        this.registrationDate = userInfo.registration_date;
        this.watch_s_n = getTicketFieldValues(ticket, ticketFields['Client data: Watch S/N']);
        this.phoneAppVersion = getTicketFieldValues(ticket, ticketFields['Client data: Phone app. version']);
        this.OSVersion = getTicketFieldValues(ticket, ticketFields['Client data: OS Version']);
        this.watchSoftwareVersion = getTicketFieldValues(ticket, ticketFields['Client data: Watch firmware version']);
        this.phoneManufacturer = getTicketFieldValues(ticket, ticketFields['Client data: Phone Manufacturer']);
        this.phoneModel = getTicketFieldValues(ticket, ticketFields['Client data: Phone Model']);
        this.complaintCategory = getTicketFieldValues(ticket, ticketFields['Complaint Category']);
        if (this.complaintCategory === "complain_category_minor_injury" || this.complaintCategory === "complain_category_major_injury") {
            this.isSafetyInvolved = true;
            this.injurySeverity = this.complaintCategory === "complain_category_minor_injury" ? "Minor" : "Major";
        }
        this.caseDescription = ticket.description ?? '';
        if (ticket.ticket_form_id === process.env.RMA_FORM_ID) {
            this.isRMA = true;
            let reason = getTicketFieldValues(ticket, ticketFields['RMA Reason']).split("rma_reason_")[1].replace(/_/g, ' ');
            reason = reason.charAt(0).toUpperCase() + reason.slice(1);
            this.rmaReason = reason;
            this.isSafetyInvolved = getTicketFieldValues(ticket,) === "hram_yes" ? true : false;
        }
    }

    async postToOrcanos() {
        await postToOrcanos(this);
    }
}

async function main() {
    const workItems = await createWorkItemsFromTickets();
    for (const workItem of workItems) {
        console.log(workItem);
    }
}

main();
