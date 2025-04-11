// redisClient.js
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-11827.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 11827,
  },
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("connect", () => {
  console.log("Connecting to Redis...");
});

client.on("ready", () => {
  console.log("Redis connection established!");
});

await client.connect();

// Optional: Test set/get (can be removed in production)
try {
  await client.set("foo", "bar");
  const result = await client.get("foo");
  console.log("🎯 Redis Test Value:", result); // bar
} catch (err) {
  console.error("❌ Redis test failed:", err);
}

export default client;
