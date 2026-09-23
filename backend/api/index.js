// Vercel entry point for serverless functions
require("dotenv").config();
const app = require("../src/app");

module.exports = app;
