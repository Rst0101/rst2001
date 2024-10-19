this.config = {
 name: "money",
 aliases: ["mon"],
 version: "1.2.9",
 role: 0,
 author: "DongDev",
 info: "Kiểm tra số tiền của bản thân, người được tag, gửi tiền, cộng tiền, set tiền, xóa tiền và reset tiền",
 Category: "Box chat",
 guides: "[Trống|Tag|pay <@tag> <số tiền>|add <số tiền> [@tag]|set <số tiền> [@tag]|clean [@tag]|reset]",
 cd: 5,
 hasPrefix: true,
 images: [],
};
this.onRun = async function({ api, event, args, Currencies, Users, msg, permssion }) {
 const axios = require('axios');
 const { threadID, messageID, senderID } = event;
 const { throwError } = global.utils;
 const mentionID = Object.keys(event.mentions);
 const money = String(args[1]);
 var message = [];
 var error = [];
 try {
   switch (args[0]) {
     case "add": {
     if (permssion < 2) return msg.reply("❎ Bạn không có quyền sử dụng lệnh này");
       if (mentionID.length != 0) {
         for (singleID of mentionID) {
           if (!money || isNaN(money)) return api.sendMessage('❎ Money phải là một số', threadID, messageID);
           try {
             await Currencies.increaseMoney(singleID, money);
             message.push(singleID);
           } catch (e) { error.push(e); console.log(e) };
         }
         return api.sendMessage(`✅ Đã cộng thêm ${formatNumber(money)}$ cho ${message.length} người`, threadID, function() {
           if (error.length != 0) return api.sendMessage(`❎ Không thể cộng thêm tiền cho ${error.length} người`, threadID)
         }, messageID);
       } else {
         if (!money || isNaN(money)) return api.sendMessage('Money phải là một số', threadID, messageID);
         try {
           var uid = event.senderID;
           if (event.type == "message_reply") {
             uid = event.messageReply.senderID;
           } else if (args.length === 3) {
             uid = args[2];
           }
           await Currencies.increaseMoney(uid, String(money));
           message.push(uid);
         } catch (e) { error.push(e) };
         return api.sendMessage(`✅ Đã cộng thêm ${formatNumber(money)}$ cho ${uid !== senderID ? '1 người' : 'bản thân'}`, threadID, function() {
           if (error.length != 0) return api.sendMessage(`❎ Không thể cộng thêm tiền cho ${uid !== senderID ? '1 người' : 'bản thân'}`, threadID)
         }, messageID);
       }
     }
     case 'all': {
     if (permssion < 2) return msg.reply("❎ Bạn không có quyền sử dụng lệnh này");
       const allUserID = event.participantIDs;
       for (const singleUser of allUserID) {
         await Currencies.increaseMoney(singleUser, String(money));
       }
       return api.sendMessage(`✅ Đã cộng thêm ${formatNumber(money)}$ cho toàn bộ thành viên`, event.threadID);
     }
     case "set": {
     if (permssion < 2) return msg.reply("❎ Bạn không có quyền sử dụng lệnh này");
       if (mentionID.length != 0) {
         for (singleID of mentionID) {
           if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
           try {
             await Currencies.setData(singleID, { money });
             message.push(singleID);
           } catch (e) { error.push(e) };
         }
         return api.sendMessage(`✅ Đã set thành công ${formatNumber(money)}$ cho ${message.length} người`, threadID, function() {
           if (error.length != 0) return api.sendMessage(`❎ Không thể set tiền cho ${error.length} người`, threadID)
         }, messageID);
       } else {
         if (!money || isNaN(money)) return throwError(this.config.name, threadID, messageID);
         try {
           var uid = event.senderID;
           if (event.type == "message_reply") {
             uid = event.messageReply.senderID;
           }
           await Currencies.setData(uid, { money });
           message.push(uid);
         } catch (e) { error.push(e) };
         return api.sendMessage(`✅ Đã set thành công ${formatNumber(money)}$ cho ${uid !== senderID ? '1 người' : 'bản thân'}`, threadID, function() {
           if (error.length != 0) return api.sendMessage(`❎ Không thể set tiền cho ${uid !== senderID ? '1 người' : 'bản thân'}`, threadID)
         }, messageID);
       }
     }
     case "clean": {
     if (permssion < 2) return msg.reply("❎ Bạn không có quyền sử dụng lệnh này");
       if (args[1] === 'all') {
         const data = event.participantIDs;
         for (const userID of data) {
           const userData = (await Currencies.getData(userID)).data;
           if (userData !== undefined) {
             userData.money = '0';
             await Currencies.setData(userID, userData);
           }
         }
         return api.sendMessage("✅ Đã xóa thành công toàn bộ tiền của nhóm", event.threadID);
       }
       if (mentionID.length != 0) {
         for (singleID of mentionID) {
           try {
             await Currencies.setData(singleID, { money: 0 });
             message.push(singleID);
           } catch (e) { error.push(e) };
         }
         return api.sendMessage(`✅ Đã xóa thành công toàn bộ tiền của ${message.length} người`, threadID, function() {
           if (error.length != 0) return api.sendMessage(`❎ Không thể xóa toàn bộ tiền của ${error.length} người`, threadID)
         }, messageID);
       } else {
         try {
           var uid = event.senderID;
           if (event.type == "message_reply") {
             uid = event.messageReply.senderID;
           }
           await Currencies.setData(uid, { money: 0 });
           message.push(uid);
         } catch (e) { error.push(e) };
         return api.sendMessage(`✅ Đã xóa thành công tiền của ${uid !== senderID ? '1 người' : 'bản thân'}`, threadID, function() {
           if (error.length != 0) return api.sendMessage(`❎ Không thể xóa tiền của ${uid !== senderID ? '1 người' : 'bản thân'}`, threadID)
         }, messageID);
       }
     }
     case "reset": {
     if (permssion < 3) return msg.reply("❎ Bạn không có quyền sử dụng lệnh này");
       const allUserData = await Currencies.getAll(['userID']);
       for (const userData of allUserData) {
         const userID = userData.userID;
         try {
           await Currencies.setData(userID, { money: 0 });
           message.push(userID);
         } catch (e) { error.push(e) };
       }
       return api.sendMessage(`✅ Đã xóa toàn bộ dữ liệu tiền của ${message.length} người`, threadID, function() {
         if (error.length != 0) return api.sendMessage(`❎ Không thể xóa dữ liệu tiền của ${error.length} người`, threadID)
       }, messageID);
     }
     case "pay": {
       if (mentionID.length != 1) return api.sendMessage("Bạn cần tag một người để gửi tiền.", threadID, messageID);
       const mention = mentionID[0];
       const amount = parseInt(args[2]);
       if (isNaN(amount) || amount <= 0) return api.sendMessage("Số tiền không hợp lệ.", threadID, messageID);
       const senderMoney = (await Currencies.getData(senderID)).money;
       if (senderMoney < amount) return api.sendMessage("Bạn không đủ tiền để thực hiện giao dịch này.", threadID, messageID);
       await Currencies.decreaseMoney(senderID, amount);
       await Currencies.increaseMoney(mention, amount);
       return api.sendMessage(`Bạn đã gửi ${formatNumber(amount)}$ cho ${event.mentions[mention].replace(/\@/g, "")}`, threadID, messageID);
     }
     default: {
       if (args.length === 0) {
         const money = (await Currencies.getData(senderID)).money;
         const moneyFormatted = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
         const name = await Users.getNameUser(senderID);
         return api.sendMessage(`🎫 ${name} hiện có ${moneyFormatted}$`, threadID, messageID);
       } else if (mentionID.length == 1) {
         const mention = mentionID[0];
         let money = (await Currencies.getData(mention)).money;
         money = money || 0;
         const moneyFormatted = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
         return api.sendMessage({ body: `🎫 ${event.mentions[mention].replace(/\@/g, "")} hiện có ${moneyFormatted}$` }, threadID, messageID);
       }
       return global.utils.throwError(this.config.name, threadID, messageID);
     }
   }
 } catch (e) {
   console.log(e);
 }
}
function formatNumber(number) {
 return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}