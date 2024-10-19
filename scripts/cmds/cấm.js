this.config = {
 name: "cấm",
 aliases: ["cấm"],
 version: "1.2.9",
 role: 2,
 author: "DC-Nam & mod by DongDev",
 info: "Bật tắt vô hiệu hoá nhóm/lệnh cụ thể",
 Category: "Admin",
 guides: "[cấm + un + tên lệnh] | [cấm + check] | [cấm + cmd + tên lệnh]",
 cd: 5,
 hasPrefix: true,
 images: [],
};
let fs = require('fs');
let path = __dirname + '/../../system/data/disable-command.json';
let data = {};
let save = () => fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
if (!fs.existsSync(path)) save();
data = JSON.parse(fs.readFileSync(path, 'utf-8'));
this.onRun = o => {
    let {
        threadID: tid,
        messageID: mid,
        body,
        senderID: sid
    } = o.event;
    let send = (msg, callback) => o.api.sendMessage(msg, tid, callback, mid);
    let cmds = [...global.Seiko.commands.values()];
    let cmd_names = cmds.map($ => $.config.name);
    if (!data[tid]) data[tid] = { commands: {}, categories: {} };
    let input = body.split(" ");
    let action = input[1];
    switch (action) {
        case 'check': {
            let disabledCommands = Object.keys(data[tid].commands).filter(cmd => data[tid].commands[cmd]);
            let disabledCommandsText = disabledCommands.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n');
            if (disabledCommands.length === 0) {
                return send(`❎ Không có lệnh nào bị cấm`);
            }
            return send(`[ Danh Sách Lệnh Bị Cấm ]\n────────────────\n${disabledCommandsText}\n\n📌 Reply tin nhắn này kèm STT hoặc all để mở cấm lệnh`, (err, res) => {
                res.name = exports.config.name;
                res.disabledCommands = disabledCommands;
                res.o = o;
                res.type = 'command';
                global.Seiko.onReply.push(res);
            });
        }
        case 'un': {
            let cmdName = input.slice(2).join(" ");
            if (cmd_names.includes(cmdName)) {
                data[tid].commands[cmdName] = false;
                save();
                return send(`✅ Đã mở cấm lệnh ${cmdName}`);
            } else {
                return send(`❎ Lệnh "${cmdName}" không tồn tại`);
            }
        }
        case 'cmd': {
            let cmdName = input.slice(2).join(" ");
            if (cmd_names.includes(cmdName)) {
                data[tid].commands[cmdName] = true;
                save();
                return send(`✅ Đã cấm lệnh ${cmdName}`);
            } else {
                return send(`Lệnh "${cmdName}" không tồn tại`);
            }
        }
        default: {
            let cmd_categorys = Object.keys(cmds.reduce((o, $) => (o[$.config.Category] = 0, o), {}));
            send(`[ Cấm Sử Dụng Nhóm Lệnh ]\n────────────────\n${cmd_categorys.map(($, i) => `${i + 1}. ${$}: ${!data[tid].categories[$] ? 'off' : 'on'}`).join('\n')}\n\n📌 Reply tin nhắn này kèm STT để bật tắt vô hiệu hoá nhóm lệnh`, (err, res) => {
                res.name = exports.config.name;
                res.cmd_categorys = cmd_categorys;
                res.cmd_names = cmd_names;
                res.o = o;
                res.type = 'category';
                global.Seiko.onReply.push(res);
            });
        }
    }
};
this.onReply = o => {
    let _ = o.onReply;
    let {
        threadID: tid,
        messageID: mid,
        senderID: sid,
        args
    } = o.event;
    let send = (msg, callback) => o.api.sendMessage(msg, tid, callback, mid);
    if (_.o.event.senderID != sid) return;
    if (_.type === 'category') {
        let indices = args.map(arg => parseInt(arg) - 1);
        if (indices.some(index => isNaN(index) || index < 0 || index >= _.cmd_categorys.length)) {
            return send(`❎ Số thứ tự không hợp lệ`);
        }
        let toggledCategories = [];
        let action;
        indices.forEach(index => {
            let category = _.cmd_categorys[index];
            let status = data[tid].categories[category];
            data[tid].categories[category] = !status;
            toggledCategories.push(category);
            action = !status ? 'bật' : 'tắt';
        });
        send(`✅ Đã ${action} vô hiệu hoá nhóm lệnh: ${toggledCategories.join(', ')}`);
    } else if (_.type === 'command') {
        if (args.includes('all')) {
            let allCommands = _.disabledCommands.slice();
            _.disabledCommands.forEach(command => {
                data[tid].commands[command] = false;
            });
            send(`✅ Đã mở cấm tất cả các lệnh: ${allCommands.join(', ')}`);
        } else {
            let indices = args.map(arg => parseInt(arg) - 1);
            if (indices.some(index => isNaN(index) || index < 0 || index >= _.disabledCommands.length)) {
                return send(`❎ Số thứ tự không hợp lệ`);
            }
            let unbannedCommands = [];
            indices.forEach(index => {
                let command = _.disabledCommands[index];
                data[tid].commands[command] = false;
                unbannedCommands.push(command);
            });
            send(`✅ Đã mở cấm lệnh: ${unbannedCommands.join(', ')}`);
        }
    }
    save();
};