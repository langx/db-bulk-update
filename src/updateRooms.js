require("dotenv").config();
const sdk = require("node-appwrite");

let client = new sdk.Client();

client
  .setEndpoint(process.env.APP_ENDPOINT) // Your API Endpoint
  .setProject(process.env.APP_PROJECT) // Your project ID
  .setKey(process.env.APP_API_KEY) // Your secret API key
  .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

console.log("Client configured");

// List all users
let db = new sdk.Databases(client);

console.log("Database instance created");

const LIMIT = 25;

function updateDocument(docId, data) {
  db.updateDocument(
    process.env.APP_DATABASE,
    process.env.ROOMS_COLLECTION,
    docId,
    data
  )
    .then((response) => {
      console.log(`Document ${docId} updated successfully`);
    })
    .catch((error) => {
      console.error(`Error updating document ${docId}: ${error}`);
    });
}

function listAllDocuments(offset) {
  console.log(`Fetching documents with offset: ${offset}`);

  db.listDocuments(process.env.APP_DATABASE, process.env.ROOMS_COLLECTION, [
    sdk.Query.orderAsc("$createdAt"),
    sdk.Query.offset(offset),
    sdk.Query.limit(LIMIT),
  ])
    .then((response) => {
      console.log(`Fetched ${response.documents.length} documents`);
      console.log(`Total documents: ${response.total}`);

      response.documents.forEach((doc) => {
        const roomId = doc.$id;
        let users = doc.users;
        if (users[0] > users[1]) {
          console.log("its ok", users);
        } else {
          console.log("its not ok", users);
          users = users.reverse();
          updateDocument(roomId, {
            users: users,
          });
          console.log("updated", users);
        }
        console.log();
      });

      if (offset + LIMIT < response.total + 1000) {
        listAllDocuments(offset + LIMIT);
      } else {
        console.log("Finished fetching all documents");
      }
    })
    .catch((error) => {
      console.error(`Error fetching documents: ${error}`);
    });
}

module.exports = listAllDocuments;
