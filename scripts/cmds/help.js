this.config = {
    name: "help",
    aliases: ["help"],
    version: "1.1.1",
    role: 0,
    author: "DC-Nam mod by Niio-team",
    info: "Xem danh sách lệnh và info",
    Category: "Nhóm",
    guides: "[tên lệnh/all]",
    cd: 5,
    hasPrefix: true,
    images: [],
};
this.onRun = async function({
    api,
    event,
    args
}) {
    const {
        threadID: tid,
        messageID: mid,
        senderID: sid
    } = event;
    const axios = require('axios');
    var type = !args[0] ? "" : args[0].toLowerCase();
    var msg = "";
    const cmds = global.Seiko.commands;
    const TIDdata = global.data.threadData.get(tid) || {};
    const admin = config.ADMINBOT;
    const NameBot = config.BOTNAME;
    const version = config.version;
    var prefix = TIDdata.PREFIX || global.config.PREFIX;
    if (type == "all") {
        const commandsList = Array.from(cmds.values()).map((cmd, index) => {
            return `${index + 1}. ${cmd.config.name}\n📝 Mô tả: ${cmd.config.info}\n\n`;
        }).join('');
        return api.sendMessage(commandsList, tid, mid);
    }
    if (type) {
        const command = Array.from(cmds.values()).find(cmd => cmd.config.name.toLowerCase() === type);
        if (!command) {
            const stringSimilarity = require('string-similarity');
            const commandName = args.shift().toLowerCase() || "";
            const commandValues = cmds['keys']();
            const checker = stringSimilarity.findBestMatch(commandName, commandValues);
            if (checker.bestMatch.rating >= 0.5) command = Seiko.commands.get(checker.bestMatch.target);
            msg = `⚠️ Không tìm thấy lệnh '${type}' trong hệ thống.\n📌 Lệnh gần giống được tìm thấy '${checker.bestMatch.target}'`;
            return api.sendMessage(msg, tid, mid);
        }
        const cmd = command.config;
        msg = `[ HƯỚNG DẪN SỬ DỤNG ]\n\n📜 Tên lệnh: ${cmd.name}\n🕹️ Phiên bản: ${cmd.version}\n🔑 Quyền Hạn: ${TextPr(cmd.role)}\n📝 Mô Tả: ${cmd.info}\n🏘️ Nhóm: ${cmd.Category}\n📌 Cách Dùng: ${cmd.guides}\n⏳ Cooldowns: ${cmd.cd}s`;
        return api.sendMessage(msg, tid, mid);
    } else {
        const commandsArray = Array.from(cmds.values()).map(cmd => cmd.config);
        const array = [];
        commandsArray.forEach(cmd => {
            const { Category, name: nameModule } = cmd;
            const find = array.find(i => i.cmdCategory == Category);
            if (!find) {
                array.push({
                    cmdCategory: Category,
                    nameModule: [nameModule]
                });
            } else {
                find.nameModule.push(nameModule);
            }
        });
        array.sort(S("nameModule"));
        array.forEach(cmd => {
   if (cmd.cmdCategory.toUpperCase() === 'ADMIN' && !global.config.ADMINBOT.includes(sid) && !global.config.NDH.includes(sid)) return
            msg += `[ ${cmd.cmdCategory.toUpperCase()} ]\n📝 Tổng lệnh: ${cmd.nameModule.length} lệnh\n${cmd.nameModule.join(", ")}\n\n`;
        });
        msg += `📝 Tổng số lệnh: ${cmds.size} lệnh\n${prefix}help + tên lệnh để xem chi tiết\n${prefix}help + all để xem tất cả lệnh`;
        return api.sendMessage(msg, tid, mid);
    }
}
function S(k) {
    return function(a, b) {
        let i = 0;
        if (a[k].length > b[k].length) {
            i = 1;
        } else if (a[k].length < b[k].length) {
            i = -1;
        }
        return i * -1;
    }
}
function TextPr(permission) {
    p = permission;
    return p == 0 ? "Thành Viên" : p == 1 ? "Quản Trị Viên" : p = 2 ? "Admin Bot" : "Toàn Quyền";
}