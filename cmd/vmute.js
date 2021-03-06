const { MessageEmbed } = require("discord.js")
const ayar = require("../ayarlar.json")
const db = require("quick.db")
const kdb = new db.table("kullanıcı")
const moment = require("moment")
const ms = require("ms")

exports.run = async(client, message, args) => {
    if (!message.member.roles.cache.has(ayar.vmuteci) && !message.member.hasPermission("ADMINISTRATOR")) return message.react(ayar.no)
    let embed = new MessageEmbed().setColor('RANDOM')

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    let reason = args.splice(2).join(" ") || "Belirtilmedi."
    if (!user) return message.channel.send(embed.setDescription(`${message.author} kime ceza vereceğini yazmadın! \`.vmute @Mavera/ID <sebep> <süre>\``)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))
    if (!user.voice.channel) return message.react(ayar.no)
    if (!args[1]) return message.channel.send(embed.setDescription(`${message.author} ceza süresini yazmadın! \`.vmute @Mavera/ID <sebep> <süre\``)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))
    let sure = args[1]
        .replace("s", " Saniye")
        .replace("m", " Dakika")
        .replace("h", " Saat")
        .replace("d", " Gün")

    if (user.id === client.user.id) return message.react(ayar.no)
    if (user.id === message.author.id) return message.react(ayar.no)
    if (user.roles.highest.position >= message.member.roles.highest.position) return message.react(ayar.no)

    let atilanAy = moment(Date.now()).format("MM");
    let atilanSaat = moment(Date.now()).format("HH:mm:ss");
    let atilanGün = moment(Date.now()).format("DD");
    let bitişAy = moment(Date.now() + ms(args[1])).format("MM");
    let bitişSaat = moment(Date.now() + ms(args[1])).format("HH:mm:ss");
    let bitişGün = moment(Date.now() + ms(args[1])).format("DD");
    let muteAtılma = `${atilanGün} ${atilanAy.replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık")} ${atilanSaat}`;
    let muteBitiş = `${bitişGün} ${bitişAy.replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık")} ${bitişSaat}`;
    let cezaID = db.get(`cezaid.${message.guild.id}`) + 1
    let puan = await kdb.fetch(`cezapuan.${user.id}`) || "0"
    let durum = await kdb.get(`durum.${user.id}.vmute`)
    if (durum) return message.channel.send(embed.setDescription(`Kullanıcı zaten muteli.`)).then(x => x.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))

    user.voice.setMute(true)
    message.react(ayar.yes)
    message.channel.send(embed.setFooter(`Kullanıcının toplam ${puan} ceza puanı bulunuyor.`).setDescription(`${user} kullanıcısı ${message.author} tarafından **${reason}** sebebiyle \`${sure}\` süresince voice-mute cezası aldı.`)).then(x => x.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))

    db.add(`cezaid.${message.guild.id}`, +1)
    kdb.add(`cezapuan.${user.id}`, 5)
    kdb.push(`sicil.${user.id}`, { userID: user.id, adminID: message.author.id, Tip: "Voice-Mute", start: muteAtılma, cezaID: cezaID })
    kdb.set(`durum.${user.id}.vmute`, true)
    client.channels.cache.get(ayar.vmuteLog).send(embed.setDescription(`
    
    \`•\` Ceza ID: \`#${cezaID}\`
    \`•\` Mutelenen Kullanıcı: ${user} (\`${user.id}\`)
    \`•\` Muteleyen Yetkili: ${message.author} (\`${message.author.id}\`)
    \`•\` Mute Süresi: \`${sure}\`
    \`•\` Mute Sebebi: \`${reason}\`
    \`•\` Mute Tarihi: \`${muteAtılma}\`
 `))

    setTimeout(async() => { await kdb.delete(`durum.${user.id}.vmute`)
        if (user.voice.channel) user.voice.setMute(false)
        let log = message.guild.channels.cache.get(ayar.vmuteLog)
        if (log) log.send(embed.setDescription(`${user} kullanıcısının **voice-mute** ceza süresi bittiği için mutesini açtım.`))}, ms(args[1]))}

exports.conf = { name: "vmute", aliases: ["voicemute"], permLevel: 0 }