const { Client, GatewayIntentBits } = require('discord.js');
const { startMessages } = require('./messages');
const { handleXP, getLevel } = require('./levels');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// السيرفر (مهم عشان Railway)
app.get('/', (req, res) => {
    res.send('Bot is alive 😈');
});

app.listen(PORT, '0.0.0.0', () => {
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

const TOKEN = process.env.TOKEN;

// تشغيل البوت
client.once('ready', () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);

    startMessages(client);
});

// الأوامر
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

// مهم: يمنع الكراش
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

// تسجيل الدخول
client.login(TOKEN);