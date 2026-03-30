const { Client, GatewayIntentBits } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 سيرفر Railway
app.get('/', (req, res) => {
    res.send('Bot is alive 😈');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// 🔥 MongoDB
const uri = process.env.MONGO_URI;
let db;

async function connectDB() {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db("discordBot");
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
    }
}

function getDB() {
    return db;
}

module.exports = { getDB };

// 🚀 تشغيل الاتصال
connectDB();

// 🤖 إعداد البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;

// تشغيل البوت
client.once('ready', () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);
    startMessages(client);
});

// الأوامر
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    await handleXP(message);

    if (message.content === "!ping") {
        message.reply("🏓 Pong from hell!");
    }

    if (message.content === "!level") {
        await getLevel(message);
    }
});

// منع الكراش
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

client.login(TOKEN);