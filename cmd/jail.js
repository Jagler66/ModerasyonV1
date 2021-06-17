const { MessageEmbed } = require("discord.js");
const ayar = require("../ayarlar.json");
const db = require("quick.db")
const kdb = new db.table("kullanıcı");
const moment = require("moment");
exports.run = async(client, message, args) => {
    if (!message.member.roles.cache.has(ayar.jailci) && !message.member.hasPermission("ADMINISTRATOR")) return message.react(ayar.no)
    let embed = new MessageEmbed().setColor('RANDOM')

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    let reason = args.splice(1).join(" ") || "Belirtilmedi."
    if (!user) return message.channel.send(embed.setDescription(`${message.author} kime ceza vereceğini yazmadın! \`.jail @Mavera/ID <süre> <sebep>\``)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))

    if (user.id === message.author.id) return message.react(ayar.no)
    if (user.id === client.user.id) return message.react(ayar.no)
    if (user.roles.highest.position >= message.member.roles.highest.position) return message.react(ayar.no)
    if (user.hasPermission(8)) return message.react(ayar.no)

    let atilanAy = moment(Date.now()).format("MM");
    let atilanSaat = moment(Date.now()).format("HH:mm:ss");
    let atilanGün = moment(Date.now()).format("DD");
    let jailAtılma = `${atilanGün} ${atilanAy.replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık")} ${atilanSaat}`;

    let cezaID = db.get(`cezaid.${message.guild.id}`) + 1
    let puan = await kdb.fetch(`cezapuan.${user.id}`) || "0"
    let durum = await kdb.get(`durum.${user.id}.jail`)
    if (durum) return message.channel.send(embed.setDescription(`Kullanıcı zaten karantinada.`)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 6999 }))

    user.roles.set([ayar.jailRol])
    message.react(ayar.yes)
    message.channel.send(embed.setFooter(`Kullanıcının toplam ${puan} puan cezası bulunuyor.`).setDescription(`${user} kullanıcısı ${message.author} tarafından **${reason}** sebebiyle karantinaya postalandı.`)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))

    db.add(`cezaid.${message.guild.id}`, +1)
    kdb.add(`jailler.${message.author.id}`, 1)
    kdb.add(`cezapuan.${user.id}`, 15)
    kdb.push(`sicil.${user.id}`, { userID: user.id, adminID: message.author.id, Tip: "Karantina", start: jailAtılma, cezaID: cezaID })
    kdb.set(`durum.${user.id}.jail`, true)
    client.channels.cache.get(ayar.jailLog).send(embed.setDescription(`
    
    \`•\` Ceza ID: \`${cezaID}\`
    \`•\` Karantinalanan Kullanıcı: ${user} (\`${user.id}\`)
    \`•\` Karantinalayan Yetkili: ${message.author} (\`${message.author.id}\`)
    \`•\` Karantina Sebebi: \`${reason}\`
    \`•\` Karantina Tarihi: \`${jailAtılma}\`
`))}

exports.conf = { name: "jail", aliases: ['karantina'], permLevel: 0 }