const { MessageEmbed, MessageCollector } = require("discord.js");
const ayar = require("../ayarlar.json");

exports.run = async(client, message, args) => {
    let embed = new MessageEmbed().setColor('RANDOM')
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let victim = message.guild.member(member)
    if (!victim) return message.react(ayar.no)
    if (!victim.voice.channel) return message.react(ayar.no)
    if (!message.member.voice.channel) return message.react(ayar.no)

    message.channel.send(embed.setDescription(`${victim}, ${message.author} sizi yanınıza çekmek istiyor. Kabul ediyor musunuz?`)).then(async(msg) => {
        msg.react(ayar.yes)
        msg.react(ayar.no)

        const onayemoji = (reaction, user) => reaction.emoji.id === "819129740442075166" && user.id === victim.id;
        const redemoji = (reaction, user) => reaction.emoji.id === "819129740417302529" && user.id === victim.id;

        let onay = msg.createReactionCollector(onayemoji, { time: 30000, max: 1 })
        let red = msg.createReactionCollector(redemoji, { time: 30000, max: 1 })

        onay.on("collect", async() => {
            await msg.reactions.removeAll()
            victim.voice.setChannel(message.member.voice.channel.id)
            message.channel.send(embed.setDescription(`${message.author}, ${victim} kullanıcısını yanınıza **çektim.**`)).then(m => m.delete({ timeout: 7000 }))
            msg.delete({ timeout: 7000 })
            message.delete()})

        red.on("collect", async() => { await msg.reactions.removeAll()
            message.channel.send(embed.setDescription(`${message.author}, ${victim} kullanıcısı soruyu reddettiği için yanınıza **çekemedim.**`)).then(m => m.delete({ timeout: 7000 }))
            msg.delete({ timeout: 7000 })
            message.delete()})})}

exports.conf = { name: "içek", aliases: ['izinliçek', 'izinli-çek', 'icek'], permLevel: 0 }