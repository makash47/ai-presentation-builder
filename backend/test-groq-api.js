#!/usr/bin/env node

/**
 * Groq API Diagnostic Test
 * Run this to identify exactly what's wrong with the Groq integration
 */

require("dotenv").config();
const axios = require("axios");

// Test configuration
const apiKey = process.env.GROQ_API_KEY;
const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

console.log("\n========== GROQ API DIAGNOSTIC TEST ==========\n");

// Step 1: Validate configuration
console.log("1. Configuration Check:");
console.log(`   ✓ API Key present: ${apiKey ? "YES" : "NO"}`);
console.log(`   ✓ API Key length: ${apiKey?.length || 0} characters`);
console.log(`   ✓ Base URL: ${baseUrl}`);
console.log(`   ✓ Model: ${model}`);
console.log(`   ✓ Full endpoint: ${baseUrl}/chat/completions`);

if (!apiKey) {
  console.error("\n❌ ERROR: GROQ_API_KEY is not set in .env file!");
  process.exit(1);
}

if (!apiKey.startsWith("gsk_")) {
  console.error("\n⚠️  WARNING: API key doesn't start with 'gsk_' - might be invalid!");
}

// Step 2: Test direct API call
console.log("\n2. Testing Direct Groq API Call...\n");

const testRequest = async () => {
  try {
    console.log("   Sending request to: POST /chat/completions");
    console.log("   Model:", model);
    console.log("   Headers: Authorization: Bearer [redacted]");
    console.log("   Payload: { role: user, content: 'Say hello' }");

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: model,
        messages: [{ role: "user", content: "Say hello in one word" }],
        max_tokens: 50,
        temperature: 0.7
      },
      {
        timeout: 30000,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("\n✅ SUCCESS! Groq API is working correctly!");
    console.log("\n   Response:");
    console.log(`   - Model: ${response.data.model}`);
    console.log(`   - Content: ${response.data.choices[0].message.content}`);
    console.log(`   - Tokens used: ${response.data.usage.total_tokens}`);
    return true;
  } catch (error) {
    console.log("\n❌ ERROR! Groq API call failed!");
    console.log(`\n   Status: ${error.response?.status || "No response"}`);
    console.log(`   Status Text: ${error.response?.statusText || "N/A"}`);

    if (error.response?.data) {
      console.log(`\n   Error Response:`);
      console.log(`   ${JSON.stringify(error.response.data, null, 2)}`);
    }

    if (error.code) {
      console.log(`\n   Error Code: ${error.code}`);
    }

    if (error.message) {
      console.log(`\n   Error Message: ${error.message}`);
    }

    // Specific error diagnosis
    console.log("\n   Diagnosis:");
    if (error.response?.status === 401) {
      console.log("   - 401 Unauthorized: API key is invalid or expired");
      console.log("   - Action: Generate a new API key from https://console.groq.com/keys");
    } else if (error.response?.status === 404) {
      console.log("   - 404 Not Found: Check model name or endpoint");
      console.log("   - Action: Verify model exists at https://console.groq.com/docs/models");
    } else if (error.response?.status === 429) {
      console.log("   - 429 Too Many Requests: Rate limit exceeded");
      console.log("   - Action: Wait and retry later");
    } else if (error.response?.status === 500) {
      console.log("   - 500 Server Error: Groq API server issue");
      console.log("   - Action: Check https://status.groq.com");
    } else if (error.code === "ECONNREFUSED") {
      console.log("   - Connection Refused: Cannot reach Groq API servers");
      console.log("   - Action: Check your internet connection and firewall");
    } else if (error.code === "ETIMEDOUT") {
      console.log("   - Timeout: Request took too long");
      console.log("   - Action: Check your internet speed and try again");
    }

    return false;
  }
};

// Step 3: Test using axios client (like in groqService.js)
const testWithClient = async () => {
  console.log("\n3. Testing with Axios Client (like groqService.js)...\n");

  try {
    let baseURL = baseUrl;
    if (baseURL.includes("/chat/completions")) {
      baseURL = baseURL.replace("/chat/completions", "");
    }

    console.log(`   Base URL: ${baseURL}`);
    console.log(`   Endpoint: /chat/completions`);

    const client = axios.create({
      baseURL: baseURL,
      timeout: 60000,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const response = await client.post("/chat/completions", {
      model: model,
      messages: [{ role: "user", content: "Test message" }],
      temperature: 0.7,
      max_tokens: 50
    });

    console.log("\n✅ SUCCESS with Axios Client!");
    console.log(`   Response: ${response.data.choices[0].message.content}`);
    return true;
  } catch (error) {
    console.log("\n❌ Axios Client Test Failed!");
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Details: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
};

// Run tests
(async () => {
  const test1 = await testRequest();
  const test2 = await testWithClient();

  console.log("\n========== TEST SUMMARY ==========");
  console.log(`Direct API Call: ${test1 ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Axios Client: ${test2 ? "✅ PASSED" : "❌ FAILED"}`);

  if (test1 && test2) {
    console.log("\n🎉 All tests passed! Your Groq API is configured correctly.");
    console.log("   If text generation still fails in your app, check the controller logic.");
  } else {
    console.log("\n⚠️  Fix the errors above and try again.");
  }

  console.log("\n==========================================\n");
  process.exit(test1 && test2 ? 0 : 1);
})();
