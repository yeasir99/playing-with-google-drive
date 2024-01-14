import dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';
import express from 'express';
import fs from 'fs';

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

try {
  const creds = fs.readFileSync('creds.json');
  oauth2Client.setCredentials(JSON.parse(creds));
} catch (error) {
  console.log('No creds found');
}

app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/drive',
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  fs.writeFileSync('creds.json', JSON.stringify(tokens));
  res.send('Authenticated');
});

app.get('/save-text', async (req, res) => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const textData =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

  await drive.files.create({
    requestBody: {
      name: 'Test',
      mimeType: 'text/plain',
    },
    media: {
      mimeType: 'text/plain',
      body: textData,
    },
  });

  res.status(200).send('File saved');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// applay search console execute fn for retrive data from search console

const searchConsole = google.searchconsole('v1');

async function execute() {
  try {
    const response = await searchConsole.sites.get({
      auth,
      siteUrl: 'https://www.bayshorecommunication.com/',
    });

    console.log('Response', response.data);
  } catch (error) {
    console.error('Error executing request', error.message);
  }
}
