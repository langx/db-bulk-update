// index.js
const processUsers = require("./src/users.js");
const processMessages = require("./src/messages.js");
const processUserLanguages = require("./src/userLanguages.js");
const processUserBadges = require("./src/userBadges.js");
const processCheckoutTotalAmount = require("./src/checkoutTotalAmount.js");

async function processAll() {
  // processUsers(0);
  // processMessages(0);
  // processUserLanguages(0);
  // processUserBadges(0);
  processCheckoutTotalAmount(0);
}

processAll();
