const { getDB } = require('./index');

// نظام XP
async function handleXP(message) {
    if (message.author.bot) return;

    const db = getDB();
    if (!db) return;

    const users = db.collection("levels");

    const userId = message.author.id;
    const guildId = message.guild.id;

    let user = await users.findOne({ userId, guildId });

    // لو المستخدم مش موجود
    if (!user) {
        user = {
            userId,
            guildId,
            xp: 0,
            level: 1
        };
        await users.insertOne(user);
    }

    // 🎯 كل رسالة = 3 XP
    user.xp += 3;

    const neededXP = user.level * 100;

    if (user.xp >= neededXP) {
        user.level++;
        user.xp = 0;

        message.channel.send(`🔥 ${message.author} وصل Level ${user.level} 😈`);
    }

    await users.updateOne(
        { userId, guildId },
        { $set: user }
    );
}

// عرض المستوى
async function getLevel(message) {
    const db = getDB();
    if (!db) return;

    const users = db.collection("levels");

    const userId = message.author.id;
    const guildId = message.guild.id;

    const user = await users.findOne({ userId, guildId });

    if (!user) {
        return message.reply("😈 أنت لسه Level 0... ابدأ اكتب!");
    }

    message.reply(
        `🔥 Level: ${user.level}\n💀 XP: ${user.xp}`
    );
}

module.exports = { handleXP, getLevel };