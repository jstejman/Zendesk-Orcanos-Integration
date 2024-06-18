// const { createWorkItemsFromTickets } = require('./controllers/zendeskController');
const { getTicket } = require('./services/zendeskService');
const WorkItem = require('./models/WorkItem');

async function main() {
  //const workItems = await createWorkItemsFromTickets();
  //for (const workItem of workItems) {
  //  await workItem.postToOrcanos();
  //}
  const testTicket = await getTicket(606);
  testWorkItem = new WorkItem();
  await testWorkItem.createFromTicket(testTicket);
  console.log(testWorkItem);
}

main();
