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
        const oldMotherLanguages = doc.motherLanguages || [];
        const oldStudyLanguages = doc.studyLanguages || [];

        // Initialize motherLanguages and studyLanguages arrays
        const motherLanguages = [];
        const studyLanguages = [];

        // Check each language
        languages.forEach((lang) => {
          if (lang.motherLanguage) {
            motherLanguages.push(lang.name);
          } else {
            studyLanguages.push(lang.name);
          }
        });

        // Log each language name
        const languageNames = languages.map((lang) => lang.name);

        // Function to find differences between two arrays
        function findDifferences(oldArray, newArray) {
          const differencesOld = oldArray.filter((x) => !newArray.includes(x));
          const differencesNew = newArray.filter((x) => !oldArray.includes(x));
          return differencesOld.concat(differencesNew);
        }

        // Find the differences between the two arrays
        const differencesLanguageArray = findDifferences(
          languageArray,
          languageNames
        );
        const differencesMotherLanguages = findDifferences(
          oldMotherLanguages,
          motherLanguages
        );
        const differencesStudyLanguages = findDifferences(
          oldStudyLanguages,
          studyLanguages
        );

        // if (profileId === "65a60b69e64d736fd0bc") {
        //   console.log(
        //     `Profile ID: ${profileId},\nProfile Name: ${profileName},\nLanguagesArray: ${JSON.stringify(
        //       languageArray
        //     )}\nLanguages: ${languageNames.join(
        //       ", "
        //     )}\nDifferences in Language Array: \x1b[31m${differencesLanguageArray.join(
        //       ", "
        //     )}\x1b[0m\nDifferences in Mother Languages: \x1b[31m${differencesMotherLanguages.join(
        //       ", "
        //     )}\x1b[0m\nDifferences in Study Languages: \x1b[31m${differencesStudyLanguages.join(
        //       ", "
        //     )}\x1b[0m\n`
        //   );

        //   console.log(`Old Mother Languages: ${oldMotherLanguages.join(", ")}`);
        //   console.log(`New Mother Languages: ${motherLanguages.join(", ")}`);
        //   console.log(`Old Study Languages: ${oldStudyLanguages.join(", ")}`);
        //   console.log(`New Study Languages: ${studyLanguages.join(", ")}`);
        // }

        // Only log and update when there are differences
        if (
          differencesLanguageArray.length > 0 ||
          differencesMotherLanguages.length > 0 ||
          differencesStudyLanguages.length > 0
        ) {
          console.log(
            `Profile ID: ${profileId},\nProfile Name: ${profileName},\nLanguagesArray: ${JSON.stringify(
              languageArray
            )}\nLanguages: ${languageNames.join(
              ", "
            )}\nDifferences in Language Array: \x1b[31m${differencesLanguageArray.join(
              ", "
            )}\x1b[0m\nDifferences in Mother Languages: \x1b[31m${differencesMotherLanguages.join(
              ", "
            )}\x1b[0m\nDifferences in Study Languages: \x1b[31m${differencesStudyLanguages.join(
              ", "
            )}\x1b[0m\n`
          );

          console.log(
            `Mother Languages: ${motherLanguages.join(
              ", "
            )},\nStudy Languages: ${studyLanguages.join(", ")}\n`
          );

          updateDocument(profileId, {
            languageArray: languageNames,
            motherLanguages: motherLanguages,
            studyLanguages: studyLanguages,
          });
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

module.exports = listAllDocuments;
