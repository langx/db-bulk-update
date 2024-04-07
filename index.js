// index.js
const processUsers = require("./src/users.js");
const processMessages = require("./src/messages.js");

async function processAll() {
  processUsers(0);
  processMessages(0);
}

processAll();
