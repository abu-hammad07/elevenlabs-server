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
    // 1️⃣ agentId query se lo, warna env se
    const agentId =
      req.query.agentId || process.env.AGENT_ID;

    if (!agentId) {
      return res.status(400).json({
        error: "agentId is required (query param or env)",
      });
    }

    // 2️⃣ ElevenLabs se signed URL lo
    const response =
      await elevenlabs.conversationalAi.conversations.getSignedUrl({
        agentId,
      });

    if (!response?.signedUrl) {
      throw new Error("Signed URL not received from ElevenLabs");
    }

    // 3️⃣ URL parse karo
    const parsedUrl = new URL(response.signedUrl);

    const agentIdFromUrl =
      parsedUrl.searchParams.get("agent_id");
    const conversationSignature =
      parsedUrl.searchParams.get("conversation_signature");

    if (!agentIdFromUrl || !conversationSignature) {
      throw new Error("Missing required query params in signed URL");
    }

    // 4️⃣ Final WebSocket URL build karo
    const newWsUrl = `wss://wss.botifire.com/conversation?agent_id=${agentIdFromUrl}&conversation_signature=${conversationSignature}`;

    console.log("✅ WebSocket URL generated");

    // 5️⃣ Response
    res.json({
      signedUrl: newWsUrl,
    });

  } catch (err) {
    console.error("❌ Signed URL error:", err);

    res.status(500).json({
      error: "Failed to get signed URL",
      message: err.message,
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