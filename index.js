const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const axios = require('axios');
const config = require('./config.json');

const { token: BOT_TOKEN, clientId: CLIENT_ID, db: dbConfig, domain, port: PORT } = config;

const db = mysql.createConnection(dbConfig);

db.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
        process.exit(1);
    }
    console.log("MySQL connected!");

    db.query(`CREATE TABLE IF NOT EXISTS url (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userid VARCHAR(255) NOT NULL,
        code VARCHAR(16) NOT NULL UNIQUE,
        invite VARCHAR(32) NOT NULL
    )`, err => {
        if (err) {
            console.error("Error creating the table:", err);
            process.exit(1);
        }
        console.log("Table 'url' is ready.");
    });
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    new SlashCommandBuilder()
        .setName('deletemydata')
        .setDescription('Deletes all stored data about your account')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('url_create')
        .setDescription('Creates a custom discord invitation URL')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Your desired shortlink code (only letters, max. 16)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('invite')
                .setDescription('Your discord invitation code ("https://discord.gg/myinvite")')
                .setRequired(true)
        )
        .toJSON(),

    new SlashCommandBuilder()
        .setName('myurls')
        .setDescription('Displays all of your saved short URLs')
        .toJSON(),

    new SlashCommandBuilder()
        .setName('url_change')
        .setDescription('Changes the invitation link of an existing short link')
        .addStringOption(option =>
            option.setName('shortlink')
                .setDescription('Choose one of your shortlinks')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName('invite')
                .setDescription('New discord invitation code (without "https://discord.gg/")')
                .setRequired(true)
        )
        .toJSON()
];

client.once('ready', async () => {
    try {
        console.log('🔄 Syncing slash commands...');
        const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Slash commands synced!');
    } catch (error) {
        console.error('❌ Error syncing commands:', error);
    }

    console.log(`✅ Bot online as ${client.user.tag}`);

    client.user.setPresence({
        activities: [{ name: "🔗 di.scord.me/krypex", type: 4 }],
        status: "online"
    });
});

client.on('interactionCreate', async interaction => {
    const userId = interaction.user.id;

    if (interaction.isAutocomplete() && interaction.commandName === 'url_change') {
        db.query('SELECT code FROM url WHERE userid = ?', [userId], (err, results) => {
            if (err) return interaction.respond([]);
            const choices = results.map(row => ({ name: `di.scord.me/${row.code}`, value: row.code }));
            interaction.respond(choices.slice(0, 25));
        });
    }

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'url_change') {
            const shortLink = interaction.options.getString('shortlink');
            const newInvite = interaction.options.getString('invite');

            db.query('SELECT * FROM url WHERE userid = ? AND code = ?', [userId, shortLink], (err, results) => {
                if (err || results.length === 0) {
                    return interaction.reply({ content: "❌ This shortlink does not exist or is not yours.", ephemeral: true });
                }
                db.query('UPDATE url SET invite = ? WHERE userid = ? AND code = ?', [newInvite, userId, shortLink], (updateErr) => {
                    if (updateErr) {
                        return interaction.reply({ content: "❌ Error updating invite.", ephemeral: true });
                    }
                    interaction.reply({ content: `✅ Updated: di.scord.me/${shortLink} → discord.gg/${newInvite}`, ephemeral: true });
                });
            });
        }

        if (interaction.commandName === 'deletemydata') {
            const embed = new EmbedBuilder()
                .setTitle("Delete Your Data")
                .setDescription("Click DELETE to permanently remove all your saved data.")
                .setColor(4147404)
                .setFooter({ text: domain, iconURL: client.user.displayAvatarURL() })
                .setThumbnail(client.user.displayAvatarURL());

            const deleteButton = new ButtonBuilder()
                .setCustomId('confirm_delete_data')
                .setLabel('DELETE')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(deleteButton);

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        if (interaction.commandName === 'url_create') {
            const code = interaction.options.getString('code');
            const inviteInput = interaction.options.getString('invite');

            if (!/^[a-zA-Z]{1,16}$/.test(code)) {
                return interaction.reply({ content: '❌ Only letters allowed, max. 16 characters.', ephemeral: true });
            }

            const inviteMatch = inviteInput.match(/^https:\/\/discord\.gg(?:\/invite)?\/(\w{2,32})$/);
            if (!inviteMatch) {
                return interaction.reply({ content: '❌ Invalid invite format. Use https://discord.gg/code', ephemeral: true });
            }
            const inviteCode = inviteMatch[1];

            try {
                const response = await axios.get(`https://discord.com/api/v10/invites/${inviteCode}`);
                const serverData = response.data;

                const serverName = serverData.guild?.name;
                const serverId = serverData.guild?.id;
                const serverIconUrl = serverData.guild?.icon
                    ? `https://cdn.discordapp.com/icons/${serverId}/${serverData.guild.icon}.png`
                    : null;

                const memberCount = serverData.approximate_member_count;
                const expiresAt = serverData.expires_at ? new Date(serverData.expires_at).toLocaleString() : "No expiration";

                const embed = new EmbedBuilder()
                    .setTitle(`\`\`\`di.scord.me/${code}\`\`\``)
                    .setDescription(`📅 Expires: \`${expiresAt}\``)
                    .setColor(4474111)
                    .addFields({ name: '📄 Server Info', value: `👥 Users: ${memberCount}\n🆔 ID: ${serverId}` })
                    .setAuthor({ name: `DisShort - ${serverName}`, iconURL: 'https://cdn.discordapp.com/avatars/1344693778803327107/c11974c2b955c7a8aeeea0504c2e5a82.png?size=1024' })
                    .setThumbnail(serverIconUrl || '');

                db.query('SELECT * FROM url WHERE code = ?', [code], (err, results) => {
                    if (results.length > 0) {
                        return interaction.reply({ content: '❌ Code already in use.', ephemeral: true });
                    }

                    db.query('INSERT INTO url (userid, code, invite) VALUES (?, ?, ?)', [userId, code, inviteCode], (insertErr) => {
                        if (insertErr) return interaction.reply({ content: '❌ Error saving link.', ephemeral: true });
                        interaction.reply({ content: '✅ Created:', embeds: [embed], ephemeral: true });
                    });
                });
            } catch (error) {
                return interaction.reply({ content: '❌ Could not fetch invite data.', ephemeral: true });
            }
        }

        if (interaction.commandName === 'myurls') {
            db.query('SELECT code, invite FROM url WHERE userid = ?', [userId], (err, results) => {
                if (err) return interaction.reply({ content: '❌ Error fetching URLs.', ephemeral: true });
                if (results.length === 0) return interaction.reply({ content: 'You have no saved URLs.', ephemeral: true });

                const urlList = results.map(row => `│ **di.scord.me/[${row.code}](https://${domain}/${row.code})** → **discord.gg/[${row.invite}](https://discord.gg/${row.invite})**`).join('\n');

                const embed = new EmbedBuilder()
                    .setColor(4147404)
                    .addFields({ name: 'Your URLs', value: urlList })
                    .setFooter({ text: domain, iconURL: client.user.displayAvatarURL() })
                    .setThumbnail(client.user.displayAvatarURL());

                interaction.reply({ embeds: [embed], ephemeral: true });
            });
        }
    }

    if (interaction.isButton() && interaction.customId === 'confirm_delete_data') {
        db.query('DELETE FROM url WHERE userid = ?', [userId], async (err) => {
            if (err) return interaction.reply({ content: '❌ Could not delete your data.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle("✅ Data Deleted")
                .setDescription("Your data has been removed from our database.")
                .setColor(4147404)
                .setFooter({ text: domain, iconURL: client.user.displayAvatarURL() })
                .setThumbnail(client.user.displayAvatarURL());

            await interaction.update({ embeds: [embed], components: [] });
        });
    }
});

const app = express();

app.get('/:code', (req, res) => {
    const code = req.params.code;
    db.query('SELECT invite FROM url WHERE code = ?', [code], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Code not found');
        }
        res.redirect(`https://discord.gg/${results[0].invite}`);
    });
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

client.login(BOT_TOKEN).catch(console.error);
