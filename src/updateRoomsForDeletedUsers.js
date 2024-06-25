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
        sdk.Query.orderDesc("$updatedAt"),
        sdk.Query.offset(offset),
        sdk.Query.limit(LIMIT),
      ]
    );

    console.log(`Fetched ${response.documents.length} documents`);
    // console.log(`Total documents: ${response.total}`);

    for (const doc of response.documents) {
      const getUserDoc1 = await db.listDocuments(
        process.env.APP_DATABASE,
        process.env.USERS_COLLECTION,
        [sdk.Query.equal("$id", doc.users[0])]
      );

      const getUserDoc2 = await db.listDocuments(
        process.env.APP_DATABASE,
        process.env.USERS_COLLECTION,
        [sdk.Query.equal("$id", doc.users[1])]
      );

      if (getUserDoc1.total === 0 || getUserDoc2.total === 0) {
        console.log(`User ${doc.users[0]} not found`);
        // Update the room with permissions deleted
        try {
          if (doc.$permissions.length !== 0) {
            console.log(`Updating room ${doc.$id}`);
            await db.updateDocument(
              process.env.APP_DATABASE,
              process.env.ROOMS_COLLECTION,
              doc.$id,
              {},
              [] // Clear permissions
            );
            console.log(`Room ${doc.$id} updated successfully`);
          } else {
            console.log(`Room ${doc.$id} already updated`);
          }
        } catch (error) {
          console.error(`Error updating room ${doc.$id}: ${error}`);
        }
        continue;
      }
    }

    if (offset + LIMIT < 8000) {
      await listAllDocuments(offset + LIMIT);
    } else {
      console.log("Finished fetching all documents");
    }
  } catch (error) {
    console.error(`Error fetching documents: ${error}`);
  }
}

module.exports = listAllDocuments;
