import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const apiKey = process.env.ELEVENLABS_API_KEY;
const agentId = process.env.AGENT_ID;

if (!apiKey) {
  console.error('Error: ELEVENLABS_API_KEY is not defined in .env');
  process.exit(1);
}

if (!agentId) {
  console.error('Error: AGENT_ID is not defined in .env');
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient({
  apiKey: apiKey,
});


// Define the route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signed-url', async (req, res) => {
  try {
    const response = await elevenlabs.conversationalAi.conversations.getSignedUrl({
      agentId: 'agent_01jw23yyy4enj9pj7pfgpgwvme',  // apna sahi agent id yahan daalo
    });

    console.log('API response:', response);

    res.json(response);
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).json({ error: 'Failed to get signed URL' });
  }
});

app.listen(PORT, () => {
  console.log(`ElevenLabs microservice running on http://localhost:${PORT}`);
});
