// flushRedis.js
import redisClient from "./redisClient.js";

export const flushRedis = async () => {
  try {
    await redisClient.flushAll(); // flushDb() only flushes current DB
    console.log("✅ Redis cache flushed successfully!");
  } catch (error) {
    console.error("❌ Failed to flush Redis cache:", error);
  }
};
