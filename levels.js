const { getDB } = require('./database');
const { EmbedBuilder } = require("discord.js");

// 🔥 نظام XP
async function handleXP(message) {
    const db = getDB();
    if (!db) return;

    const users = db.collection("users");
    const userId = message.author.id;

    let user = await users.findOne({ userId });

    if (!user) {
        user = { userId, xp: 0, level: 1 };
        await users.insertOne(user);
    }

    user.xp += 3;

    const neededXP = user.level * 100;

    if (user.xp >= neededXP) {
        user.level++;
        user.xp = 0;

        message.channel.send(`🔥 ${message.author} وصل Level ${user.level} 😈`);
    }

    await users.updateOne(
        { userId },
        { $set: { xp: user.xp, level: user.level } }
    );
}

// 🧠 دالة تعمل XP Bar
function createXPBar(xp, neededXP) {
    const percentage = xp / neededXP;
    const totalBars = 10;
    const filledBars = Math.round(percentage * totalBars);
    const emptyBars = totalBars - filledBars;

    const bar = "█".repeat(filledBars) + "░".repeat(emptyBars);
    const percentText = Math.round(percentage * 100);

    return `${bar} ${percentText}%`;
}

// 📊 عرض الليفل (Embed)
async function getLevel(message) {
    const db = getDB();
    if (!db) return;

    const users = db.collection("users");
    const userId = message.author.id;

    const user = await users.findOne({ userId });

    if (!user) {
        return message.reply("😈 أنت لسه Level 0... ابدأ اكتب!");
    }

    const level = user.level;
    const xp = user.xp;
    const neededXP = level * 100;

    const name = message.member?.displayName || message.author.username;

    // 🔥 XP Bar
    const xpBar = createXPBar(xp, neededXP);

    const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setAuthor({
            name: `📊 إحصائيات ${name}`,
            iconURL: message.author.displayAvatarURL()
        })
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .addFields(
            {
                name: "⭐ المستوى",
                value: `\`${level}\``,
                inline: true
            },
            {
                name: "✨ النقاط",
                value: `\`${xp} / ${neededXP}\`\n${xpBar}`,
                inline: false
            }
        )
        .setFooter({ text: "Devil Bot 😈" });

    message.reply({ embeds: [embed] });
}

module.exports = { handleXP, getLevel };