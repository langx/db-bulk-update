// index.js
const processUsers = require("./src/users.js");
const processMessages = require("./src/messages.js");
const processUserLanguages = require("./src/userLanguages.js");

async function processAll() {
  // processUsers(0);
  // processMessages(0);
  processUserLanguages(0);
}

processAll();
