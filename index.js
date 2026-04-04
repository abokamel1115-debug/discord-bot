require("dotenv").config();

const { Client, GatewayIntentBits } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const express = require('express');
const { connectDB } = require('./database');
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// 🔥 DB
connectDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;

client.once('ready', () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);
    startMessages(client);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    await handleXP(message);

    // 🟢 ping
    if (message.content === "!ping") {
        return message.reply("🏓 Pong!");
    }

    // 🟢 level
    if (message.content === "!level") {
        return await getLevel(message);
    }

    // 🤖 AI
    if (message.content.startsWith("/ai ")) {
        const prompt = message.content.slice(4).trim();

        if (!prompt) {
            return message.reply("❌ اكتب سؤال بعد /ai");
        }

        try {
            await message.channel.sendTyping();

            const API_KEY = process.env.GEMINI_API_KEY;

            if (!API_KEY) {
                return message.reply("❌ حط GEMINI_API_KEY في .env");
            }

            // ✅ Gemini Pro (الموديل الشغال)
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                }),
            });

            const data = await res.json();

            console.log("AI RESPONSE:", JSON.stringify(data, null, 2));

            // ❌ لو في Error
            if (!data.candidates) {
                return message.reply(
                    "❌ Error:\n```json\n" +
                    JSON.stringify(data, null, 2) +
                    "\n```"
                );
            }

            let reply = data.candidates[0].content.parts[0].text;

            if (!reply) {
                return message.reply("❌ مفيش رد من AI");
            }

            if (reply.length > 2000) {
                reply = reply.slice(0, 2000);
            }

            message.reply(reply);

        } catch (err) {
            console.error("❌ ERROR:", err);

            message.reply(
                "❌ Error:\n```" + err.message + "```"
            );
        }
    }
});

process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', err => console.error(err));

client.login(TOKEN);