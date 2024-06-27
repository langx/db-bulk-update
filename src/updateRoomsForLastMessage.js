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
    return updatedRoom;
  } catch (error) {
    console.error(`Error updating document ${docId}: ${error}`);
    return null;
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
        sdk.Query.isNull("lastMessageUpdatedAt"),
      ]
    );

    console.log(`Fetched ${response.documents.length} documents`);
    console.log(`Total documents: ${response.total}`);

    for (const doc of response.documents) {
      if (
        doc.lastMessageUpdatedAt === null ||
        doc.lastMessageUpdatedAt === undefined
      ) {
        console.log(
          `Room ${doc.$id} , ${doc.lastMessageUpdatedAt} does not have lastMessageUpdatedAt`
        );
        const getLastMessage = await db.listDocuments(
          process.env.APP_DATABASE,
          process.env.MESSAGES_COLLECTION,
          [
            sdk.Query.equal("roomId", doc.$id),
            sdk.Query.limit(1),
            sdk.Query.orderDesc("$updatedAt"),
          ]
        );
        if (getLastMessage.total > 0) {
          const updatedRoom = await updateDocument(doc.$id, {
            lastMessageUpdatedAt: getLastMessage.documents[0].$updatedAt,
            typing: [new Date(2000, 0, 1), new Date(2000, 0, 1)],
          });
          console.log(updatedRoom.lastMessageUpdatedAt);
        } else {
          const updatedRoom = await updateDocument(doc.$id, {
            lastMessageUpdatedAt: doc.$createdAt,
            typing: [new Date(2000, 0, 1), new Date(2000, 0, 1)],
          });
          console.log(updatedRoom.lastMessageUpdatedAt);
        }
        continue;
      } else {
        console.log(
          `Room ${doc.lastMessageUpdatedAt} already has lastMessageUpdatedAt`
        );
      }
    }
    // if (getLastMessage.total > 0) {
    //   await updateDocument(doc.$id, {
    //     lastMessageUpdatedAt: getLastMessage.documents[0].$updatedAt,
    //     typing: [new Date(2000, 0, 1), new Date(2000, 0, 1)],
    //   });
    //   console.log(
    //     `Last message for room ${doc.$id}: ${getLastMessage.documents[0].$id}, updated last message at ${getLastMessage.documents[0].$updatedAt}`
    //   );
    // } else {
    //   await updateDocument(doc.$id, {
    //     lastMessageUpdatedAt: doc.$updatedAt,
    //     typing: [new Date(2000, 0, 1), new Date(2000, 0, 1)],
    //   });
    //   console.log(
    //     `No messages for room ${doc.$id} and updated last message at ${doc.$updatedAt}`
    //   );
    // }
    // }

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
