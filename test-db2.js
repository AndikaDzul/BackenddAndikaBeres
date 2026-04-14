const { MongoClient } = require('mongodb');

const uri = "mongodb://dbuser:dika@ac-zqhwkfc-shard-00-00.uk9eamy.mongodb.net:27017,ac-zqhwkfc-shard-00-01.uk9eamy.mongodb.net:27017,ac-zqhwkfc-shard-00-02.uk9eamy.mongodb.net:27017/AbsensiSiswaaa?ssl=true&replicaSet=atlas-zqhwkfc-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Connection error details:", err);
  } finally {
    await client.close();
  }
}

run();
