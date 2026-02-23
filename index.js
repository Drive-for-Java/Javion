const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Javion is running!');
});

app.listen(PORT, () => {
  console.log(`Web server started on port ${PORT}`);
});

console.log("TOKEN exists:", process.env.TOKEN ? true : false);
console.log("CLIENT_ID exists:", process.env.CLIENT_ID ? true : false);

const express = require('express');
const app = express();

/* RENDER PORT FIX */
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Javion is running!');
});

app.listen(PORT, () => {
  console.log("Web server started");
});


/* DISCORD BOT */
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require("discord.js");
require("dotenv").config();
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

/* CHANNEL IDS */
const REACTION_CHANNEL = "1431294508015816837";
const SUGGESTION_CHANNEL = "1475107874144518217";
const XP_CHANNEL = "1433107389476769952";
const COUNT_CHANNEL = "1475107452709241004";

/* CREATE FILES */
if (!fs.existsSync("xp.json")) fs.writeFileSync("xp.json", "{}");

if (!fs.existsSync("count.json")) fs.writeFileSync("count.json", JSON.stringify({
  number: 0,
  lastUser: ""
}));

/* READY EVENT */
client.once("ready", () => {
  console.log(`Javion is online as ${client.user.tag}`);
});

/* MESSAGE HANDLER */
client.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  /* AUTO REACTION */
  if (msg.channel.id === REACTION_CHANNEL) {
    msg.react("👋");
  }

  /* XP SYSTEM */
  let xpData = JSON.parse(fs.readFileSync("xp.json"));
  if (!xpData[msg.author.id]) {
    xpData[msg.author.id] = { messages: 0, xp: 0, name: msg.author.username };
  }

  xpData[msg.author.id].messages++;
  if (xpData[msg.author.id].messages >= 50) {
    xpData[msg.author.id].messages = 0;
    xpData[msg.author.id].xp++;
    let ch = client.channels.cache.get(XP_CHANNEL);
    if (ch) ch.send(`⭐ ${msg.author.username} gained 1 XP`);
  }

  fs.writeFileSync("xp.json", JSON.stringify(xpData, null, 2));

  /* COUNTING SYSTEM */
  if (msg.channel.id === COUNT_CHANNEL) {
    let data = JSON.parse(fs.readFileSync("count.json"));
    let num = parseInt(msg.content);
    if (num === data.number + 1 && msg.author.id !== data.lastUser) {
      data.number++;
      data.lastUser = msg.author.id;
      msg.react("✅");
    } else {
      msg.react("❌");
    }
    fs.writeFileSync("count.json", JSON.stringify(data, null, 2));
  }
});


/* SLASH COMMANDS */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  /* INFO */
  if (interaction.commandName === "info") {
    interaction.reply("🤖 Javion\nYour server assistant");
  }

  /* SERVER */
  if (interaction.commandName === "server") {
    let g = interaction.guild;
    interaction.reply(`Server: ${g.name}\nMembers: ${g.memberCount}`);
  }

  /* JAVA */
  if (interaction.commandName === "java") {
    interaction.reply(`☕ Java — My beloved, My heart, My soul ❤️
Java is a powerful programming language.
✨ Platform Independent
⚡ Fast
🔒 Secure
🌎 Popular`);
  }

  /* SAY */
  if (interaction.commandName === "say") {
    let text = interaction.options.getString("text");
    interaction.reply(`${interaction.user.username} said:\n${text}`);
  }

  /* SUGGESTION */
  if (interaction.commandName === "suggestion") {
    let text = interaction.options.getString("text");
    let ch = client.channels.cache.get(SUGGESTION_CHANNEL);
    if (ch) ch.send(`💡 Suggestion by ${interaction.user.username}\n${text}`);
    interaction.reply("Suggestion sent");
  }

  /* GITHUB */
  if (interaction.commandName === "github") {
    interaction.reply("Drive-for-Java\nhttps://github.com/Drive-for-Java");
  }

  /* COIN */
  if (interaction.commandName === "coin") {
    let r = Math.random() < 0.5 ? "Heads" : "Tails";
    interaction.reply("🪙 " + r);
  }

  /* LEADERBOARD */
  if (interaction.commandName === "leaderboard") {
    let data = JSON.parse(fs.readFileSync("xp.json"));
    let arr = Object.values(data).sort((a, b) => b.xp - a.xp).slice(0, 10);
    let text = "🏆 Leaderboard\n\n";
    arr.forEach((u, i) => {
      text += `${i + 1}. ${u.name} - ${u.xp} XP\n`;
    });
    interaction.reply(text);
  }
});


/* REGISTER COMMANDS */
const commands = [
  new SlashCommandBuilder().setName("info").setDescription("Bot info"),
  new SlashCommandBuilder().setName("server").setDescription("Server info"),
  new SlashCommandBuilder().setName("java").setDescription("Java info"),
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Repeat message")
    .addStringOption(o => o.setName("text").setDescription("Message").setRequired(true)),
  new SlashCommandBuilder()
    .setName("suggestion")
    .setDescription("Send suggestion")
    .addStringOption(o => o.setName("text").setDescription("Suggestion").setRequired(true)),
  new SlashCommandBuilder().setName("github").setDescription("Github link"),
  new SlashCommandBuilder().setName("coin").setDescription("Flip coin"),
  new SlashCommandBuilder().setName("leaderboard").setDescription("XP leaderboard")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("Slash commands registered");
  } catch (err) {
    console.error("Failed to register slash commands:", err);
  }
})();


/* LOGIN */
client.login(process.env.TOKEN)
  .then(() => {
    console.log("Discord login succeeded!");
  })
  .catch(err => {
    console.error("Discord login failed:", err);
  });
