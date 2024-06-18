const { getZendeskTickets, getTicket, getTicketFields, getUserInfo } = require('../services/zendeskService');
const WorkItem = require('../models/WorkItem');

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

module.exports = {
  createWorkItemsFromTickets,
};
