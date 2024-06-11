const Discord = require('discord.js');
const { PublicKey } = require('@solana/web3.js');
const axios = require('axios')
const express = require("express")

require('dotenv').config()

const config = {
    token: process.env.TOKEN,
    api_url: process.env.API_URL,
    auth_token: process.env.BACKEND_AUTH_TOKEN
}

const requestAirdrop = async (address) => {
    return await axios.post(config.api_url, {
        lamports: 2 * 10 ** 9,
        to_wallet_address: address
    }, {
        headers: {
            'auth_token': config.auth_token
        }
    }).catch(() => null)
}

const client = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds, 
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
]});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('messageCreate', async message => {
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Split the message into parts
    const parts = message.content.split(' ');

    // Check if the message starts with "send" and has a second part
    if (parts.length === 2 && parts[0].toLowerCase() === 'faucet') {
        const address = parts[1]; // Extract the address from the message

        // Check if the provided address is a valid Solana address
        try {
            new PublicKey(address); // This will throw an error if the address is invalid

            try {
                requestAirdrop(address)
            } catch {}

            await message.reply(`Address ${address} will receive 2 BTC!`);
        } catch (error) {
            await message.reply(`The address ${address} is not a valid Yona address.`);
            await message.delete();
        }
    } else {
        // If the message does not follow the format, inform and delete it
        try {
            await message.reply('Your message was deleted because it did not follow the required "faucet {address}" format.');
            await message.delete();
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
});

client.login(config.token);

const app = express()

app.use((_, res) => {
    res.sendStatus(200)
})

app.listen(80)