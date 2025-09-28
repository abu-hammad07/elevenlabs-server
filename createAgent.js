import dotenv from "dotenv";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import axios from 'axios';

dotenv.config();

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Manually create request with axios to inspect the request details
axios.get('https://api.elevenlabs.io/v1/agents', {
  headers: {
    'Authorization': `Bearer ${process.env.ELEVENLABS_API_KEY}`,
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Axios error:', error));

async function createAuthenticatedAgent() {
  try {
    const agent = await elevenlabs.conversationalAi.agents.create({
      conversationConfig: {
        agent: {
          firstMessage: "Hi. I'm an authenticated agent.",
        },
      },
      platformSettings: {
        auth: {
          enableAuth: true,
          allowlist: [
            { hostname: "example.com" },
            { hostname: "node.botifire.com" },
            { hostname: "localhost:5000" },
          ],
        },
      },
    });

    console.log("✅ Agent created:", agent);
  } catch (error) {
    // console.error("❌ Error creating agent:", error);
  }
}

createAuthenticatedAgent();


// ✅ Agent created: { agentId: 'agent_7401k67ma404faqbmq0gwdqj284r' }