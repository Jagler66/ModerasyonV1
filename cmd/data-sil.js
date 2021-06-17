const { MessageEmbed } = require("discord.js")
const ayar = require("../ayarlar.json")
const db = require("quick.db")
const kdb = new db.table("kullanıcı")

exports.run = async(client, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.react(ayar.no)
    let embed = new MessageEmbed().setColor('RANDOM')

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;
    let user = message.guild.member(member)
    kdb.delete(`sicil.${user.id}`)
    kdb.delete(`cezapuan.${user.id}`)
    message.react(ayar.yes)}

exports.conf = { name: "sicilsil", aliases: ['sicil-sil', 'sicil-sıfırla', 'sicilsıfırla', 'datasil', 'data-sil', 'dsil'], permLevel: 0 }