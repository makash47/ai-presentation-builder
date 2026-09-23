const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

// Cache the connection across invocations. In serverless (Vercel), the same
// function instance is reused for many requests, so we must not open a new
// connection every time — we reuse the cached one and only connect when needed.
let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

const connectDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.mongoUri, {
        serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
        connectTimeoutMS: env.mongoConnectTimeoutMs
      })
      .then((mongooseInstance) => {
        logger.info("MongoDB connected.");
        return mongooseInstance;
      })
      .catch((error) => {
        // Reset so a later request can retry the connection.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDatabase;
