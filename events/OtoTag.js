const discord = require("discord.js");
const db = require("quick.db");
const ayar = require("../ayarlar.json");
const message = require("./message");

module.exports = async(oldUser, newUser) => {
    let client = oldUser.client;
    let guildID = ayar.guildID
    let user = client.guilds.cache.get(guildID).members.cache.get(oldUser.id)
    let tag = ayar.tag
    let unTag = ayar.unTag
    let tagRol = user.guild.roles.cache.get(ayar.family)
    let tagLog = ayar.taglog

    let embed = new discord.MessageEmbed().setColor('DARK')
    if (oldUser.username === newUser.username) return;
    if (newUser.username.includes(tag) && !user.roles.cache.has(tagRol.id)) { user.roles.add(tagRol).catch()
        user.setNickname(user.displayName.replace(unTag, tag)).catch()
        client.channels.cache.get(tagLog).send(embed.setDescription(`:tada: ${user} kullanıcısı tagımızı aldığı için rolünü verdim.`))}

    if (!newUser.username.includes(tag) && user.roles.cache.has(tagRol.id)) {
        user.roles.remove(user.roles.cache.filter(s => tagRol.position <= s.position)).catch()
        user.setNickname(user.displayName.replace(tag, unTag)).catch()
        client.channels.cache.get(tagLog).send(embed.setDescription(`${user} kullanıcısı tagımızı bıraktığı için rolünü aldım.`))}}

module.exports.configuration = {name: "userUpdate"}