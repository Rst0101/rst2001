this.config = {
	name: "dating",
        aliases: ["dating"],
	version: "1.0.0",
	role: 0,
	author: "Henry",
	info: "Tìm một người và xem xem có nên hẹn hò với họ không?",
	Category: "Trò Chơi",
	guides: "[info/breakup]",
	cd: 5,
        hasPrefix: true,
        images: [],
};
 
function msgBreakup() {
    var msg = ['Thật sự 2 người không thể làm lành được sao?', 'Cứ như vậy mà buông tay nhau?', 'Không đau sao? Có chứ? Vậy sao còn muốn buông?', 'Vì một lí do nào đó... 2 người có thể cố gắng được không? ^^', 'Tình yêu là khi hai người quan tâm, chăm sóc lẫn nhau. Bây giờ cả 2 bạn đã hiều điều gì đã xảy ra, 2 bạn có thể quay về bên nhau được không', 'Giận để biết yêu nhau nhiều hơn phải không, cả 2 làm lành nhé vì khi giận nhau mới biết đối phương không thể sống thiếu nhau']
    return msg[Math.floor(Math.random() * msg.length)];
} 
function getMsg() {
    return `Mọi người cùng tới chúc mừng cho 2 người này nào 🥰\n\nLưu ý:\n- Cả 2 bạn sẽ không thể chia tay trong vòng 7 ngày kể từ khi yêu nhau nha\n- Cuối cùng chúc cả hai bạn có nhiều niềm hạnh phúc khi ở bên nhau, cảm ơn vì tin tưởng sử dụng bot của mình`
}
 
this.onReaction = async function({ api, event, Threads, Users, Currencies, onReaction }) {
    var { threadID, userID, reaction,messageID } = event;
    var { turn } = onReaction;
    switch (turn) {
        case "match":
            api.unsendMessage(onReaction.messageID);
            var { senderID, coin, senderInfo, type } = onReaction;
            if (senderID != userID) return;
            await Currencies.setData(senderID, { money: coin - 2000 });
            var data = await Threads.getInfo(threadID);
            var { userInfo } = data;
            var doituong = [];
            for (var i of userInfo) {
                var uif = await Users.getInfo(i.id);
                var gender = '';
                if (uif.gender == 1) gender = "Nữ";
                if (uif.gender == 2) gender = "Nam"; 
                if (uif.dating && uif.dating.status == true) continue;
                if (gender == type) doituong.push({ ID: i.id, name: uif.name });
            }
            if (doituong.length == 0) return api.sendMessage(`Rất tiếc, không có người nào mà bạn cần tìm hoặc họ có hẹn hò với người khác mất rồi ^^`, threadID);
            var random = doituong[Math.floor(Math.random() * doituong.length)];
            var msg = {
                body: `[💏] ${senderInfo.name} - Người mà hệ thống chọn cho bạn là: ${random.name}\n[💌] Phù hợp: ${Math.floor(Math.random() * (80 - 30) + 30)}%\n\nNếu cả 2  người chấp nhận dating, hãy cùng nhau thả cảm xúc trái tim [❤] vào tin nhắn này và chính thức trạng thái dating với nhau`,
                mentions: [ { tag: random.name, id: random.ID }, { tag: senderInfo.name, id: senderID } ]
            }
            return api.sendMessage(msg, threadID, (error, info) => {
                global.Seiko.onReaction.push({ name: this.config.name, messageID: info.messageID, turn: "accept", user_1: { ID: senderID, name: senderInfo.name, accept: false }, user_2: { ID: random.ID, name: random.name, accept: false } });
            });
        case "accept":
            var { user_1, user_2 } = onReaction;
            if (reaction != '❤') return;
            if (userID == user_1.ID) user_1.accept = true;
            if (userID == user_2.ID) user_2.accept = true;
            if (user_1.accept == true && user_2.accept == true) {
                api.unsendMessage(onReaction.messageID);
                var infoUser_1 = await Users.getData(user_1.ID);
                var infoUser_2 = await Users.getData(user_2.ID);
                infoUser_1.data.dating = { status: true, mates: user_2.ID, time: { origin: Date.now(), fullTime: global.Seiko.getTime('fullTime') } };
                infoUser_2.data.dating = { status: true, mates: user_1.ID, time: { origin: Date.now(), fullTime: global.Seiko.getTime('fullTime') } };
                return api.sendMessage(`Cả 2 người vừa cùng nhau thả cảm xúc, nghĩa là cả 2 người chấp nhận tiến tới hẹn hò 💓`, threadID, async (error, info) => {
                    await Users.setData(user_1.ID, infoUser_1);
                    await Users.setData(user_2.ID, infoUser_2);
                    api.changeNickname(`${user_2.name} - Dating with ${user_1.name}`, threadID, user_2.ID);
                    api.changeNickname(`${user_1.name} - Dating with ${user_2.name}`, threadID, user_1.ID);
                    api.sendMessage(getMsg(), threadID);
                });
            }
            break;
        case 'breakup':
            var { userInfo, userMates, user_1, user_2 } = onReaction;
            if (userID == user_1.ID) user_1.accept = true;
            if (userID == user_2.ID) user_2.accept = true;
            if (user_1.accept == true && user_2.accept == true) {
                api.unsendMessage(onReaction.messageID);
                userInfo.data.dating.status = false;
                userMates.data.dating.status = false;
                return api.sendMessage(`Bên nhau vào những lúc giông bão, nhưng lại chẳng thể có nhau vào lúc mưa tan 🙁\nHãy vui lên nhé, có những lúc hợp có những lúc tan vỡ mới khiến bản thân mình mạnh mẽ hơn nữa chứ`, threadID, async () => {
                    await Users.setData(user_1.ID, userInfo);
                    await Users.setData(user_2.ID, userMates);
                    api.changeNickname("", threadID, user_1.ID);
                    api.changeNickname("", threadID, user_2.ID);
                })
            }
            break;
        default:
            break;
    }
}
this.onRun = async function({ api, event, args, Users, Currencies }) {
    var { threadID, messageID, senderID } = event;
    var senderInfo = await Users.getData(senderID);
    var type = ''
    switch (args[0]) {
        case "Nam":
        case "nam":
        case "trai":
            if (senderInfo.data.dating && senderInfo.data.dating.status == true) return api.sendMessage(`Muốn cắm sừng người ta hay sao ?, hãy làm một con người có trách nhiệm nào. Bạn hiện ở trạng thái Dating rồi còn muốn kiếm thêm người khác à 😈`, threadID, messageID);
            type = "Nam";
            break;
        case "Nữ":
        case "nữ":
        case "nu":
        case "Nu":
        case "gái":
        case "gai":
            if (senderInfo.data.dating && senderInfo.data.dating.status == true) return api.sendMessage(`Muốn cắm sừng người ta hay sao ?, hãy làm một con người có trách nhiệm nào. Bạn hiện ở trạng thái Dating rồi còn muốn kiếm thêm người khác à 😈`, threadID, messageID);
            type = "Nữ";
            break;
        case "breakup":
        case "chiatay":
        case "ct":
            var userInfo = await Users.getData(senderID);
            if (!userInfo.data.dating || userInfo.data.dating && userInfo.data.dating.status == false) return api.sendMessage(`Bạn chưa hẹn hò với ai thì chia tay cái gì ?`, threadID, messageID);
            if (Date.now() - userInfo.data.dating.time.origin < 604800000) return api.sendMessage(`Còn chưa tới 7 ngày mà muốn chia tay là sao? 🥺\n\n${msgBreakup()}\n\nHãy cứ bình tĩnh suy nghĩ, cho mọi chuyện dần lắng xuống rồi giải quyết cùng nhau nhé và tình yêu không phải ai cũng may mắn tìm thấy nhau mà ^^`, threadID, messageID);
            var userMates = await Users.getData(userInfo.data.dating.mates);
            return api.sendMessage(`Cả hai người thật sự không thể tiếp tục nữa hay sao ?\nCho bot xin phép xen vào một chút nhé:\n\n${msgBreakup()}\n\nNếu có xem thấy dòng tin nhắn này, hãy cứ cho mọi chuyện lắng xuống...Yên lặng một chut, suy nghĩ cho kĩ nào...\nCó nhiều thứ... một khi mất đi thì sẽ không thể tìm lại được nữa ^^\n\nCòn nếu... Vẫn không thể tiếp tục cùng nhau nữa... Cả hai người hãy thả cảm xúc vào tin nhắn này nhé !`, threadID, (error, info) => {
          global.Seiko.onReaction.push({ name: this.config.name, messageID: info.messageID, userInfo: userInfo, userMates: userMates, turn: 'breakup', user_1: { ID: senderID, accept: false }, user_2: { ID: userInfo.data.dating.mates, accept: false } })
            }, messageID);
        case "info":
        case "-i":
            var userInfo = await Users.getData(senderID);
            if (!userInfo.data.dating || userInfo.data.dating && userInfo.data.dating.status == false) return api.sendMessage(`Bạn F.A sml ra mà xem info cái gì vậy hả ?`, threadID, messageID);
            var infoMates = await Users.getData(userInfo.data.dating.mates);
            var fullTime = userInfo.data.dating.time.fullTime;
            fullTime = fullTime.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/);
            fullTime = fullTime[0].replace(/\//g, " ").split(' ');
            var date = fullTime[0], month = fullTime[1] - 1, year = fullTime[2];
            var dateNow = global.Seiko.getTime('date'), monthNow = global.Seiko.getTime('month') - 1, yearNow = global.Seiko.getTime('year');
            var date1 = new Date(year, month, date);
            var date2 = new Date(yearNow, monthNow, dateNow);
            var msg = `💓== [ Been Together ]==💓\n\n` +
            `» ❤️ Tên của bạn: ${userInfo.name}\n` +
            `» 🤍 Tên của người ấy: ${infoMates.name}\n` +
            `» 💌 Hẹn hò vào lúc: \n${userInfo.data.dating.time.fullTime}\n` +
            `» 📆 Yêu nhau: ${parseInt((date2 - date1) / 86400000)} ngày\n`
            return api.sendMessage({ body: msg, attachment: await this.canvas(senderID, userInfo.data.dating.mates)}, threadID, messageID);
        default:
            return api.sendMessage(`Bạn cần nhập giới tính của người muốn Dating [nam/nữ]`, threadID, messageID);
    }
    var { money } = await Currencies.getData(senderID);
    if (money < 2000) return api.sendMessage(`Bạn cần 2000$ cho một cái dating với một người 💸`, threadID, messageID);
    return api.sendMessage(`Bạn sẽ bị trừ 2000$ 𝐁𝐚̣𝐧 𝐬𝐞̃ 𝐛𝐢̣ 𝐭𝐫𝐮̛̀ 𝟐𝟎𝟎𝟎 𝐕𝐍𝐃 tiền phí mai mối\nSố tiền này sẽ không hoàn trả nếu 1 trong 1 người không chấp nhận tiền vào trạng thái Dating\n\nThả cảm xúc vào tin nhắn này nếu chấp nhận tìm kiếm một người.`, threadID, (error, info) => {
        global.Seiko.onReaction.push({ name: this.config.name, messageID: info.messageID, senderID: senderID, senderInfo: senderInfo, type: type, coin: money, turn: 'match' })
    }, messageID);
}
this.circle = async (image) => {
  const jimp = require('jimp')
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}
this.canvas = async function (idOne, idTwo) {
    const fs = require('fs');
    const axios = require('axios');
    const { loadImage, createCanvas } = require("canvas");
    let path = __dirname + "/cache/ghep.png";
    let pathAvata = __dirname + `/cache/avtghep2.png`;
    let pathAvataa = __dirname + `/cache/avtghep.png`;
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${idOne}/picture?height=250&width=250&access_token=1073911769817594|aa417da57f9e260d1ac1ec4530b417de`, { responseType: 'arraybuffer' })).data;
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${idTwo}/picture?height=250&width=250&access_token=1073911769817594|aa417da57f9e260d1ac1ec4530b417de`, { responseType: 'arraybuffer' })).data;
    let bg = ( await axios.get(`https://i.imgur.com/dfuCwFS.jpg`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvata, Buffer.from(getAvatarOne, 'utf-8'));
    fs.writeFileSync(pathAvataa, Buffer.from(getAvatarTwo, 'utf-8'));
    fs.writeFileSync(path, Buffer.from(bg, "utf-8"));
    avataruser = await this.circle(pathAvata);
    avataruser2 = await this.circle(pathAvataa);
    let imgB = await loadImage(path);
    let baseAvata = await loadImage(avataruser);
    let baseAvataa = await loadImage(avataruser2);
    let canvas = createCanvas(imgB.width, imgB.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(imgB, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvata, 82, 95, 129, 129);
    ctx.drawImage(baseAvataa, 443, 95, 129, 129);
    ctx.beginPath();
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(path, imageBuffer);
    return fs.createReadStream(path)
};