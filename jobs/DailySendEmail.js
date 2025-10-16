const cron = require("node-cron");
const DataServices = require("../services/dataServices.js");

cron.schedule("0 5 * * *", async () => {
  console.log("[DailySendEmail] Running daily email report delivery...");
  try {
    await DataServices.sendYesterdayReport();
    console.log("[DailySendEmail] Report delivered");
  } catch (error) {
    console.error("[DailySendEmail] Failed sending report", error);
  }
});
