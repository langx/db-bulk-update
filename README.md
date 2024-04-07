# DB Bulk Update

This repository contains scripts to update user and messages collections in bulk.

## Overview

The scripts in this repository are used to update the user and messages collections in our database. They fetch all documents from the collections, process them, and update the documents if necessary.

## Usage

1. Clone the repository.
2. Install the dependencies with `npm install`.
3. Set up your environment variables. You'll need to provide your API endpoint, project ID, API key, and the IDs of the user and messages collections.
4. Run the scripts with `npm run start`.

## Scripts

- `users.js`: This script fetches all documents from the user collection and performs necessary updates.
- `messages.js`: This script fetches all documents from the messages collection and performs necessary updates.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request if you have something to add or improve.
