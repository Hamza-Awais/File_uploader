const mongoose = require("mongoose");

let bucket; 

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    bucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: "uploads",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

function getBucket() {
  return bucket;
}

module.exports = { connectDB, getBucket };