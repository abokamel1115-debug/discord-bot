require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const { getDB, connectDB } = require('./database');

// 🔥 ticket system
const { handleTicketInteraction, sendPanel } = require("./ticket");

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running'));

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
const OWNER_ID = "1215378499393552526";

client.once('ready', async () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);
    startMessages(client);

    // 🔥 تشغيل التيكت
    handleTicketInteraction(client, OWNER_ID);

    // 🔥 إرسال البانل تلقائي
    await sendPanel(client);
});

client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot) return;

        const db = getDB();
        if (!db) return;

        const users = db.collection("users");

        await handleXP(message);

        const args = message.content.split(" ");
        const command = args[0];
        const mentionedUser = message.mentions.users.first();

        // 👤 USER
        if (command === "!level") {
            return await getLevel(message);
        }

        if (command === "!best") {
            const topUsers = await users.find().sort({ level: -1, xp: -1 }).limit(5).toArray();

            let desc = "";
            for (let i = 0; i < topUsers.length; i++) {
                const medal = ["🥇", "🥈", "🥉"][i] || "🔹";
                const u = topUsers[i];
                desc += `${medal} #${i + 1} - <@${u.userId}> (Level ${u.level})\n`;
            }

            return message.reply({
                embeds: [new EmbedBuilder().setTitle("🏆 Best 5 Players").setDescription(desc)]
            });
        }

        // 💀 OWNER ONLY
        const ownerOnly = [
            "!ping",
            "!addxp",
            "!rexp",
            "!addlevel",
            "!relevel",
            "!alllevels",
            "!clear",
            "!مستوي"
        ];

        if (ownerOnly.includes(command) && message.author.id !== OWNER_ID) {
            return message.reply("❌ للأونر فقط");
        }

        if (command === "!ping") return message.reply("🏓 Pong!");

        if (command === "!clear") {
            const amount = parseInt(args[1]);
            if (isNaN(amount)) return;

            await message.channel.bulkDelete(amount, true);
            return message.channel.send(`Deleted ${amount}`);
        }

    } catch (err) {
        console.error(err);
    }
});

client.login(TOKEN);