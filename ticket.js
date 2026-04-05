const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder
} = require("discord.js");

const { getDB } = require("./database");

const tickets = new Map();

// 🔢 عداد التيكت
async function getNextTicketNumber(db) {
    const settings = db.collection("settings");

    const data = await settings.findOneAndUpdate(
        { name: "ticketCounter" },
        { $inc: { value: 1 } },
        { upsert: true, returnDocument: "after" }
    );

    return data.value.value;
}

// 🎫 إرسال البانل
async function sendPanel(client) {
    const channel = await client.channels.fetch("1490473080915628192").catch(() => null);
    if (!channel) return;

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("create_ticket")
            .setLabel("📩 Create Ticket")
            .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
        .setTitle("الدعم 🎫")
        .setDescription("لإنشاء تيكت اضغط هنا للتحدث مع الدعم 📩");

    await channel.send({
        embeds: [embed],
        components: [row]
    });
}

// 🎮 التعامل مع الأزرار
function handleTicketInteraction(client, OWNER_ID) {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const guild = interaction.guild;
        const user = interaction.user;

        // ================= CREATE =================
        if (interaction.customId === "create_ticket") {

            const today = new Date().toDateString();

            if (!tickets.has(user.id)) {
                tickets.set(user.id, { count: 0, date: today });
            }

            const userData = tickets.get(user.id);

            if (userData.date !== today) {
                userData.count = 0;
                userData.date = today;
            }

            if (userData.count >= 2) {
                return interaction.reply({
                    content: "❌ الحد الأقصى 2 تيكت في اليوم",
                    ephemeral: true
                });
            }

            userData.count++;

            const db = getDB();
            const ticketNumber = await getNextTicketNumber(db);

            const channel = await guild.channels.create({
                name: `ticket-${ticketNumber}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    },
                    {
                        id: OWNER_ID,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    }
                ]
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("❌ Close")
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({
                content: `🎫 ${user} تم فتح التذكرة`,
                components: [row]
            });

            // 📩 DM
            try {
                await user.send(`🎫 تم إنشاء التذكرة:

📌 ${channel.name}
🔗 https://discord.com/channels/${guild.id}/${channel.id}`);
            } catch {}

            return interaction.reply({
                content: `✅ تم إنشاء التذكرة: ${channel}`,
                ephemeral: true
            });
        }

        // ================= CLOSE =================
        if (interaction.customId === "close_ticket") {

            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({
                    content: "❌ للأونر فقط",
                    ephemeral: true
                });
            }

            await interaction.channel.send("🔒 جاري إغلاق التذكرة...");

            setTimeout(() => {
                interaction.channel.delete();
            }, 2000);
        }
    });
}

module.exports = {
    handleTicketInteraction,
    sendPanel
};