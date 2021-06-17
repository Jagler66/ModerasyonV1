const { Client, MessageEmbed } = require('discord.js')
const fs = require("fs")
const http = require("http")
const db = require("quick.db")
const moment = require("moment")
const ayar = require("./ayarlar.json")
let sunucuayarDB = new db.table("sunucuayar")
let inviteDB = new db.table("invitemanager");

const Discord = require("discord.js");
const client = new Discord.Client();
client.on("ready", async() => {
    console.log(`${client.user.username} İsmi ile giriş yapıldı.`)
    client.user.setPresence({
        activity: { name: "Mavera 💙 Aptul" }, status: "idle"});
    let ses = client.channels.cache.get(ayar.ses)
    if (ses) ses.join().catch(err => console.error("Ses kanalı hatası"))})

const log = message => {console.log(` ${message}`);};
require("./util/eventLoader.js")(client);

fs.readdir("./events", (err, files) => {
    if (err) return console.error(err);
    files.filter(file => file.endsWith(".js")).forEach(file => {
        let prop = require(`./events/${file}`);
        if (!prop.configuration) return;
        client.on(prop.configuration.name, prop)})})

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./cmd/", (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./cmd/${f}`);
        log(`Yüklenen komut: ${props.conf.name}.`);
        client.commands.set(props.conf.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.conf.name);
        });
    });
});

client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./cmd/${command}`)];
            let cmd = require(`./cmd/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.conf.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./cmd/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.conf.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./cmd/${command}`)];
            let cmd = require(`./cmd/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};


client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayar.sahip) permlvl = 4;
    return permlvl;
};

client.login(ayar.token);

client.tarihHesapla = (date) => {
    const startedAt = Date.parse(date)
    var msecs = Math.abs(new Date() - startedAt)

    const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365))
    msecs -= years * 1000 * 60 * 60 * 24 * 365
    const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30))
    msecs -= months * 1000 * 60 * 60 * 24 * 30
    const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7))
    msecs -= weeks * 1000 * 60 * 60 * 24 * 7
    const days = Math.floor(msecs / (1000 * 60 * 60 * 24))
    msecs -= days * 1000 * 60 * 60 * 24
    const hours = Math.floor(msecs / (1000 * 60 * 60))
    msecs -= hours * 1000 * 60 * 60
    const mins = Math.floor((msecs / (1000 * 60)))
    msecs -= mins * 1000 * 60
    const secs = Math.floor(msecs / 1000)
    msecs -= secs * 1000

    var string = ""
    if (years > 0) string += `${years} yıl ${months} ay`
    else if (months > 0) string += `${months} ay ${weeks > 0 ? weeks+" hafta" : ""}`
    else if (weeks > 0) string += `${weeks} hafta ${days > 0 ? days+" gün" : ""}`
    else if (days > 0) string += `${days} gün ${hours > 0 ? hours+" saat" : ""}`
    else if (hours > 0) string += `${hours} saat ${mins > 0 ? mins+" dakika" : ""}`
    else if (mins > 0) string += `${mins} dakika ${secs > 0 ? secs+" saniye" : ""}`
    else if (secs > 0) string += `${secs} saniye`
    else string += `saniyeler`
    string = string.trim(); return `\`${string} önce\` `}

client.on("message", (message) => {
            if (!message.guild || message.author.bot || message.content.toLowerCase().includes(`${ayar.prefix}afk`)) return
            let embed = new MessageEmbed().setColor('RANDOM')
            if (message.mentions.users.size >= 1) {
                let member = message.mentions.users.first()
                if (db.has(`${member.id}.afk`)) {
                    let data = db.get(`${member.id}.afk`)
                    let tarih = client.tarihHesapla(data.sure)
                    return message.channel.send(embed.setDescription(`• ${member} kullanıcısı
• ${data.sebep ? `\`${data.sebep}\` sebebiyle ` : ""}
• ${tarih} zamandır klavyeden uzak.`)).then(x => x.delete({ timeout: 10000 }))}}

    if(!db.has(`${message.author.id}.afk`)) return;
    if(message.member.manageable) message.member.setNickname(message.member.displayName.replace("[AFK]", "")).catch()
    db.delete(`${message.author.id}.afk`)
    message.channel.send(`${message.author} klavyene tekrar hoşgeldin. Seni özlemiştik !`).then(x => x.delete({timeout: 5000}))})

//  client.on("message", async mavera => {
//    if (!member.activity) return;
//    if (member.activity.partyID.startsWith("spotify:")) {
//    mavera.delete().catch(e => {})
//    mavera.reply('Bu sunucuda spotify davet linki atman yasaktır.').catch(e => {})}})

client.ayar = {
"kufurler": ["@here", "@everyone", "anskm", "orosbu", "orosb", "0r0spuc0cu", "4n4n1 sk3r1m", "p1c", "@n@nı skrm", "evladi", "orsb", "orsbcogu", "amnskm", "anaskm", "mk", "oc", "abaza", "abazan", "ag", "ağzına sıçayım", "fuck",
    "shit", "ahmak", "seks", "sex", "allahsız", "amarım", "ambiti", "am biti", "amcığı", "amcığın", "amcığını", "amcığınızı", "amcık", "amcık hoşafı", "amcıklama", "amcıklandı", "amcik", "amck",
    "amckl", "amcklama", "amcklaryla", "amckta", "amcktan", "amcuk", "amık", "amına", "amınako", "amına koy", "amına koyarım", "amına koyayım", "amınakoyim", "amına koyyim", "amına s", "amına sikem",
    "amına sokam", "amın feryadı", "amını", "amını s", "amın oglu", "amınoğlu", "amın oğlu", "amısına", "amısını", "amina", "amina g", "amina k", "aminako", "aminakoyarim", "amina koyarim", "amina koyayım",
    "amina koyayim", "aminakoyim", "aminda", "amindan", "amindayken", "amini", "aminiyarraaniskiim", "aminoglu", "amin oglu", "amiyum", "amk", "amkafa", "amk çocuğu", "amlarnzn", "amlı", "amm", "ammak", "ammna",
    "amn", "amna", "amnda", "amndaki", "amngtn", "amnn", "amona", "amq", "amsız", "amsiz", "amsz", "amteri", "amugaa", "amuğa", "amuna", "ana", "anaaann", "anal", "analarn", "anam", "anamla", "anan", "anana", "anandan",
    "ananı", "ananı", "ananın", "ananın am", "ananın amı", "ananın dölü", "ananınki", "ananısikerim", "ananı sikerim", "ananısikeyim", "ananı sikeyim", "ananızın", "ananızın am", "anani", "ananin", "ananisikerim", "anani sikerim",
    "ananisikeyim", "anani sikeyim", "anann", "ananz", "anas", "anasını", "anasının am", "anası orospu", "anasi", "anasinin", "anay", "anayin", "angut", "anneni", "annenin", "annesiz", "anuna", "aptal", "aq", "a.q", "a.q.", "aq.", "ass",
    "atkafası", "atmık", "attırdığım", "attrrm", "auzlu", "avrat", "ayklarmalrmsikerim", "azdım", "azdır", "azdırıcı", "babaannesi kaşar", "babanı", "babanın", "babani", "babası pezevenk", "bacağına sıçayım", "bacına", "bacını",
    "bacının", "bacini", "bacn", "bacndan", "bacy", "bastard", "basur", "beyinsiz", "bızır", "bitch", "biting", "bok", "boka", "bokbok", "bokça", "bokhu", "bokkkumu", "boklar", "boktan", "boku", "bokubokuna", "bokum", "bombok", "boner",
    "bosalmak", "boşalmak", "cenabet", "cibiliyetsiz", "cibilliyetini", "cibilliyetsiz", "cif", "cikar", "cim", "çük", "dalaksız", "dallama", "daltassak", "dalyarak", "dalyarrak", "dangalak", "dassagi", "diktim", "dildo", "dingil",
    "dingilini", "dinsiz", "dkerim", "domal", "domalan", "domaldı", "domaldın", "domalık", "domalıyor", "domalmak", "domalmış", "domalsın", "domalt", "domaltarak", "domaltıp", "domaltır", "domaltırım", "domaltip", "domaltmak", "dölü",
    "dönek", "düdük", "eben", "ebeni", "ebenin", "ebeninki", "ebleh", "ecdadını", "ecdadini", "embesil", "emi", "fahise", "fahişe", "feriştah", "ferre", "fuck", "fucker", "fuckin", "fucking", "gavad", "gavat", "geber", "geberik", "gebermek",
    "gebermiş", "gebertir", "gerızekalı", "gerizekalı", "gerizekali", "gerzek", "giberim", "giberler", "gibis", "gibiş", "gibmek", "gibtiler", "goddamn", "godoş", "godumun", "gotelek", "gotlalesi", "gotlu", "gotten", "gotundeki",
    "gotunden", "gotune", "gotunu", "gotveren", "goyiim", "goyum", "goyuyim", "goyyim", "göt", "göt deliği", "götelek", "göt herif", "götlalesi", "götlek", "götoğlanı", "göt oğlanı", "götoş", "götten", "götü", "götün", "götüne",
    "götünekoyim", "götüne koyim", "götünü", "götveren", "göt veren", "göt verir", "gtelek", "gtn", "gtnde", "gtnden", "gtne", "gtten", "gtveren", "hasiktir", "hassikome", "hassiktir", "has siktir", "hassittir", "haysiyetsiz",
    "hayvan herif", "hoşafı", "hödük", "hsktr", "huur", "ıbnelık", "ibina", "ibine", "ibinenin", "ibne", "ibnedir", "ibneleri", "ibnelik", "ibnelri", "ibneni", "ibnenin", "ibnerator", "ibnesi", "idiot", "idiyot", "imansz", "ipne",
    "iserim", "işerim", "itoğlu it", "kafam girsin", "kafasız", "kafasiz", "kahpe", "kahpenin", "kahpenin feryadı", "kaka", "kaltak", "kancık", "kancik", "kappe", "karhane", "kaşar", "kavat", "kavatn", "kaypak", "kayyum", "kerane",
    "kerhane", "kerhanelerde", "kevase", "kevaşe", "kevvase", "koca göt", "koduğmun", "koduğmunun", "kodumun", "kodumunun", "koduumun", "koyarm", "koyayım", "koyiim", "koyiiym", "koyim", "koyum", "koyyim", "krar", "kukudaym",
    "laciye boyadım", "lavuk", "liboş", "madafaka", "mal", "malafat", "malak", "manyak", "mcik", "meme", "memelerini", "mezveleli", "minaamcık", "mincikliyim", "mna", "monakkoluyum", "motherfucker", "mudik", "oc", "ocuu", "ocuun",
    "Oç", "oç", "o. çocuğu", "oğlan", "oğlancı", "oğlu it", "orosbucocuu", "orospu", "orospucocugu", "orospu cocugu", "orospu çoc", "orospuçocuğu", "orospu çocuğu", "orospu çocuğudur", "orospu çocukları", "orospudur", "orospular",
    "orospunun", "orospunun evladı", "orospuydu", "orospuyuz", "orostoban", "orostopol", "orrospu", "oruspu", "oruspuçocuğu", "oruspu çocuğu", "osbir", "ossurduum", "ossurmak", "ossuruk", "osur", "osurduu", "osuruk", "osururum",
    "otuzbir", "öküz", "öşex", "patlak zar", "penis", "pezevek", "pezeven", "pezeveng", "pezevengi", "pezevengin evladı", "pezevenk", "pezo", "pic", "pici", "picler", "piç", "piçin oğlu", "piç kurusu", "piçler", "pipi", "pipiş", "pisliktir",
    "porno", "pussy", "puşt", "puşttur", "rahminde", "revizyonist", "s1kerim", "s1kerm", "s1krm", "sakso", "saksofon", "salaak", "salak", "saxo", "sekis", "serefsiz", "sevgi koyarım", "sevişelim", "sexs", "sıçarım", "sıçtığım", "sıecem",
    "sicarsin", "sie", "sik", "sikdi", "sikdiğim", "sike", "sikecem", "sikem", "siken", "sikenin", "siker", "sikerim", "sikerler", "sikersin", "sikertir", "sikertmek", "sikesen", "sikesicenin", "sikey", "sikeydim", "sikeyim", "sikeym",
    "siki", "sikicem", "sikici", "sikien", "sikienler", "sikiiim", "sikiiimmm", "sikiim", "sikiir", "sikiirken", "sikik", "sikil", "sikildiini", "sikilesice", "sikilmi", "sikilmie", "sikilmis", "sikilmiş", "sikilsin", "sikim", "sikimde",
    "sikimden", "sikime", "sikimi", "sikimiin", "sikimin", "sikimle", "sikimsonik", "sikimtrak", "sikin", "sikinde", "sikinden", "sikine", "sikini", "sikip", "sikis", "sikisek", "sikisen", "sikish", "sikismis", "sikiş", "sikişen",
    "sikişme", "sikitiin", "sikiyim", "sikiym", "sikiyorum", "sikkim", "sikko", "sikleri", "sikleriii", "sikli", "sikm", "sikmek", "sikmem", "sikmiler", "sikmisligim", "siksem", "sikseydin", "sikseyidin", "siksin", "siksinbaya",
    "siksinler", "siksiz", "siksok", "siksz", "sikt", "sikti", "siktigimin", "siktigiminin", "siktiğim", "siktiğimin", "siktiğiminin", "siktii", "siktiim", "siktiimin", "siktiiminin", "siktiler", "siktim", "siktim", "siktimin",
    "siktiminin", "siktir", "siktir et", "siktirgit", "siktir git", "siktirir", "siktiririm", "siktiriyor", "siktir lan", "siktirolgit", "siktir ol git", "sittimin", "sittir", "skcem", "skecem", "skem", "sker", "skerim", "skerm",
    "skeyim", "skiim", "skik", "skim", "skime", "skmek", "sksin", "sksn", "sksz", "sktiimin", "sktrr", "skyim", "slaleni", "sokam", "sokarım", "sokarim", "sokarm", "sokarmkoduumun", "sokayım", "sokaym", "sokiim", "soktuğumunun", "sokuk",
    "sokum", "sokuş", "sokuyum", "soxum", "sulaleni", "sülaleni", "sülalenizi", "sürtük", "şerefsiz", "şıllık", "taaklarn", "taaklarna", "tarrakimin", "tasak", "tassak", "taşak", "taşşak", "tipini s.k", "tipinizi s.keyim", "tiyniyat",
    "toplarm", "topsun", "totoş", "vajina", "vajinanı", "veled", "veledizina", "veled i zina", "verdiimin", "weled", "weledizina", "whore", "xikeyim", "yaaraaa", "yalama", "yalarım", "yalarun", "yaraaam", "yarak", "yaraksız", "yaraktr",
    "yaram", "yaraminbasi", "yaramn", "yararmorospunun", "yarra", "yarraaaa", "yarraak", "yarraam", "yarraamı", "yarragi", "yarragimi", "yarragina", "yarragindan", "yarragm", "yarrağ", "yarrağım", "yarrağımı", "yarraimin", "yarrak",
    "yarram", "yarramin", "yarraminbaşı", "yarramn", "yarran", "yarrana", "yarrrak", "yavak", "yavş", "yavşak", "yavşaktır", "yavuşak", "yılışık", "yilisik", "yogurtlayam", "yoğurtlayam", "yrrak", "zıkkımım", "zibidi", "zigsin", "zikeyim",
    "zikiiim", "zikiim", "zikik", "zikim", "ziksiiin", "ziksiin", "zulliyetini", "zviyetini", "4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka",
    "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch",
    "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs",
    "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris",
    "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok",
    "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts",
    "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker",
    "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag",
    "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio",
    "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook",
    "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker",
    "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell",
    "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead",
    "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate",
    "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz",
    "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin",
    "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah",
    "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker",
    "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop",
    "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing",
    "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting",
    "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez",
    "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina",
    "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"]}

    client.on("message", async function (msg) {
        if (!msg.guild || msg.author.id === client.user.id) return;
        let kufurKoruma = await sunucuayarDB.get(`sunucuayar.kufur_koruma`);
        if (kufurKoruma) { try { let args = msg.content.split(" ")
            const kufurler = client.ayar.kufurler
            if (kufurler.some(word => args.some(c => word.toLowerCase() == c.toLowerCase()))) { if (!msg.member.permissions.has(8)) { msg.delete()}}} catch (err) {}}})

            client.on("messageUpdate", async (oldMsg, newMsg) => {
                if (!newMsg.guild || newMsg.member.permissions.has(8) || newMsg.author.id === client.user.id) return
                let kufur = await sunucuayarDB.get(`sunucuayar.kufur_koruma`)
                if (kufur) { try { let args = newMsg.content.split(" ")
                    const kufurler = client.ayar.kufurler
                    if (kufurler.some(word => args.some(c => word.toLowerCase() == c.toLowerCase()))) { newMsg.delete().catch(err => {})}} catch (err) {}}})

                    const Invites = new Discord.Collection()

                    client.on("ready", () => { client.guilds.cache.forEach(guild => { guild.fetchInvites().then(_invites => { Invites.set(guild.id, _invites)}).catch(err => {})})})
                    client.on("inviteCreate", (invite) => { var gi = Invites.get(invite.guild.id)
                      gi.set(invite.code, invite)
                      Invites.set(invite.guild.id, gi)})
                    client.on("inviteDelete", (invite) => { var gi = Invites.get(invite.guild.id)
                      gi.delete(invite.code)
                      Invites.set(invite.guild.id, gi)})

                    client.on("guildCreate", (guild) => { guild.fetchInvites().then(invites => { Invites.set(guild.id, invites)}).catch(e => {})})

                    client.on("guildMemberAdd", async (member) => { const gi = (Invites.get(member.guild.id) || new Collection()).clone()
                      const settings = ayar.invites || {}
                      let guild = member.guild
                      let total = 0
                      let regular = 0 
                      let _fake = 0
                      let bonus = 0
                    
                      let fake = (Date.now() - member.createdAt) / (1000 * 60 * 60 * 24) <= 3 ? true : false
                    
                      guild.fetchInvites().then(async invites => { // var invite = invites.find(_i => gi.has(_i.code) && gi.get(_i.code).maxUses != 1 && gi.get(_i.code).uses < _i.uses) || gi.find(_i => !invites.has(_i.code)) || guild.vanityURLCode
                        let invite = invites.find(_i => gi.has(_i.code) && gi.get(_i.code).uses < _i.uses) || gi.find(_i => !invites.has(_i.code)) || guild.vanityURLCode
                        Invites.set(member.guild.id, invites)
                        if (invite == guild.vanityURLCode) client.channels.cache.get(settings).send(`:tada: ${member} özel bir URL ile giriş yaptı.`)
                    
                        if (invite.inviter) { await inviteDB.set(`invites.${member.id}.inviter`, invite.inviter.id)
                          if (fake) { total = await inviteDB.add(`invites.${invite.inviter.id}.total`, 1)
                            _fake = await inviteDB.add(`invites.${invite.inviter.id}.fake`, 1)} else { total = await inviteDB.add(`invites.${invite.inviter.id}.total`, 1)
                            regular = await inviteDB.add(`invites.${invite.inviter.id}.regular`, 1)}
                          bonus = await inviteDB.get(`invites.${invite.inviter.id}.bonus`) || 0}

                        await inviteDB.set(`invites.${member.id}.isfake`, fake);

                          client.channels.cache.get(settings).send(`:tada: ${member} katıldı! Davet eden: ${invite.inviter} (**${total + bonus}** davet)`).replace("-member-", `${member}`)
                          .replace("-target-", `${invite.inviter}`)
                          .replace("-total-", `${total + bonus}`)
                          .replace("-regular-", `${regular}`)
                          .replace("-fakecount-", `${_fake}`)
                          .replace("-invite-", `${invite && invite.code != undefined ? invite.code : "Davet kodu bulunamadı."}`)
                          .replace("-fake-", `${fake}`)}).catch()})
                    
                    client.on("guildMemberRemove", async (member) => {
                      const db = inviteDB
                      const settings = sunucuayarDB.get(`sunucuayar.invite_kanal`) || {}
                      var total = 0
                        bonus = 0
                        regular = 0
                        fakecount = 0
                        data = db.get(`invites.${member.id}`)
                      if (!data) return

                      if (data.isfake && data.inviter) { fakecount = db.subtract(`invites.${data.inviter}.fake`, 1)
                        total = db.subtract(`invites.${data.inviter}.total`, 1)} else if (data.inviter) { regular = db.subtract(`invites.${data.inviter}.regular`, 1)
                        total = db.subtract(`invites.${data.inviter}.total`, 1)}
                      if (data.inviter) bonus = db.get(`invites.${data.inviter}.bonus`) || 0

                      db.add(`invites.${data.inviter}.leave`, 1)
                        client.channels.cache.get(settings).send(`${member} üyesi sunucudan çıkış yaptı.`).replace("-member-", `${member}`)})