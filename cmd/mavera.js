const { MessageEmbed } = require('discord.js')
const ayar = require('../ayarlar.json')

exports.run = async(client, message, args) => {

  let maveraninembedcigi = new MessageEmbed.setFooter(ayar.footer).setColor('BLACK')
  
  message.channel.send(maveraninembedcigi.setDescription(`${ayar.yes} Mavera'nın botu olan bu test komutu başarılı bir şekilde **ÇALIŞMAKTADIR.**`))
}

exports.help = { name: "mavera", aliases: [], permLevel: 0 }
