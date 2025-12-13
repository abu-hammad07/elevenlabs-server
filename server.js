// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load environment variables
// dotenv.config();

// const app = express();
// app.use(cors());

// // Define the port and check for environment variables
// const PORT = process.env.PORT || 3000;
// const apiKey = process.env.ELEVENLABS_API_KEY;
// const agentId = process.env.AGENT_ID;

// if (!apiKey) {
//   console.error('Error: ELEVENLABS_API_KEY is not defined in .env');
//   process.exit(1);
// }

// if (!agentId) {
//   console.error('Error: AGENT_ID is not defined in .env');
//   process.exit(1);
// }

// const elevenlabs = new ElevenLabsClient({
//   apiKey: apiKey,
// });

// // Serve static files (like index.html) from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Define the route for the signed URL request
// app.get('/signed-url', async (req, res) => {
//   try {
//     const response = await elevenlabs.conversationalAi.conversations.getSignedUrl({
//       agentId: agentId,  // Use the dynamic agentId from the environment
//     });

//     console.log('API response:', response);

//     res.json(response);
//   } catch (error) {
//     console.error('Error getting signed URL:', error);
//     res.status(500).json({ error: 'Failed to get signed URL' });
//   }
// });

// // Define the root route for serving the index.html file
// app.get('/', (req, res) => {
//   const indexPath = path.join(__dirname, 'public', 'index.html');
//   console.log('Serving index.html from:', indexPath); // Log path for debugging
//   res.sendFile(indexPath);
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`ElevenLabs microservice running on http://localhost:${PORT}`);
// });















// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import fetch from "node-fetch";
// import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
// import { fileURLToPath } from "url";
// import path from "path";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const eleven = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY,
// });

// const BOT_API = "https://api.botifire.com/api/bot/chat";
// const HASH = process.env.BOT_HASH;

// // =====================================================
// // 1) USER MESSAGE → BOT API → TTS → RETURN
// // =====================================================
// app.post("/process-message", async (req, res) => {
//   console.log("📥 Received message:", req.body.text);

//   try {
//     const userMessage = req.body.text;

//     // Send to Botifire API
//     const apiResponse = await fetch(BOT_API, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         hash: HASH,
//         message: userMessage,
//       }),
//     });

//     if (!apiResponse.ok) {
//       throw new Error(`Bot API returned ${apiResponse.status}`);
//     }

//     const bot = await apiResponse.json();
//     const aiReply = bot.reply;

//     console.log("🤖 Bot replied:", aiReply);

//     // Convert to speech using ElevenLabs
//     const audio = await eleven.textToSpeech.convert({
//       text: aiReply,
//       voice_id: process.env.VOICE_ID || "1qEiC6qsybMkmnNdVMbK", // Default voice
//       model_id: "eleven_turbo_v2_5",
//       output_format: "mp3_44100_128",
//     });

//     console.log("🔊 Audio generated, length:", audio.audio_base64?.length);

//     // Return to frontend
//     res.json({
//       reply: aiReply,
//       audio_base64: audio.audio_base64,
//     });

//   } catch (err) {
//     console.error("❌ Process message error:", err);
//     res.status(500).json({ 
//       error: "Processing failed",
//       details: err.message 
//     });
//   }
// });

// // =====================================================
// // 2) SIGNED URL (Realtime Agent)
// // =====================================================
// app.get("/signed-url", async (req, res) => {
//   console.log("🔑 Requesting signed URL...");

//   try {
//     const url = await eleven.conversationalAi.conversations.getSignedUrl({
//       agentId: process.env.AGENT_ID,
//     });

//     console.log("✅ Signed URL generated");
//     res.json(url);

//   } catch (err) {
//     console.error("❌ Signed URL error:", err);
//     res.status(500).json({ 
//       error: "Failed to get signed URL",
//       details: err.message 
//     });
//   }
// });

// // =====================================================
// // 3) Health Check
// // =====================================================
// app.get("/health", (req, res) => {
//   res.json({
//     status: "healthy",
//     timestamp: new Date().toISOString(),
//     services: {
//       elevenlabs: !!process.env.ELEVENLABS_API_KEY,
//       botifire: !!process.env.BOT_HASH,
//       agent: !!process.env.AGENT_ID,
//     }
//   });
// });

// // =====================================================
// // 4) Serve Frontend
// // =====================================================
// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // =====================================================
// // 5) START SERVER
// // =====================================================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`🔑 Health check: http://localhost:${PORT}/health`);
//   console.log(`🎤 Signed URL endpoint: http://localhost:${PORT}/signed-url`);
//   console.log(`🤖 Process message: http://localhost:${PORT}/process-message`);
// });







import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { fileURLToPath } from "url";
import path from "path";
import { laravelDecrypt, laravelEncrypt } from "./crypto.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const BOT_API = "https://api.botifire.com/api/bot/chat";
const HASH = process.env.BOT_HASH;

// =====================================================
// 1) USER MESSAGE → BOT API → TTS → RETURN
// =====================================================
app.post("/process-message", async (req, res) => {
  console.log("📥 Received message:", req.body.text);

  try {
    const userMessage = req.body.text;

    // Send to Botifire API
    const apiResponse = await fetch(BOT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hash: HASH,
        message: userMessage,
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`Bot API returned ${apiResponse.status}`);
    }

    const bot = await apiResponse.json();
    const aiReply = bot.reply;

    console.log("🤖 Bot replied (length):", aiReply.length);

    // Generate TTS
    const voiceId = process.env.VOICE_ID || "pNInz6obpgDQGcFmaJgB";
    console.log("🔊 Generating TTS with voice:", voiceId);
    
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: aiReply,
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    });

    // Convert stream to base64
    const reader = audio.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }
    
    const audioBase64 = Buffer.from(combinedArray).toString('base64');
    
    console.log("✅ Audio generated, base64 length:", audioBase64.length);

    // Return to frontend
    res.json({
      reply: aiReply,
      audio_base64: audioBase64,
    });

  } catch (err) {
    console.error("❌ Process message error:", err.message);
    res.status(500).json({ 
      error: "Processing failed",
      details: err.message,
    });
  }
});

// =====================================================
// 2) SIGNED URL (Realtime Agent)
// =====================================================
// app.get("/signed-url", async (req, res) => {
//   console.log("🔑 Requesting signed URL...");

//   try {
//     const AGENT_ID = process.env.AGENT_ID;
    
//     if (!AGENT_ID) {
//       throw new Error("AGENT_ID is not set in environment variables");
//     }

//     const url = await elevenlabs.conversationalAi.conversations.getSignedUrl({
//       agentId: AGENT_ID,
//     });

//     console.log("✅ Signed URL generated");
//     res.json(url);

//   } catch (err) {
//     console.error("❌ Signed URL error:", err.message);
//     res.status(500).json({ 
//       error: "Failed to get signed URL",
//       details: err.message,
//     });
//   }
// });
app.get("/signed-url", async (req, res) => {
  console.log("🔑 Requesting signed URL...");

  try {
    const AGENT_ID = process.env.AGENT_ID;
    
    if (!AGENT_ID) {
      throw new Error("AGENT_ID is not set in environment variables");
    }

    const url = await elevenlabs.conversationalAi.conversations.getSignedUrl({
      agentId: AGENT_ID,
    });

    // Extract the `agent_id` and `conversation_signature` from the response URL
    const parsedUrl = new URL(url.signedUrl);
    const agentIdFromUrl = parsedUrl.searchParams.get("agent_id");
    const conversationSignatureFromUrl = parsedUrl.searchParams.get("conversation_signature");

    // Build the new WebSocket URL using the format you want
    const newWsUrl = `wss://wss.botifire.com/conversation?agent_id=${agentIdFromUrl}&conversation_signature=${conversationSignatureFromUrl}`;

    console.log("✅ New WebSocket URL generated");

    // Send the new WebSocket URL as response
    res.json({ signedUrl: newWsUrl });

  } catch (err) {
    console.error("❌ Signed URL error:", err.message);
    res.status(500).json({ 
      error: "Failed to get signed URL",
      details: err.message,
    });
  }
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



// =====================================================
// 3) TEST TTS ENDPOINT
// =====================================================
app.get("/test-tts", async (req, res) => {
  try {
    console.log("🧪 Testing TTS with SDK...");
    
    // Test with a simple sentence
    const testText = "Hello! This is a test of the ElevenLabs text to speech system.";
    const voiceId = "1qEiC6qsybMkmnNdVMbK"; // Default test voice
    
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: testText,
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128",
    });

    // Convert stream to base64
    const reader = audio.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedArray = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      combinedArray.set(chunk, offset);
      offset += chunk.length;
    }
    
    const audioBase64 = Buffer.from(combinedArray).toString('base64');
    
    console.log("✅ TTS test successful!");
    
    // Send HTML page with audio player
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TTS Test</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          audio { margin: 20px 0; }
          .success { color: green; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>TTS Test Successful! ✅</h1>
        <p><span class="success">Text:</span> ${testText}</p>
        <p><span class="success">Voice ID:</span> ${voiceId}</p>
        <p><span class="success">Audio Size:</span> ${audioBase64.length} bytes (base64)</p>
        
        <audio controls autoplay>
          <source src="data:audio/mp3;base64,${audioBase64}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        
        <p><a href="/">Back to main page</a></p>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("❌ TTS test failed:", err.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TTS Test Failed</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: red; }
        </style>
      </head>
      <body>
        <h1>TTS Test Failed! ❌</h1>
        <p><strong>Error:</strong> ${err.message}</p>
        <p><strong>Stack:</strong><br><pre>${err.stack}</pre></p>
        <p><a href="/">Back to main page</a></p>
      </body>
      </html>
    `);
  }
});

// =====================================================
// 4) FRONTEND LOG ENDPOINT
// =====================================================
app.post("/frontend-log", (req, res) => {
  console.log("📱 Frontend Log:", req.body.event, req.body.data);
  res.json({ success: true, received: new Date().toISOString() });
});

// =====================================================
// 5) Health Check
// =====================================================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      process_message: "POST /process-message",
      signed_url: "GET /signed-url",
      frontend_log: "POST /frontend-log",
      health: "GET /health"
    },
    environment: {
      elevenlabs_api_key: process.env.ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing",
      agent_id: process.env.AGENT_ID ? "✓ Set" : "✗ Missing",
      bot_hash: process.env.BOT_HASH ? "✓ Set" : "✗ Missing",
      port: process.env.PORT || 5000
    }
  });
});

// =====================================================
// 6) Serve Frontend
// =====================================================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================================================
// 7) START SERVER
// =====================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /process-message    - Process user message`);
  console.log(`   GET  /signed-url         - Get signed URL for real-time`);
  console.log(`   POST /frontend-log       - Receive frontend logs`);
  console.log(`   GET  /test-tts           - Test TTS functionality`);
  console.log(`   GET  /health             - Health check and config status`);
  console.log(`\n🔧 Test TTS first: http://localhost:${PORT}/test-tts`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});



// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import fetch from "node-fetch";
// import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
// import { fileURLToPath } from "url";
// import path from "path";
// import { Readable } from "stream";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const elevenlabs = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY,
// });

// const BOT_API = "https://api.botifire.com/api/bot/chat";
// const HASH = process.env.BOT_HASH;

// // =====================================================
// // 1) USER MESSAGE → BOT API → TTS → RETURN (CORRECTED)
// // =====================================================
// app.post("/process-message", async (req, res) => {
//   console.log("📥 Received message:", req.body.text);

//   try {
//     const userMessage = req.body.text;

//     // Send to Botifire API
//     const apiResponse = await fetch(BOT_API, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         hash: HASH,
//         message: userMessage,
//       }),
//     });

//     if (!apiResponse.ok) {
//       throw new Error(`Bot API returned ${apiResponse.status}`);
//     }

//     const bot = await apiResponse.json();
//     const aiReply = bot.reply;

//     console.log("🤖 Bot replied (length):", aiReply.length);

//     // CORRECTED: Convert to speech using correct SDK syntax
//     const voiceId = process.env.VOICE_ID || "1qEiC6qsybMkmnNdVMbK"; // Default voice
//     console.log("🔊 Generating TTS with voice:", voiceId);
    
//     const audio = await elevenlabs.textToSpeech.convert(voiceId, {
//       text: aiReply,
//       model_id: "eleven_turbo_v2_5",
//       output_format: "mp3_44100_128",
//       voice_settings: {
//         stability: 0.5,
//         similarity_boost: 0.75,
//       }
//     });

//     // Convert stream to base64
//     const reader = audio.getReader();
//     const chunks = [];
    
//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       chunks.push(value);
//     }
    
//     // Combine all chunks into a single Uint8Array
//     const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
//     const combinedArray = new Uint8Array(totalLength);
//     let offset = 0;
    
//     for (const chunk of chunks) {
//       combinedArray.set(chunk, offset);
//       offset += chunk.length;
//     }
    
//     // Convert to base64
//     const audioBase64 = Buffer.from(combinedArray).toString('base64');
    
//     console.log("✅ Audio generated, base64 length:", audioBase64.length);

//     // Return to frontend
//     res.json({
//       reply: aiReply,
//       audio_base64: audioBase64,
//     });

//   } catch (err) {
//     console.error("❌ Process message error:", err.message);
//     console.error("Stack trace:", err.stack);
//     res.status(500).json({ 
//       error: "Processing failed",
//       details: err.message,
//     });
//   }
// });

// // =====================================================
// // 2) SIMPLIFIED TTS ENDPOINT (For testing)
// // =====================================================
// app.post("/tts-simple", async (req, res) => {
//   try {
//     const { text, voice_id = "1qEiC6qsybMkmnNdVMbK" } = req.body;
    
//     if (!text) {
//       return res.status(400).json({ error: "Text is required" });
//     }

//     console.log("🔊 Generating TTS for:", text.substring(0, 100) + "...");

//     // Using the correct SDK syntax
//     const audio = await elevenlabs.textToSpeech.convert(voice_id, {
//       text: text,
//       model_id: "eleven_turbo_v2_5",
//       output_format: "mp3_44100_128",
//     });

//     // Convert stream to base64
//     const reader = audio.getReader();
//     const chunks = [];
    
//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       chunks.push(value);
//     }
    
//     const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
//     const combinedArray = new Uint8Array(totalLength);
//     let offset = 0;
    
//     for (const chunk of chunks) {
//       combinedArray.set(chunk, offset);
//       offset += chunk.length;
//     }
    
//     const audioBase64 = Buffer.from(combinedArray).toString('base64');
    
//     console.log("✅ TTS generated successfully");

//     res.json({
//       audio_base64: audioBase64,
//       text_length: text.length,
//     });

//   } catch (err) {
//     console.error("❌ TTS error:", err.message);
//     res.status(500).json({ 
//       error: "TTS generation failed",
//       details: err.message,
//     });
//   }
// });

// // =====================================================
// // 3) SIGNED URL (Realtime Agent)
// // =====================================================
// app.get("/signed-url", async (req, res) => {
//   console.log("🔑 Requesting signed URL...");

//   try {
//     const AGENT_ID = process.env.AGENT_ID;
    
//     if (!AGENT_ID) {
//       throw new Error("AGENT_ID is not set in environment variables");
//     }

//     const url = await elevenlabs.conversationalAi.conversations.getSignedUrl({
//       agentId: AGENT_ID,
//     });

//     console.log("✅ Signed URL generated");
//     res.json(url);

//   } catch (err) {
//     console.error("❌ Signed URL error:", err.message);
    
//     // Fallback: Try direct API call
//     console.log("⚠️ Trying direct API call as fallback...");
//     try {
//       const response = await fetch(
//         `https://api.elevenlabs.io/v1/conversational-ai/agents/${process.env.AGENT_ID}/signed-url`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "xi-api-key": process.env.ELEVENLABS_API_KEY,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`API returned ${response.status}: ${await response.text()}`);
//       }

//       const urlData = await response.json();
//       console.log("✅ Signed URL generated via direct API");
//       res.json(urlData);
      
//     } catch (apiError) {
//       console.error("❌ Both methods failed:", apiError.message);
//       res.status(500).json({ 
//         error: "Failed to get signed URL",
//         details: err.message,
//       });
//     }
//   }
// });

// // =====================================================
// // 4) TEST TTS ENDPOINT
// // =====================================================
// app.get("/test-tts", async (req, res) => {
//   try {
//     console.log("🧪 Testing TTS with SDK...");
    
//     // Test with a simple sentence
//     const testText = "Hello! This is a test of the ElevenLabs text to speech system.";
//     const voiceId = "1qEiC6qsybMkmnNdVMbK"; // Default test voice
    
//     const audio = await elevenlabs.textToSpeech.convert(voiceId, {
//       text: testText,
//       model_id: "eleven_turbo_v2_5",
//       output_format: "mp3_44100_128",
//     });

//     // Convert stream to base64
//     const reader = audio.getReader();
//     const chunks = [];
    
//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       chunks.push(value);
//     }
    
//     const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
//     const combinedArray = new Uint8Array(totalLength);
//     let offset = 0;
    
//     for (const chunk of chunks) {
//       combinedArray.set(chunk, offset);
//       offset += chunk.length;
//     }
    
//     const audioBase64 = Buffer.from(combinedArray).toString('base64');
    
//     console.log("✅ TTS test successful!");
    
//     // Send HTML page with audio player
//     res.send(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>TTS Test</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; }
//           audio { margin: 20px 0; }
//           .success { color: green; font-weight: bold; }
//         </style>
//       </head>
//       <body>
//         <h1>TTS Test Successful! ✅</h1>
//         <p><span class="success">Text:</span> ${testText}</p>
//         <p><span class="success">Voice ID:</span> ${voiceId}</p>
//         <p><span class="success">Audio Size:</span> ${audioBase64.length} bytes (base64)</p>
        
//         <audio controls autoplay>
//           <source src="data:audio/mp3;base64,${audioBase64}" type="audio/mpeg">
//           Your browser does not support the audio element.
//         </audio>
        
//         <p><a href="/">Back to main page</a></p>
//       </body>
//       </html>
//     `);

//   } catch (err) {
//     console.error("❌ TTS test failed:", err.message);
//     res.status(500).send(`
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>TTS Test Failed</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 20px; color: red; }
//         </style>
//       </head>
//       <body>
//         <h1>TTS Test Failed! ❌</h1>
//         <p><strong>Error:</strong> ${err.message}</p>
//         <p><strong>Stack:</strong><br><pre>${err.stack}</pre></p>
//         <p><a href="/">Back to main page</a></p>
//       </body>
//       </html>
//     `);
//   }
// });

// // =====================================================
// // 5) Health Check
// // =====================================================
// app.get("/health", (req, res) => {
//   res.json({
//     status: "healthy",
//     timestamp: new Date().toISOString(),
//     server: "ElevenLabs Botifire Server",
//     version: "1.0.0",
//     endpoints: {
//       process_message: "POST /process-message",
//       tts_simple: "POST /tts-simple",
//       signed_url: "GET /signed-url",
//       test_tts: "GET /test-tts",
//       health: "GET /health"
//     },
//     environment: {
//       elevenlabs_api_key: process.env.ELEVENLABS_API_KEY ? "✓ Set" : "✗ Missing",
//       agent_id: process.env.AGENT_ID ? "✓ Set" : "✗ Missing",
//       bot_hash: process.env.BOT_HASH ? "✓ Set" : "✗ Missing",
//       voice_id: process.env.VOICE_ID || "1qEiC6qsybMkmnNdVMbK (default)"
//     }
//   });
// });

// // =====================================================
// // 6) Serve Frontend
// // =====================================================
// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // =====================================================
// // 7) START SERVER
// // =====================================================
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(`📋 Available endpoints:`);
//   console.log(`   POST /process-message    - Process user message through Botifire + TTS`);
//   console.log(`   POST /tts-simple         - Simple TTS endpoint`);
//   console.log(`   GET  /signed-url         - Get signed URL for real-time conversation`);
//   console.log(`   GET  /test-tts           - Test TTS functionality`);
//   console.log(`   GET  /health             - Health check and config status`);
//   console.log(`\n🔧 Test TTS first: http://localhost:${PORT}/test-tts`);
//   console.log(`🔧 Health check: http://localhost:${PORT}/health`);
// });


























// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import fetch from "node-fetch";
// import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
// import { fileURLToPath } from "url";
// import path from "path";
// import logger from "./logger.js";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ==============================
// // Correct __dirname Setup
// // ==============================
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ==============================
// // ElevenLabs SDK INIT
// // ==============================
// const eleven = new ElevenLabsClient({
//   apiKey: process.env.ELEVENLABS_API_KEY,
// });

// // ==============================
// // Botifire API Credentials
// // ==============================
// const BOT_API = "https://api.botifire.com/api/bot/chat";
// const HASH = process.env.BOT_HASH;

// // =====================================================
// // 1) USER MESSAGE → BOT API → TTS → RETURN
// // =====================================================
// // app.post("/process-message", async (req, res) => {
// //   logger.info({
// //     event: "REQUEST_RECEIVED",
// //     endpoint: "/process-message",
// //     body: req.body,
// //   });

// //   try {
// //     const userMessage = req.body.text;

// //     // (1) Send to Botifire API
// //     logger.info({
// //       event: "CALLING_BOT_API",
// //       url: BOT_API,
// //       payload: { message: userMessage },
// //     });

// //     const apiResponse = await fetch(BOT_API, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         hash: HASH,
// //         message: userMessage,
// //       }),
// //     });

// //     const bot = await apiResponse.json();
// //     const aiReply = bot.reply;

// //     logger.info({
// //       event: "BOT_API_RESPONSE",
// //       aiReply,
// //     });

// //     // (2) ElevenLabs TTS Convert
// //     // const audio = await eleven.textToSpeech.convert({
// //     //   text: aiReply,
// //     //   voice: "Sarah",
// //     //   model_id: "eleven_turbo_v2",
// //     // });
// //     const audio = await eleven.textToSpeech.convertAsStream("Sarah", {
// //       model_id: "eleven_turbo_v2",
// //       text: aiReply,
// //     });


// //     logger.info({
// //       event: "ELEVENLABS_TTS_SUCCESS",
// //       audio_length: audio?.audio_base64?.length,
// //     });

// //     // (3) Return to frontend
// //     res.json({
// //       reply: aiReply,
// //       audio_base64: audio.audio_base64,
// //     });
// //   } catch (err) {
// //     logger.error({
// //       event: "PROCESS_MESSAGE_ERROR",
// //       message: err.message,
// //       stack: err.stack,
// //     });

// //     res.status(500).json({ error: "Processing failed" });
// //   }
// // });


// // =====================================================
// // 1) USER MESSAGE → BOT API → TTS → RETURN
// // =====================================================
// app.post("/process-message", async (req, res) => {
//   try {
//     const userMessage = req.body.text;

//     // (1) Send to Botifire API
//     const apiResponse = await fetch(BOT_API, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         hash: HASH,
//         message: userMessage,
//       }),
//     });

//     const bot = await apiResponse.json();
//     const aiReply = bot.reply;

//     // (2) ElevenLabs TTS - FIXED
//     // const audioStream = await eleven.textToSpeech.convert({
//     //   text: aiReply,
//     //   voice: "Sarah",
//     //   model_id: "eleven_turbo_v2",
//     // });

//     // const audioBuffer = Buffer.from(await audioStream.arrayBuffer());
//     // const audioBase64 = audioBuffer.toString("base64");
    
//     // (2) ElevenLabs TTS
//     const audioStream = await eleven.generate({
//       voice: "Sarah",
//       model_id: "eleven_turbo_v2",
//       text: aiReply
//     });

//     // Convert stream → Base64
//     const audioBuffer = Buffer.from(await audioStream.arrayBuffer());
//     const audioBase64 = audioBuffer.toString("base64");


//     // (3) Return audio + reply
//     res.json({
//       reply: aiReply,
//       audio_base64: audioBase64,
//     });

//   } catch (err) {
//     res.status(500).json({ error: "Processing failed", detail: err.message });
//   }
// });



// // =====================================================
// // 2) SIGNED URL (Realtime Agent)
// // =====================================================
// app.get("/signed-url", async (req, res) => {
//   logger.info({
//     event: "REQUEST_RECEIVED",
//     endpoint: "/signed-url",
//   });

//   try {
//     const url = await eleven.conversationalAi.conversations.getSignedUrl({
//       agentId: process.env.AGENT_ID,
//     });

//     logger.info({
//       event: "SIGNED_URL_SUCCESS",
//     });

//     res.json(url);
//   } catch (err) {
//     logger.error({
//       event: "SIGNED_URL_ERROR",
//       message: err.message,
//     });

//     res.status(500).json({ error: "Failed signed URL" });
//   }
// });

// // =====================================================
// // 3) FRONTEND LOG ROUTE (Optional)
// // =====================================================
// app.post("/frontend-log", (req, res) => {
//   logger.info({
//     event: "FRONTEND_LOG",
//     details: req.body,
//   });

//   res.json({ success: true });
// });

// // =====================================================
// // 4) Serve Frontend index.html
// // =====================================================
// app.get("/", (req, res) => {
//   const indexPath = path.join(__dirname, "public", "index.html");

//   logger.info({
//     event: "SERVING_INDEX_HTML",
//     path: indexPath,
//   });

//   res.sendFile(indexPath);
// });

// // =====================================================
// // 5) START SERVER
// // =====================================================
// app.listen(5000, () => {
//   logger.info("🚀 Server running on http://localhost:5000");
// });

