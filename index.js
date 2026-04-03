require("dotenv").config(); // 👈 مهم

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

    // 🟢 ping
    if (message.content === "!ping") {
        return message.reply("🏓 Pong from Home!");
    }

    // 🟢 level
    if (message.content === "!level") {
        return await getLevel(message);
    }

    // 🤖 AI COMMAND
    if (message.content.startsWith("/ai ")) {
        const prompt = message.content.slice(4).trim();

        if (!prompt) {
            return message.reply("❌ اكتب سؤال بعد /ai");
        }

        try {
            await message.channel.sendTyping();

            const API_KEY = process.env.GEMINI_API_KEY;

            if (!API_KEY) {
                return message.reply("❌ مفيش API KEY متحط في .env");
            }

            // 🧪 اختبار API
            const testRes = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: "test" }],
                            },
                        ],
                    }),
                }
            );

            const testData = await testRes.json();

            if (!testData.candidates) {
                console.log("❌ API ERROR:", testData);

                return message.reply(
                    "❌ الـ AI مش شغال:\n```json\n" +
                    JSON.stringify(testData, null, 2) +
                    "\n```"
                );
            }

            // ✅ الطلب الحقيقي
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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

            console.log("AI RESPONSE:", JSON.stringify(data, null, 2));

            const reply =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "❌ حصل خطأ في الرد";

            if (reply.length > 2000) {
                return message.reply(reply.slice(0, 2000));
            }

            message.reply(reply);

        } catch (err) {
            console.error("❌ ERROR:", err);
            message.reply("❌ في مشكلة حصلت أثناء الاتصال بالـ AI");
        }
    }
});

process.on('unhandledRejection', err => console.error(err));
process.on('uncaughtException', err => console.error(err));

client.login(TOKEN);