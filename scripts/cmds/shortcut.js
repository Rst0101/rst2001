this.config = {
	name: "shortcut",
	version: "1.1.0",
	role: 0,
	author: "Niiozic",
	info: "dùng -shortcut tag để thêm câu trả lời khi có người tag",
	Category: "Box chat",
        guides: "[all/delete/empty/tag]",
	cd: 5,
        images: []
};
let format_attachment = type=>({ photo: 'png', video: 'mp4', audio: 'mp3', animated_image: 'gif' })[type] || 'bin';
async function stream_url(url) {
    return require('axios')({
         url: url,
         responseType: 'stream',
   }).then(_ => _.data);
};
this.onLoad = function () {
    const { existsSync, writeFileSync, mkdirSync, readFileSync } = require("fs");
    const { resolve } = require("path");    
    const path = resolve(__dirname, '..', 'events', "shortcut", "shortcutdata.json");
    const pathGif = resolve(__dirname, '..', 'events', "shortcut", "shortcut");
    if (!global.moduleData.shortcut) global.moduleData.shortcut = new Map();
    if (!existsSync(path)) {
        const dirPath = resolve(__dirname, '..', 'events', "shortcut");
        if (!existsSync(dirPath)) {
            mkdirSync(dirPath, { recursive: true });
        }
        writeFileSync(path, JSON.stringify([]), "utf-8");
    }
    if (!existsSync(pathGif)) {
        mkdirSync(pathGif, { recursive: true });
    }
    const data = JSON.parse(readFileSync(path, "utf-8"));
    for (const threadData of data) {
        global.moduleData.shortcut.set(threadData.threadID, threadData.shortcuts);
    }
    return;
}
this.onEvent = async function ({ event, api, Users }) {
    if (event.senderID == api.getCurrentUserID()) return;
    const { threadID, messageID, body, senderID, mentions: Mentions ={}} = event;
    if (!global.moduleData.shortcut) global.moduleData.shortcut = new Map();
    if (!global.moduleData.shortcut.has(threadID)) return;
    let mentions = Object.keys(Mentions);
    const data = global.moduleData.shortcut.get(threadID);
    if (!body) return;
    if ((dataThread = mentions.length > 0?data.find(item=>typeof item.tag_id == 'string' && mentions.includes(item.tag_id)) :false )||( dataThread = data.find(item => (item.input||'').toLowerCase() == body.toLowerCase()))) {
    const { resolve } = require("path");
    const { existsSync, createReadStream } = require("fs-extra");
    var object, output;
    var moment = require("moment-timezone");
    var time = moment.tz("Asia/Ho_Chi_Minh").format('HH:mm:ss | DD/MM/YYYY');
    var output = dataThread.output;
     if (/\{name}/g.test(output)) {
         const name = global.data.userName.get(senderID) || await Users.getNameUser(senderID);
         output = output.replace(/\{name}/g, name).replace(/\{time}/g, time);
        }        
        if (dataThread.uri) object = { body: output, attachment: await stream_url(dataThread.uri)}
        else object = { body: output };        
        return api.sendMessage(object, threadID, messageID);
     }
}

this.onReply = async function ({ event = {}, api, onReply }) {
    if (onReply.author != event.senderID) return;
    const { readFileSync, writeFileSync, unlinkSync } = require("fs-extra");
    const axios = require('axios');
 try {
    const { resolve } = require("path");
    const { threadID, messageID, senderID, body } = event;
    const name = this.config.name;
    const path = resolve(__dirname, '..', 'events', "shortcut", "shortcutdata.json");
    switch (onReply.type) {
        case "requireInput": {
            if (body.length == 0) return api.sendMessage("❎ Câu trả lời không được để trống", threadID, messageID);
            const data = global.moduleData.shortcut.get(threadID) || [];
            if (data.some(item => item.input == body)) return api.sendMessage("❎ Input đã tồn tại từ trước", threadID, messageID);
            api.unsendMessage(onReply.messageID);
            return api.sendMessage("📌 Reply tin nhắn này để nhập câu trả lời khi sử dụng từ khóa", threadID, function (error, info) {
                return global.Seiko.onReply.push({
                    type: "requireOutput",
                    name,
                    author: senderID,
                    messageID: info.messageID,
                    input: body
                });
            }, messageID);
        }
        case "requireOutput": {
            if (body.length == 0) return api.sendMessage("❎ Câu trả lời không được để trống", threadID, messageID);
            api.unsendMessage(onReply.messageID);
            return api.sendMessage("📌 Reply tin nhắn này bằng tệp video/ảnh/mp3/gif hoặc nếu không cần bạn có thể reply tin nhắn này và nhập 's'", threadID, function (error, info) {
                return global.Seiko.onReply.push({
                    type: "requireGif",
                    name,
                    author: senderID,
                    messageID: info.messageID,
                    input: onReply.input,
                    output: body,
                    input_type: onReply.input_type,
                    tag_id: onReply.tag_id,
                });
            }, messageID);
        }
    case "requireGif": {
    let id = global.tools.randomString(10);
    let uri;
    if ((event.attachments || []).length > 0) {
        try {
            const atm_0 = event.attachments[0];
            id = id + '.' + format_attachment(atm_0.type);
            const pathGif = resolve(__dirname, '..', 'events', "shortcut", "shortcut", id);
            const res = await global.api.catbox(atm_0.url);
            uri = res;
        } catch (e) {
            console.log(e);
            return api.sendMessage("⚠️ Không thể tải file vì url không tồn tại hoặc bot đã xảy ra vấn đề về mạng!", threadID, messageID);
        }
    }
    const readData = readFileSync(path, "utf-8");
    var data = JSON.parse(readData);
    var dataThread = data.find(item => item.threadID == threadID) || { threadID, shortcuts: [] };
    var dataGlobal = global.moduleData.shortcut.get(threadID) || [];
    const object = { id, input: onReply.input, output: onReply.output, uri, input_type: onReply.input_type, tag_id: onReply.tag_id };
    dataThread.shortcuts.push(object);
    dataGlobal.push(object);
    if (!data.some(item => item.threadID == threadID)) {
        data.push(dataThread);
    } else {
        const index = data.indexOf(data.find(item => item.threadID == threadID));
        data[index] = dataThread;
    }
    global.moduleData.shortcut.set(threadID, dataGlobal);
    writeFileSync(path, JSON.stringify(data, null, 4), "utf-8");
    api.unsendMessage(onReply.messageID);
    return api.sendMessage(`📝 Đã thêm thành công shortcut mới, dưới đây là phần tổng quát:\n\n- ID: ${id}\n- Input: ${onReply.input}\n- Type: ${onReply.input_type || 'text'}\n- Output: ${onReply.output}`, threadID, messageID);
    } 
    case "delShortcut": {
        const splitBody = event.body
        const input = splitBody.match(/\d+/g).map(Number);
	const readData = readFileSync(path, "utf-8");
        var data = JSON.parse(readData);
        var dataThread = data.find(item => item.threadID == threadID);
	var inputDel = [], nums = 1, stt = 1;
        for(let num of input) {
        const index = num - (nums++)
        var dataGlobal = global.moduleData.shortcut.get(threadID) || [];
        const dataDel = dataThread.shortcuts[index]
	inputDel.push(`${num}. ${dataDel.input||`@{${global.data.userName.get(dataDel.tag_id)}}`}`);
        if(dataDel.id.includes('.')) {};
        dataThread.shortcuts = dataThread.shortcuts.filter(item => item.output !== dataDel.output)
        dataGlobal = dataGlobal.filter(item => item.output !== dataDel.output)
        global.moduleData.shortcut.set(threadID, dataGlobal);
        }
	writeFileSync(path, JSON.stringify(data, null, 4), "utf-8");
        return api.sendMessage('✅ Đã xóa thành công\n\n' + inputDel.join('\n'),threadID)
      }
    }
  } catch(e) {
    console.log(e)
  }
}

this.onRun = function ({ event, api, args }) {
  try{
    const { readFileSync, writeFileSync, existsSync } = require("fs-extra");
    const { resolve } = require("path");
    const { threadID, messageID, senderID, mentions = {} } = event;
    const name = this.config.name;
    const path = resolve(__dirname, '..', 'events', "shortcut", "shortcutdata.json");
    switch (args[0]) {
        case "remove":
        case "delete":
        case "del":
        case "-d": {
            const readData = readFileSync(path, "utf-8");
            var data = JSON.parse(readData);
            const indexData = data.findIndex(item => item.threadID == threadID);
            if (indexData == -1) return api.sendMessage("❎ hiện tại nhóm của bạn chưa có shortcut nào được set", threadID, messageID);
            var dataThread = data.find(item => item.threadID == threadID) || { threadID, shortcuts: [] };
            var dataGlobal = global.moduleData.shortcut.get(threadID) || [];
            var indexNeedRemove;
            if (dataThread.shortcuts.length == 0) return api.sendMessage("❎ hiện tại nhóm của bạn chưa có shortcut nào được set", threadID, messageID);
            let rm = args.slice(1).map($=>+($-1)).filter(isFinite);          
            dataThread.shortcuts = dataThread.shortcuts.filter(($,i)=>!rm.includes(i));
            dataGlobal = dataGlobal.filter(($,i)=>!rm.includes(i));
            global.moduleData.shortcut.set(threadID, dataGlobal);
            data[indexData] = dataThread;
            writeFileSync(path, JSON.stringify(data, null, 4), "utf-8");
            return api.sendMessage("✅ Đã xóa thành công\n\n", threadID, messageID);
        }
        case "list":
        case "all":
        case "-a": {
            const data = global.moduleData.shortcut.get(threadID) || [];
            var array = [];
            if (data.length == 0) return api.sendMessage("❎ hiện tại nhóm của bạn chưa có shortcut nào được set", threadID, messageID);
            else {
                var n = 1;
                for (const single of data) {
                    array.push(`${n++}. ${single.uri ? "yes" : "no"} • ${single.input_type == 'tag' ? `@{${global.data.userName.get(single.tag_id)}}`: single.input} -> ${single.output}`);
                }
                return api.sendMessage(`📝 Dưới đây là toàn bộ shortcut nhóm có:\n\n${array.join("\n")}\n\n'yes' là có tệp gửi kèm\n'no' là không có tệp gửi kèm\n\nReply (phản hồi) theo stt để xóa shortcut`, threadID, function (error, info) {
                 global.Seiko.onReply.push({
                    type: "delShortcut",
                    name,
                    author: senderID,
                    messageID: info.messageID
                });
            });
            }
        }
        case 'tag': {
            let tag_id = Object.keys(mentions)[0] || senderID;            
            const data = global.moduleData.shortcut.get(threadID) || [];
            if (data.some(item => item.tag_id == tag_id)) return api.sendMessage("❎ tag đã tồn tại từ trước", threadID, messageID);          
            api.sendMessage("📌 Reply tin nhắn này để nhập câu trả lời khi được tag", threadID, function (error, info) {
                 global.Seiko.onReply.push({
                    type: "requireOutput",
                    name,
                    author: senderID,
                    messageID: info.messageID,
                    input_type: 'tag',
                    tag_id,
                 });
              }, messageID);
          };
          break;
        default: {
            return api.sendMessage("📌 Reply tin nhắn này để nhập từ khóa cho shortcut", threadID, function (error, info) {
                return global.Seiko.onReply.push({
                    type: "requireInput",
                    name,
                    author: senderID,
                    messageID: info.messageID
                });
            }, messageID);
        }
    }
  } catch(e) {
    console.log(e)
   }
}