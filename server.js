import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import express from 'express';
import cors from 'cors';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import path from 'path';
import { fileURLToPath } from 'url';
import { laravelEncrypt, laravelDecrypt } from "./crypto.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());


// Define the port and check for environment variables
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

// Serve static files (like index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define the route for the signed URL request
app.get('/signed-url', async (req, res) => {
  try {
    const response = await elevenlabs.conversationalAi.conversations.getSignedUrl({
      agentId: agentId,  // Use the dynamic agentId from the environment
    });

    console.log('API response:', response);

    res.json(response);
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).json({ error: 'Failed to get signed URL' });
  }
});

// Define the root route for serving the index.html file
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log('Serving index.html from:', indexPath); // Log path for debugging
  res.sendFile(indexPath);
});



// 👉 Encrypt & Decrypt API
app.post("/crypto", (req, res) => {
  const { action, value } = req.body;
  if (!action || !value) {
    return res.status(400).json({
      error: "Missing 'action' or 'value'",
      example: {
        encrypt: { action: "encrypt", value: "12345" },
        decrypt: { action: "decrypt", value: "HASH_HERE" }
      }
    });
  }
  if (action === "encrypt") {
    return res.json({
      action: "encrypt",
      encrypted: laravelEncrypt(value)
    });
  }
  if (action === "decrypt") {
    return res.json({
      action: "decrypt",
      decrypted: laravelDecrypt(value)
    });
  }
  return res.status(400).json({
    error: "Invalid action. Use 'encrypt' or 'decrypt'"
  });
});



// Start the server
app.listen(PORT, () => {
  console.log(`ElevenLabs microservice running on http://localhost:${PORT}`);
});
