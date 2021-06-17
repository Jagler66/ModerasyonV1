const { MessageEmbed } = require("discord.js");
const ayar = require("../ayarlar.json")
const db = require("quick.db")
exports.run = async(client, message, args) => {
    let embed = new MessageEmbed().setColor('RANDOM').setTimestamp().setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))

    if (!message.member.roles.cache.has(ayar.botCommands) && !message.member.hasPermission(8)) return message.react(ayar.no)

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    if (!user) return message.react(ayar.no)
    if (!user.voice.channel) return message.react(ayar.no)

    let kanal = user.voice.channel
    let mik = user.voice.selfMute ? "\`kapalı\`" : "\`açık\`"
    let kulak = user.voice.selfDeaf ? "\`kapalı\`" : "\`açık\`"
    let yayın = user.voice.streaming ? "\`yapıyor\`" : "\`yapmıyor\`"
    let cam = user.voice.selfVideo ? "\`açık\`" : "\`kapalı\`"
    let kanalinfo = user.voice.channel.userLimit
    let kanaldakiler = message.guild.members.cache.filter(x => x.voice.channel && x.voice.channel.id === kanal.id).size
    let voiceTime = await db.get(`voiceTime_${user.id}_${message.guild.id}`)
    let time = client.tarihHesapla(voiceTime)
    if (kanal && user.voice.channel) {
        message.channel.send(embed.setDescription(`
${user} Adlı kullanıcı \`${kanal.name}\` adlı ses kanalında.
Mikrofonu: ${mik}
Kulaklığı: ${kulak}
Yayın Bilgisi: ${yayın}
Kamera Bilgisi: ${cam}
Kanal Bilgisi: \`${kanaldakiler}/${kanalinfo}\`

Kullanıcı sese ${time} katılmış.

////////////////////////////

Kullanıcı ${kanal.name} kanalında mikrofon/kulaklığı (${mik}/${kulak}) şeklinde yayın ${yayın} ve kamerası ${cam} durumda.

`)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))
    }
};
exports.conf = {
    name: "nerede",
    aliases: [],
    permLevel: 0
};