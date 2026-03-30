const fs = require('fs');

const DATA_FILE = 'levels.json';

let users = {};

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            users = JSON.parse(data || '{}');
        } catch {
            users = {};
        }
    }
}

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

loadData();

function handleXP(message) {
    const userId = message.author.id;

    if (!users[userId]) {
        users[userId]