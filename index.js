// index.js
// const processUsers = require("./src/users.js");
// const processMessages = require("./src/messages.js");
// const processUserLanguages = require("./src/userLanguages.js");
// const processUserBadges = require("./src/userBadges.js");
// const processCheckoutTotalAmount = require("./src/checkoutTotalAmount.js");
// const processSetUsername = require("./src/setUsername.js");
// const processUpdateRooms = require("./src/updateRooms.js");
// const processUpdateRoomsForDeletedUsers = require("./src/updateRoomsForDeletedUsers.js");
// const processUpdateRoomsForLastMessage = require("./src/updateRoomsForLastMessage.js");
const processBucketsPermissionsForAudio = require("./src/bucketsPermissionsForAudio.js");
const processBucketsPermissionsForImage = require("./src/bucketsPermissionsForImage.js");

async function processAll() {
  // processUsers(0);
  // processMessages(0);
  // processUserLanguages(0);
  // processUserBadges(0);
  // processCheckoutTotalAmount(0);
  // processSetUsername(0);
  // processUpdateRooms(0);
  // processUpdateRoomsForDeletedUsers(0);
  // processUpdateRoomsForLastMessage(0);
  processBucketsPermissionsForAudio(0);
  processBucketsPermissionsForImage(0);
}

processAll();
