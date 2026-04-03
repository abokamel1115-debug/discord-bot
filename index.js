const { Client, GatewayIntentBits } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const connectDB = require('./database');
const express = require('express');

// 🤖 AI
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyA492DS0INQxKdXk8RKaVQIutM-201UdIs");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is alive 😈');
});

app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;

// 🔥 تشغيل البوت
client.once('ready', async () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);

    await connectDB(); // مهم جداً
    startMessages(client);
});

// 📩 الرسائل
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    await handleXP(message);

    // 🤖 AI
    if (message.content.startsWith("/ai ")) {
        const question = message.content.replace("/ai ", "");

        if (!question) {
            return message.reply("❌ اكتب السؤال بعد /ai");
        }

        try {
            await message.reply("🤖 بفكر...");

            const result = await model.generateContent("رد بالعربي: " + question);
            const response = result.response.text();

            message.reply(response.slice(0, 2000));
        } catch (err) {
            console.error(err);
            message.reply("❌ AI حصل فيه مشكلة");
        }
    }

    if (message.content === "!ping") {
        message.reply("🏓 Pong from hell!");
    }

    if (message.content === "!level") {
        getLevel(message);
    }
});

// 🛡️ حماية
process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', err => console.error(err));

client.login(TOKEN);