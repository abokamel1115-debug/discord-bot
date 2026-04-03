const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://botuser:Bot123456@cluster0.xm1xwpx.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

let db;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("discord");
        console.log("✅ MongoDB Connected");
    }
    return db;
}

module.exports = connectDB;