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

function listAllDocuments(offset) {
  console.log(`Fetching documents with offset: ${offset}`);

  db.listDocuments(process.env.APP_DATABASE, process.env.USERS_COLLECTION, [
    sdk.Query.orderAsc("$createdAt"),
    sdk.Query.offset(offset),
    sdk.Query.limit(LIMIT),
  ])
    .then((response) => {
      console.log(`Fetched ${response.documents.length} documents`);
      console.log(`Total documents: ${response.total}`);

      response.documents.forEach((doc) => {
        const profileId = doc.$id;
        const profileName = doc.name;
        const languages = doc.languages || [];
        const languageArray = doc.languageArray || [];

        // Log each language name
        const languageNames = languages.map((lang) => lang.name);

        // Find the differences between the two arrays
        const differences = languageArray.filter(
          (x) => !languageNames.includes(x)
        );

        console.log(
          `Profile ID: ${profileId},\nProfile Name: ${profileName},\nLanguagesArray: ${JSON.stringify(
            languageArray
          )}\nLanguages: ${languageNames.join(
            ", "
          )}\nDifferences: \x1b[31m${differences.join(", ")}\x1b[0m\n`
        );
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

module.exports = listAllDocuments;
