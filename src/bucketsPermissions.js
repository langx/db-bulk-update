require("dotenv").config();
const sdk = require("node-appwrite");

let client = new sdk.Client();

client
  .setEndpoint(process.env.APP_ENDPOINT) // Your API Endpoint
  .setProject(process.env.APP_PROJECT) // Your project ID
  .setKey(process.env.APP_API_KEY) // Your secret API key
  .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

console.log("Client configured");

const db = new sdk.Databases(client);
const storage = new sdk.Storage(client);

console.log("Database instance created");

const LIMIT = 25;

function updateFile(fileId, permissions) {
  storage
    .updateFile(process.env.AUDIO_BUCKET, fileId, undefined, permissions)
    .then((response) => {
      console.log(`file ${fileId} updated successfully`);
    })
    .catch((error) => {
      console.error(`Error updating document ${fileId}: ${error}`);
    });
}

function listAllDocuments(offset) {
  console.log(`Fetching documents with offset: ${offset}`);

  db.listDocuments(process.env.APP_DATABASE, process.env.MESSAGES_COLLECTION, [
    sdk.Query.offset(offset),
    sdk.Query.limit(LIMIT),
    sdk.Query.orderDesc("$createdAt"),
    sdk.Query.isNotNull("audioId"),
  ])
    .then((response) => {
      console.log(`Fetched ${response.documents.length} documents`);
      console.log(`Total documents: ${response.total}`);

      response.documents.forEach(async (doc) => {
        const fileId = doc.audioId;

        try {
          const file = await storage.getFile(process.env.AUDIO_BUCKET, fileId);
          // console.log(file);
          const room = await db.getDocument(
            process.env.APP_DATABASE,
            process.env.ROOMS_COLLECTION,
            doc.roomId.$id
          );
          // console.log(room);

          const permissions = [
            sdk.Permission.read(sdk.Role.user(room.users[0])),
            sdk.Permission.read(sdk.Role.user(room.users[1])),
          ];

          console.log(
            `File ${fileId} permissions: ${file.$permissions} - ${file.$permissions.length}`
          );

          if (file.$permissions.length > 2) {
            console.log(`File ${fileId} doesnt updated`);
            updateFile(fileId, permissions);
          }
        } catch (error) {
          console.error(`Error fetching file ${fileId}: ${error}`);
        }

        // updateDocument(profileId, {
        //   badges: badges,
        // });
      });

      if (offset + LIMIT < response.total) {
        listAllDocuments(offset + LIMIT);
      } else {
        console.log("Finished fetching all files");
      }
    })
    .catch((error) => {
      console.error(`Error fetching files: ${error}`);
    });
}

module.exports = listAllDocuments;
