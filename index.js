const { Client, GatewayIntentBits } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// سيرفر بسيط علشان Railway يفضل شغال
app.get('/', (req, res) => {
    res.send('Bot is alive 😈');
});

app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
});

// إعداد البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// التوكن من Railway Variables
const TOKEN = process.env.TOKEN;

// لما البوت يشتغل
client.once('ready', () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);

    startMessages(client);
});

// استقبال الرسائل
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    handleXP(message);

    if (message.content === "!ping") {
        message.reply("🏓 Pong from hell!");
    }

    if (message.content === "!level") {
        getLevel(message);
    }
});

// تشغيل البوت
client.login(TOKEN);