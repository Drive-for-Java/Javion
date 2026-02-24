console.log("TOKEN exists:",process.env.TOKEN?true:false);

require("dotenv").config();

const {
Client,
GatewayIntentBits,
SlashCommandBuilder,
Routes,
REST,
EmbedBuilder
} = require("discord.js");

const fs=require("fs");


const client=new Client({

intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]

});



const REACTION_CHANNEL="1431294508015816837";
const SUGGESTION_CHANNEL="1475107874144518217";
const XP_CHANNEL="1433107389476769952";
const COUNT_CHANNEL="1475107452709241004";





let xpData={};
let countData={number:0,lastUser:""};
let dailyData={};

try{
xpData=JSON.parse(fs.readFileSync("xp.json"));
}catch{}

try{
countData=JSON.parse(fs.readFileSync("count.json"));
}catch{}





setInterval(()=>{

fs.writeFileSync("xp.json",JSON.stringify(xpData,null,2));
fs.writeFileSync("count.json",JSON.stringify(countData,null,2));

},30000);



client.once("ready",()=>{

console.log("Javion Online");

});



client.on("messageCreate",async msg=>{

if(msg.author.bot)return;


/* AUTO REACTION */

if(msg.channel.id===REACTION_CHANNEL){

msg.react("👋");

}





if(!xpData[msg.author.id]){

xpData[msg.author.id]={

messages:0,
xp:0,
name:msg.author.username

};

}


xpData[msg.author.id].messages++;

if(xpData[msg.author.id].messages>=50){

xpData[msg.author.id].messages=0;

xpData[msg.author.id].xp+=1;

let ch=client.channels.cache.get(XP_CHANNEL);

if(ch)

ch.send(`⭐ ${msg.author} gained 1 XP`);

}





if(msg.channel.id===COUNT_CHANNEL){

let num=parseInt(msg.content);


if(isNaN(num)){

msg.reply("🔢 Please send numbers only");

return;

}



if(msg.author.id===countData.lastUser){

msg.reply("🚫 You can't count twice!");

msg.react("❌");

return;

}



if(num===countData.number+1){

countData.number++;

countData.lastUser=msg.author.id;

msg.react("✅");

}

else{

msg.reply(`💥 COUNT RUINED!

Expected:

${countData.number+1}

Restarting from 1`);

msg.react("💥");

countData.number=0;
countData.lastUser="";

}


}



});



client.on("interactionCreate",async interaction=>{

if(!interaction.isChatInputCommand())return;

const name=interaction.commandName;





if(name==="say"){

let text=interaction.options.getString("text");

let embed=new EmbedBuilder()

.setTitle("💬 Message")

.setDescription(`${interaction.user} said:

"${text}"`)

.setColor("Blue");

interaction.reply({embeds:[embed]});

}





if(name==="suggestion"){

let text=interaction.options.getString("text");

let embed=new EmbedBuilder()

.setTitle("💡 Suggestion")

.setDescription(`${interaction.user}

"${text}"`)

.setColor("Green");

let ch=client.channels.cache.get(SUGGESTION_CHANNEL);

if(ch)

ch.send({embeds:[embed]});

interaction.reply("✅ Suggestion Sent");

}





if(name==="daily"){

let id=interaction.user.id;

let now=Date.now();

if(!dailyData[id])dailyData[id]=0;


if(now-dailyData[id]<86400000){

interaction.reply("⏳ You already claimed daily XP");

return;

}


let xp=Math.floor(Math.random()*300)+300;


if(!xpData[id])

xpData[id]={messages:0,xp:0,name:interaction.user.username};


xpData[id].xp+=xp;

dailyData[id]=now;


interaction.reply(`🎁 You received ${xp} XP`);

}





if(name==="rank"){

let id=interaction.user.id;

if(!xpData[id])

xpData[id]={messages:0,xp:0,name:interaction.user.username};


interaction.reply(`⭐ XP:

${xpData[id].xp}`);

}





if(name==="avatar"){

let embed=new EmbedBuilder()

.setTitle("🖼 Avatar")

.setImage(interaction.user.displayAvatarURL())

.setColor("Blue");

interaction.reply({embeds:[embed]});

}




if(name==="ping"){

interaction.reply(`🏓 Pong!

${client.ws.ping} ms`);

}





if(name==="help"){

interaction.reply(`📚 Commands

/say

/suggestion

/daily

/rank

/avatar

/ping

/help

/leaderboard

/uptime`);

}





if(name==="leaderboard"){

let arr=Object.values(xpData)

.sort((a,b)=>b.xp-a.xp)

.slice(0,10);


let text="🏆 Leaderboard\n\n";


arr.forEach((u,i)=>{

text+=`${i+1}. ${u.name} - ${u.xp} XP\n`;

});


interaction.reply(text);

}



/* UPTIME */

if(name==="uptime"){

let sec=Math.floor(process.uptime());


interaction.reply(`⏱ Uptime:

${sec} seconds`);

}



});





const commands=[

new SlashCommandBuilder()

.setName("say")

.setDescription("Say message")

.addStringOption(o=>o.setName("text").setDescription("Text").setRequired(true)),


new SlashCommandBuilder()

.setName("suggestion")

.setDescription("Send suggestion")

.addStringOption(o=>o.setName("text").setDescription("Text").setRequired(true)),


new SlashCommandBuilder()

.setName("daily")

.setDescription("Daily XP"),


new SlashCommandBuilder()

.setName("rank")

.setDescription("Your XP"),


new SlashCommandBuilder()

.setName("avatar")

.setDescription("Your avatar"),


new SlashCommandBuilder()

.setName("ping")

.setDescription("Bot speed"),


new SlashCommandBuilder()

.setName("help")

.setDescription("Commands"),


new SlashCommandBuilder()

.setName("leaderboard")

.setDescription("Leaderboard"),


new SlashCommandBuilder()

.setName("uptime")

.setDescription("Bot uptime")

].map(c=>c.toJSON());



const rest=new REST({version:"10"})

.setToken(process.env.TOKEN);



(async()=>{

await rest.put(

Routes.applicationCommands(process.env.CLIENT_ID),

{body:commands}

);

console.log("Commands Registered");

})();



client.login(process.env.TOKEN);


client.login(process.env.TOKEN)
  .then(() => console.log("Discord login succeeded!"))
  .catch(err => console.error("Discord login failed:", err));
