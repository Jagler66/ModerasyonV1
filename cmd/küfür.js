const Discord = require('discord.js');
const qdb = require("quick.db");

exports.run = async (client, message, args) => {
  if (!message.guild) return
  let db = new qdb.table("sunucuayar");
  let db2 = new qdb.table("prefix");
  let guvenliKisiDB = new qdb.table("guvenlikisi");
  
  let gkv = await guvenliKisiDB.get(`guvenlikisi`) || []
  if (gkv.some(i => i == message.author.id) || message.author.id === message.guild.ownerID) {
    const sec = args[0]
    const prefix = await db2.get("prefix.") || client.ayarlar.prefix
    if (!sec) {
      return message.channel.send(new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTimestamp()
        .addField(`küfür korumayı anlatmaya gerek yok bilen bilir qwe`))}

    if (sec == "aç") {
      if (await db.get(`sunucuayar.kufur_koruma`)) {
        return message.channel.send(new Discord.MessageEmbed().setColor('RANDOM').setDescription(`huğ açam mı kapatam mı ask`))      }
      await db.set(`sunucuayar.kufur_koruma`, "Aktif")
      return message.channel.send(new Discord.MessageEmbed().setColor('RANDOM').setDescription(`Askim küfür engeli açtım. artık özele mi geçseks?`))
    }
    if (sec == "kapat") {
      if (!await db.get(`sunucuayar.kufur_koruma`)) { return message.channel.send(new Discord.MessageEmbed().setColor('RANDOM').setDescription(`askim kafana sıçarım kapalı zaten xd`))}
      await db.delete(`sunucuayar.kufur_koruma`)
      return message.channel.send(new Discord.MessageEmbed().setColor('RANDOM').setDescription(`Küfür engeli kapadım aptulask`))
    }} else { return message.reply(`Bunu sadece aptulask kullanabilir <3`)}}

exports.conf = { name: "küfür", aliases: [], permLevel: 0 }