"use strict";

const mongoose = require("mongoose");

require("dotenv").config();

const MONGODB_URI = String(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gympro");

async function main() {
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  await db.collection("users").deleteMany({});
  await db.collection("sessions").deleteMany({});

  console.log("Users and sessions cleared successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to reset users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
