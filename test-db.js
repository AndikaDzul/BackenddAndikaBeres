const mongoose = require('mongoose');

const uri = "mongodb://dbuser:dika@ac-zqhwkfc-shard-00-00.uk9eamy.mongodb.net:27017,ac-zqhwkfc-shard-00-01.uk9eamy.mongodb.net:27017,ac-zqhwkfc-shard-00-02.uk9eamy.mongodb.net:27017/AbsensiSiswaaa?ssl=true&replicaSet=atlas-zqhwkfc-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
