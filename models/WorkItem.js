const { getTicketFields, getUserInfo, getTicketFieldValues } = require('../services/zendeskService');
const { postToOrcanos } = require('../services/orcanosService');
const config = require('../config/config');

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
    if (ticket.ticket_form_id === config.zendesk.rmaFormID) {
      this.isRMA = true;
      let reason = getTicketFieldValues(ticket, ticketFields['RMA Reason']).split("rma_reason_")[1].replace(/_/g, ' ');
      reason = reason.charAt(0).toUpperCase() + reason.slice(1);
      this.rmaReason = reason;
      this.isSafetyInvolved = getTicketFieldValues(ticket, ) === "hram_yes" ? true : false;
    }
  }

  async postToOrcanos() {
    await postToOrcanos(this);
  }
}

module.exports = WorkItem;
