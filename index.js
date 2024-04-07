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

let OFFSET = 0;
const LIMIT = 25;

function updateDocument(docId, data) {
  db.updateDocument(
    process.env.APP_DATABASE,
    process.env.USERS_COLLECTION,
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

  db.listDocuments(process.env.APP_DATABASE, process.env.USERS_COLLECTION, [
    sdk.Query.orderAsc("$id"),
    sdk.Query.offset(offset),
    sdk.Query.limit(LIMIT),
  ])
    .then((response) => {
      console.log(`Fetched ${response.documents.length} documents`);
      console.log(`Total documents: ${response.total}`);
      response.documents.forEach((doc) => {
        const profileId = doc.$id;
        const profilePhotoId = doc.profilePhoto
          .split("/files/")[1]
          .split("/view")[0];
        const profilePic = doc.profilePic;

        console.log(
          `Profile ID: ${profileId}, Profile photo ID: ${profilePhotoId}, Profile Pic: ${profilePic}`
        );

        // Update the document only if profilePic is not the same as profilePhotoId
        if (profilePic !== profilePhotoId) {
          updateDocument(profileId, { profilePic: profilePhotoId });
        } else {
          console.log(
            `Profile Pic for document ${profileId} is already up to date.`
          );
        }
      });

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

listAllDocuments(OFFSET);
