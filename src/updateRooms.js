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

async function updateDocument(docId, data) {
  try {
    const updatedRoom = await db.updateDocument(
      process.env.APP_DATABASE,
      process.env.ROOMS_COLLECTION,
      docId,
      data
    );
    console.log(`Document ${docId} updated successfully: ${updatedRoom}`);
  } catch (error) {
    console.error(`Error updating document ${docId}: ${error}`);
  }
}

async function listAllDocuments(offset) {
  console.log(`Fetching documents with offset: ${offset}`);

  try {
    const response = await db.listDocuments(
      process.env.APP_DATABASE,
      process.env.ROOMS_COLLECTION,
      [
        sdk.Query.orderAsc("$updatedAt"),
        sdk.Query.offset(offset),
        sdk.Query.limit(LIMIT),
      ]
    );

    console.log(`Fetched ${response.documents.length} documents`);
    console.log(`Total documents: ${response.total}`);

    for (const doc of response.documents) {
      const listMessages = await db.listDocuments(
        process.env.APP_DATABASE,
        process.env.MESSAGES_COLLECTION,
        [sdk.Query.equal("roomId", doc.$id), sdk.Query.orderDesc("$createdAt")]
      );

      // Define unseen
      let unseen = [0, 0];

      listMessages.documents.forEach((message) => {
        if (!message.seen) {
          if (message.to > message.sender) {
            unseen[0] += 1;
          } else {
            unseen[1] += 1;
          }
        }
      });

      console.log(`before: ${doc.unseen}, after: ${unseen}`);
      if (unseen.toString() !== doc.unseen.toString()) {
        console.log("Updating unseen");
        console.log(doc.$id);
        await updateDocument(doc.$id, { unseen: unseen });
      }
    }

    if (offset + LIMIT < response.total) {
      await listAllDocuments(offset + LIMIT);
    } else {
      console.log("Finished fetching all documents");
    }
  } catch (error) {
    console.error(`Error fetching documents: ${error}`);
  }
}

module.exports = listAllDocuments;
