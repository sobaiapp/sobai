import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('679926010035434b938c');

const account = new Account(client);

export { client, account }; 