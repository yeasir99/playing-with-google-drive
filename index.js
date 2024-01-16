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
    'https://www.googleapis.com/auth/webmasters',
    'https://www.googleapis.com/auth/webmasters.readonly',
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

app.get('/get-data', async (req, res) => {
  const searchConsole = google.searchconsole({
    version: 'v1',
    auth: oauth2Client,
  });
  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl: 'https://thecatflix.com',
      startDate: '2023-12-12',
      endDate: '2024-01-10',
      dimensions: ['date'],
      rowLimit: 10,
      startRow: 0,
    });

    console.log('Response', response.data);
    res.status(200).send('get data');
  } catch (error) {
    console.error('Error executing request', error.message);
    res.status(400).send('failed');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
