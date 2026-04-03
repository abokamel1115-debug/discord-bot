const { Client, GatewayIntentBits } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const express = require('express');
const { connectDB } = require('./database');
const fetch = require("node-fetch"); // 👈 جديد

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// 🔥 الاتصال بقاعدة البيانات
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

    // 🟢 أمر ping
    if (message.content === "!ping") {
        return message.reply("🏓 Pong from Home!");
    }

    // 🟢 أمر level
    if (message.content === "!level") {
        return await getLevel(message);
    }

    // 🤖 أمر AI
    if (message.content.startsWith("/ai ")) {
        const prompt = message.content.slice(4).trim();

        if (!prompt) {
            return message.reply("❌ اكتب سؤال بعد /ai");
        }

        try {
            await message.channel.sendTyping(); // 👈 تحسين

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                    }),
                }
            );

            const data = await res.json();

            const reply =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "❌ حصل خطأ في الرد";

            // ⚠️ Discord limit 2000 حرف
            if (reply.length > 2000) {
                return message.reply(reply.slice(0, 2000));
            }

            message.reply(reply);

        } catch (err) {
            console.error(err);
            message.reply("❌ في مشكلة حصلت أثناء الاتصال بالذكاء الاصطناعي");
        }
    }
});

process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', err => console.error(err));

client.login(TOKEN);