#!/usr/bin/env node

/**
 * QUICK FIX: Groq API 404 Error Solver
 * Run this to identify and help fix the issue immediately
 */

require("dotenv").config({ path: ".env" });
const fs = require("fs");
const path = require("path");

console.log("\n🔍 GROQ API 404 ERROR QUICK FIX\n");
console.log("=".repeat(50));

const issues = [];
const warnings = [];
const fixes = [];

// Check 1: API Key exists
console.log("\n✓ Check 1: API Key Configuration");
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  issues.push("❌ GROQ_API_KEY is not set!");
  fixes.push("1. Visit https://console.groq.com/keys");
  fixes.push("2. Create a new secret");
  fixes.push("3. Add to .env: GROQ_API_KEY=your_key_here");
} else {
  console.log(`   • API Key present: YES (${apiKey.length} chars)`);
  if (!apiKey.startsWith("gsk_")) {
    warnings.push("⚠️  API Key doesn't start with 'gsk_' - might be wrong!");
  }
  if (apiKey.length < 40) {
    issues.push("❌ API Key looks too short (expected 50+ chars)");
  }
}

// Check 2: Model is set
console.log("\n✓ Check 2: Model Configuration");
const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
console.log(`   • Model: ${model}`);

// Check 3: Base URL is set
console.log("\n✓ Check 3: Base URL Configuration");
const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
console.log(`   • Base URL: ${baseUrl}`);
if (!baseUrl.includes("api.groq.com")) {
  issues.push("❌ Base URL looks wrong!");
  fixes.push(`Set GROQ_BASE_URL=https://api.groq.com/openai/v1 in .env`);
}

// Check 4: .env file exists
console.log("\n✓ Check 4: Files");
const envExists = fs.existsSync(path.join(__dirname, ".env"));
console.log(`   • .env file: ${envExists ? "EXISTS ✓" : "MISSING ❌"}`);

// Check 5: Node modules
console.log("\n✓ Check 5: Dependencies");
const axiosExists = fs.existsSync(path.join(__dirname, "node_modules/axios"));
console.log(`   • axios: ${axiosExists ? "INSTALLED ✓" : "MISSING ❌"}`);

// Summary
console.log("\n" + "=".repeat(50));

if (issues.length === 0 && warnings.length === 0) {
  console.log("\n✅ CONFIG LOOKS GOOD!");
  console.log("\nNext step: Run diagnostic test");
  console.log("  $ node test-groq-api.js");
} else {
  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    warnings.forEach(w => console.log(`  ${w}`));
  }

  if (issues.length > 0) {
    console.log("\n❌ ISSUES FOUND:");
    issues.forEach(issue => console.log(`  ${issue}`));

    console.log("\n📝 HOW TO FIX:");
    fixes.forEach(fix => console.log(`  ${fix}`));

    console.log("\n📋 COMPLETE STEPS:");
    console.log("  1. Edit backend/.env file");
    console.log("  2. Get new API key: https://console.groq.com/keys");
    console.log("  3. Update GROQ_API_KEY with the new key");
    console.log("  4. Ensure GROQ_BASE_URL=https://api.groq.com/openai/v1");
    console.log("  5. Ensure GROQ_MODEL=llama-3.3-70b-versatile");
    console.log("  6. Save and restart: npm run dev");
    console.log("  7. Test: node test-groq-api.js");
  }
}

console.log("\n" + "=".repeat(50) + "\n");
