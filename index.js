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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
