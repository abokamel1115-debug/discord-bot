const fs = require('fs');

const DATA_FILE = 'levels.json';

let users = {};

// تحميل البيانات
function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "{}");
    }

    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        users = JSON.parse(data || '{}');
    } catch (err) {
        console.error("Load Error:", err.message);
        users = {};
    }
}

// حفظ البيانات
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error("Save Error:", err.message);
    }
}

loadData();

// نظام XP
function handleXP(message) {
    const userId = message.author.id;

    if (!users[userId]) {
        users[userId] = { xp: 0, level: 1 };
    }

    users[userId].xp += 10;

    const neededXP = users[userId].level * 100;

    if (users[userId].xp >= neededXP) {
        users[userId].level++;
        users[userId].xp = 0;

        message.channel.send(`🔥 ${message.author} وصل Level ${users[userId].level} 😈`);
    }

    saveData();
}

// عرض المستوى
function getLevel(message) {
    const userId = message.author.id;

    if (!users[userId]) {
        return message.reply("😈 أنت لسه Level 0... ابدأ اكتب!");
    }

    message.reply(
        `🔥 Level: ${users[userId].level}\n💀 XP: ${users[userId].xp}`
    );
}

module.exports = { handleXP, getLevel };