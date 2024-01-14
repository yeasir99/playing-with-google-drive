import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { google } from 'googleapis';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
