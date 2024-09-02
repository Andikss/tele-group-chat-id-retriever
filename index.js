import { Telegraf } from 'telegraf';
import fs from 'fs';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const bot = new Telegraf('7386838514:AAEgntofkXgqc_giLAqj60q81Mswu5rolvg');

// CSV Writer configuration
const csvWriter = createCsvWriter({
    path: 'groups.csv',
    header: [
        { id: 'username', title: 'USERNAME' },
        { id: 'chatId', title: 'CHAT_ID' }
    ],
    append: true
});

// Function to save group data to CSV
const saveGroupData = async (groupData) => {
    let records = [];
    if (fs.existsSync('groups.csv')) {
        records = fs.readFileSync('groups.csv', 'utf-8')
            .split('\n')
            .slice(1)
            .filter(line => line)
            .map(line => {
                const [username, chatId] = line.split(',');
                return { username, chatId };
            });
    }

    const isDuplicate = records.some(record => record.chatId === groupData.chatId);

    if (!isDuplicate) {
        await csvWriter.writeRecords([groupData]);
        console.log(`Group ${groupData.username} with ID ${groupData.chatId} has been saved.`);
    }
};

// Command to trigger saving the group username and chat ID
bot.command('get-id', async (ctx) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        const chatId = ctx.chat.id;
        const username = ctx.chat.username || `Group ${chatId}`;

        await saveGroupData({ username, chatId });

        ctx.reply(`Group ${username} with ID ${chatId} has been saved.`);
    } else {
        ctx.reply("This command can only be used in a group.");
    }
});

// You can add a catch-all handler to trigger the bot if it's already in a group.
bot.on('message', async (ctx) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        const chatId = ctx.chat.id;
        const username = ctx.chat.username || `Group ${chatId}`;

        await saveGroupData({ username, chatId });
    }
});

bot.launch();
console.log('Bot is running...');
