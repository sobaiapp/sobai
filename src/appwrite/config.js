import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject('679926010035434b938c'); // Your project ID

const account = new Account(client);

export { client, account }; 