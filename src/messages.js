require("dotenv").config();
const sdk = require("node-appwrite");

let client = new sdk.Client();

client
  .setEndpoint(process.env.APP_ENDPOINT) // Your API Endpoint
  .setProject(process.env.APP_PROJECT) // Your project ID
  .setKey(process.env.APP_API_KEY) // Your secret API key
  .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

console.log("Client configured for messages");

// List all messages
let db = new sdk.Databases(client);

console.log("Database instance created for messages");

const LIMIT = 25;

function updateDocument(docId, data) {
  db.updateDocument(
    process.env.APP_DATABASE,
    process.env.MESSAGES_COLLECTION,
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

  db.listDocuments(process.env.APP_DATABASE, process.env.MESSAGES_COLLECTION, [
    sdk.Query.orderAsc("$id"),
    sdk.Query.offset(offset),
    sdk.Query.limit(LIMIT),
    sdk.Query.notEqual("type", "body"),
  ])
    .then((response) => {
      console.log(`Fetched ${response.documents.length} documents`);
      console.log(`Total documents: ${response.total}`);

      response.documents.forEach((doc) => {
        const docId = doc.$id;
        const imageType = doc.type;
        const imageUrl = doc.image;

        if (imageType === "image") {
          const imageId = imageUrl.split("/files/")[1].split("/view")[0];

          if (doc.imageId !== imageId) {
            console.log(
              `Document with ID ${docId} has a new image ID: ${imageId}`
            );
            // Update the document with the new imageID
            updateDocument(docId, { imageId: imageId });
          } else {
            console.log(
              `Image ID for document ${docId} is already up to date.`
            );
          }
        }

        if (doc.type === "audio") {
          const audioId = doc.audio.split("/files/")[1].split("/view")[0];

          if (doc.audioId !== audioId) {
            console.log(
              `Document with ID ${doc.$id} has a new audio ID: ${audioId}`
            );
            // Update the document with the new audioID
            updateDocument(doc.$id, { audioId: audioId });
          } else {
            console.log(
              `Audio ID for document ${doc.$id} is already up to date.`
            );
          }
        }
      });

      // Add your logic for messages here

      if (offset + LIMIT < response.total) {
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
