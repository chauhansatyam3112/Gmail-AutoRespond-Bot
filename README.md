# Gmail-AutoRespond-Bot
This repository contains a Gmail Autoresponder application that utilizes the Gmail API to automatically respond to incoming emails. 
The application is built with Node.js and provides a convenient way to manage and reply to unread emails in a timely manner.




This project implements an autoresponder for Gmail using the Gmail API and OAuth2 authentication. It automatically checks for new unread emails, sends replies to those emails if no prior replies exist, and adds a label to the emails that have been replied to. The application runs at random intervals between 45 and 120 seconds.

### Setup

Before running the application, make sure to perform the following steps:

1. Install the required dependencies by running `npm install`.
2. Obtain the necessary credentials and tokens from the Google Cloud Platform console.
3. Create a `config.js` file and populate it with the following information:
   ```javascript
   module.exports = {
     CLIENT_ID: 'your_client_id',
     CLIENT_SECRET: 'your_client_secret',
     REDIRECT_URI: 'your_redirect_uri',
     REFRESH_TOKEN: 'your_refresh_token'
   };
   ```
   Replace `'your_client_id'`, `'your_client_secret'`, `'your_redirect_uri'`, and `'your_refresh_token'` with the appropriate values from your Google Cloud Platform project.

### Usage

To run the autoresponder, execute the following command:

```bash
node index.js
```

### How It Works

1. The application sets up authentication by creating an OAuth2 client and configuring its credentials using the provided client ID, client secret, redirect URI, and refresh token.
2. It initializes an empty set called `repliedUsers` to keep track of users who have already received a reply to avoid sending duplicate replies.
3. The `checkEmailAndSendReplies` function is responsible for checking for new unread emails, processing them, and sending replies if necessary.
4. Using the Gmail API, the application retrieves the list of unread emails for the authenticated user.
5. For each email, it extracts the sender, recipient, and subject from the email headers and stores them in variables.
6. If the sender has already received a reply, it skips to the next email.
7. It fetches the detailed information of the email thread to determine if there are existing replies.
8. If no prior replies exist, it sends a reply email using the Gmail API, adds a label to the email, and logs the sent reply.
9. The `createReplyRaw` function generates the content of the reply email in base64-encoded format.
10. The `createLabelIfNeeded` function checks if a label with the specified name already exists for the user and returns its ID. If the label doesn't exist, it creates a new label and returns its ID.
11. The `getRandomInterval` function generates a random interval in seconds between the provided minimum and maximum values.
12. The `main` function sets up the OAuth2 client and schedules the `checkEmailAndSendReplies` function to run at random intervals.
13. The application runs indefinitely, periodically checking for new emails and sending replies when applicable.

### Conclusion

This autoresponder for Gmail provides an automated way to respond to unread emails, avoiding duplicate replies, and organizing labeled emails. By utilizing the Gmail API and OAuth2 authentication, it simplifies the process of managing and responding to incoming emails.
