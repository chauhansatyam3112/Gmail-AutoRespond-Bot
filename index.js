
// require google API
const { google } = require('googleapis');

//importing the config.js 

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = require('./config');

//This code is related to setting up authentication using OAuth2(open authrntication) 
//for accessing Google services, 
//specifically for the Gmail API.

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


// the line of code initializes an empty Set called repliedUsers to keep track of users 
//who have already received a reply. 
//This  ensure that the application doesn't send multiple replies to the same user.

const repliedUsers = new Set();

async function checkEmailAndSendReplies() {
  try {

    //This code sets up a //connection to the Gmail service using the Google API client library.
    /* code creates a connection to the Gmail service by initializing a gmail
     object. This object is configured with the appropriate API version ('v1') 
     and the oAuth2Client authentication credentials. 
     //It acts as a gateway that 
     allows the code to interact with the Gmail API,
     such as sending and receiving emails, managing labels, and more.*/

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // 1.check for new emails in a given Gmail ID
    

   // //This code retrieves a list of unread email messages from the Gmail
    // service for the authenticated user.
   
    // The response from the service, containing the list of messages, 
    
    const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });

    // extracts the list of email messages from that 
    //response and assigns it to the messages variable. 

    const messages = res.data.messages;


    for (const message of messages) {
        //The code loops through each email message in the messages list. For each message,
        // it makes an API call to the Gmail service using the gmail object to retrieve 
        //the detailed information of that particular message.
      //  'me' typically refers to the currently authenticated user. 

      const email = await gmail.users.messages.get({ userId: 'me', id: message.id });

      //we are finding the data from the emails containing headers like to whom it was sent,
      // from where it came etc


      const from = email.data.payload.headers.find(header => header.name === 'From');
      const toHeader = email.data.payload.headers.find(header => header.name === 'To');
      const subject = email.data.payload.headers.find(header => header.name === 'Subject');

    //   getting the values from the headers array

      const From = from.value;
      const toEmail = toHeader.value;
      const Subject = subject.value;

      console.log('Email came from:', From);
      console.log('To Email:', toEmail);


      // checks if the users already replied then skips

      if (repliedUsers.has(From)) {
        console.log('Already replied to:', From);
        continue;
      }

       // gets the thread(detailed information) from the gmail 
       //   API from the currently authenticated user
      

      const thread = await gmail.users.threads.get({ userId: 'me', id: message.threadId });


     //   It creates a new array called replies that contains all the messages 
     //   in the thread.data.messages array starting from the
     //   second element (index 1) onwards.
      const replies = thread.data.messages.slice(1);

    //2. send replies to Emails that have no prior replies

    //   if there are no existing replies in the email thread by
    //   examining the length of the replies array. If there are no replies (replies.length === 0), 
    //   it proceeds to send a reply email using the Gmail API,
    //   providing the necessary parameters such as the sender, recipient, and email content.

      if (replies.length === 0) {
        await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: await createReplyRaw(toEmail, From, Subject),
          },
        });

    //3.The app should add a Label to the email and move the email to the label


     // This create a label name


        const labelName = 'onVacation';
        //This is an asynchronous function call to the createLabelIfNeeded function,

        // which is expected to return a promise. 

        const labelId = await createLabelIfNeeded(gmail, labelName);

 //   This line of code makes an asynchronous API call to modify a specific email
//   message by adding a label to it. 
    //   It uses the gmail.users.messages.modify method provided by the Gmail API.

        await gmail.users.messages.modify({
          userId: 'me',
          id: message.id,
          requestBody: { addLabelIds: [labelId] },
        });

    // This code logs a message to the console indicating 
    // that a reply has been sent to a specific email address (From).
    //  It also adds the email address to the repliedUsers set to keep track
    //   of the users who have been replied to.

        console.log('Sent reply to email:', From);
        repliedUsers.add(From);
      }
    }
    // if the error occoured in try block then it catches the error and
    //executes the code within it

  } catch (error) {
    console.error('Error occurred:', error);
  }
}


 // The createReplyRaw function generates the content of the
//   reply email in base64-encoded format.

async function createReplyRaw(from, to, subject) {

   

    // This line creates a string variable named emailContent that contains the
    //  email message content. It uses template literals (enclosed in backticks)
    //  to interpolate the values of from, to, and subject into the string.

  const emailContent = `From: ${from}\nTo:${to}\nSubject: ${subject}\n\nThank you for your message. I am unavailable right now, but will respond as soon as possible...`;
  const base64EncodedEmail = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return base64EncodedEmail;
}

// the createLabelIfNeeded function checks if a 
// label with the specified name already exists by retrieving the
//  list of labels for the authenticated user.
//   If an existing label with the same name is found, it returns the label ID.
//  If the label doesn't exist, the code continues execution to handle the creation of the label.

async function createLabelIfNeeded(gmail, labelName) {
  const res = await gmail.users.labels.list({ userId: 'me' });
  const labels = res.data.labels;

  const existingLabel = labels.find(label => label.name === labelName);
  if (existingLabel) {
    return existingLabel.id;
  }

  //if not then giving the new label

  const newLabel = await gmail.users.labels.create({
    userId: 'me',
    requestBody: {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show',
    },
  });
  return newLabel.data.id;
}
// the getRandomInterval function takes a minimum value and a maximum value
//  as input and returns a random integer within that range. It uses the Math.random() 
// function to generate a random decimal,.
//  scales it to the desired range, and rounds it down to the nearest integer.
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// 4.repeat  sequence of steps 1-3 in random intervals of 45 to 120 seconds

//  It sets up the OAuth2 client and schedules the checkEmailAndSendReplies function
//  to run at random intervals between 45 and 120 seconds. 

async function main() {
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  setInterval(checkEmailAndSendReplies, getRandomInterval(45, 120) * 1000);
}
// The main function sets up the OAuth2 client and schedules 
// the checkEmailAndSendReplies function to run at random intervals.

main();

