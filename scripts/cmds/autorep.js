const fs = require('fs-extra');
this.config = {
    name: "autorep",
    aliases: ["autorep"],
    version: "2.3.0",
    role: 0,
    author: "DongDev",
    info: "Tạo autorep cho một tin nhắn",
    Category: "Box chat",
    guides: "[autorep] => [text cần autorep]",
    cd: 5,
    hasPrefix: true,
    images: []
}
const p = __dirname + "/../../system/data/autorep.json";
this.onLoad = () => fs.existsSync(p) || fs.writeFileSync(p, '[]', 'utf-8');
this.onEvent = ({ api, event }) => {
    if (event.type !== "message_unsend" && event.body.length !== -1) {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        const t = data.find(d => d.id === event.threadID)?.shorts.find(s => s.in === event.body)?.out;
        if (t) {
            const r = t.includes(" | ") ? t.split(" | ")[Math.floor(Math.random() * t.split(" | ").length)] : t;
            api.sendMessage(r, event.threadID, event.messageID);
        }
    }
}
this.onRun = ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const cmd = args[0];
    const content = args.slice(1).join(" ").trim();
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    const threadData = data.find(d => d.id === threadID);
    const writeData = () => fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
    switch (cmd) {
        case "del": {
            if (threadData && content) {
                const index = threadData.shorts.findIndex(s => s.in === content);
                if (index !== -1) {
                    threadData.shorts.splice(index, 1);
                    writeData();
                    return api.sendMessage("☑️ Đã xóa autorep thành công!", threadID, messageID);
                }
            }
            return api.sendMessage("❎ Không tìm thấy autorep cần xóa.", threadID, messageID);
        }
        case "clear": {
            if (threadData) {
                api.sendMessage('Phản hồi "yes" để xác nhận.', threadID, (error, info) => {
                    global.Seiko.onReply.push({
                        type: 'clear',
                        name: this.config.name,
                        author: event.senderID,
                        messageID: info.messageID,
                        data: { data, threadID }
                    });
                });
            } else {
                api.sendMessage("❎ Không có autorep nào để xóa.", threadID, messageID);
            }
            break;
        }
        case "show": {
            if (threadData && content) {
                const r = threadData.shorts.find(s => s.in === content);
                return r ? api.sendMessage(`${content} -> ${r.out}`, threadID, messageID) : api.sendMessage("❎ Không tìm thấy autorep với từ khóa đã cho.", threadID, messageID);
            }
            api.sendMessage("❎ Vui lòng cung cấp từ khóa cần xem.", threadID, messageID);
            break;
        }
        case "list": {
            if (threadData && threadData.shorts.length) {
                const msg = threadData.shorts.map((s, i) => `${i + 1}. ${s.in} -> ${s.out}`).join('\n');
                api.sendMessage("📝 Các autorep có trong nhóm:\n" + msg, threadID, (error, info) => {
                    global.Seiko.onReply.push({
                        type: 'list',
                        author: event.senderID,
                        messageID: info.messageID,
                        data: { threadData, data, threadID }
                    });
                });
            } else {
                api.sendMessage("Hiện tại không có autorep nào.", threadID, messageID);
            }
            break;
        }
        case "edit": {
            const [inText, outText] = content.split(" => ").map(s => s.trim());
            if (threadData && inText && outText) {
                const r = threadData.shorts.find(s => s.in === inText);
                if (r) {
                    r.out = outText;
                    writeData();
                    return api.sendMessage("☑️ Chỉnh sửa autorep thành công", threadID, messageID);
                }
            }
            api.sendMessage("❎ Không tìm thấy autorep cần chỉnh sửa.", threadID, messageID);
            break;
        }
        case "count": {
            return api.sendMessage(`Hiện tại có ${threadData ? threadData.shorts.length : 0} autorep trong nhóm.`, threadID, messageID);
        }
        case "help": {
            return api.sendMessage(
                `Các lệnh autorep:\n
                - Thêm autorep: [autorep] => [text cần autorep]
                - Xóa autorep: autorep del [text cần xóa]
                - Hiển thị tất cả autorep trong nhóm: autorep list
                - Xóa tất cả autorep trong nhóm: autorep clear
                - Hiển thị autorep cụ thể: autorep show [text]
                - Chỉnh sửa autorep: autorep edit [input] => [output mới]
                - Đếm số lượng autorep: autorep count
                `,
                threadID,
                messageID
            );
        }
        default: {
    const text = args.slice(0).join(" ").trim();
    const [shortin, shortout] = text.split(" => ").map(s => s.trim());
    if (!shortin || !shortout || shortin === shortout) {
        return api.sendMessage("⚠️ Vui lòng kiểm tra lại input và output.", threadID, messageID);
    }
    if (!data) {
        data = [];
    }
    let threadData = data.find(d => d.id === threadID);
    if (!threadData) {
        threadData = { id: threadID, shorts: [] };
        data.push(threadData);
    }
    if (!threadData.shorts) {
        threadData.shorts = [];
    }
    const existingRep = threadData.shorts.find(s => s.in === shortin);
    if (existingRep) {
        existingRep.out += " | " + shortout;
    } else {
        threadData.shorts.push({ in: shortin, out: shortout });
    }
    writeData();
    return api.sendMessage("✅ Tạo autorep thành công", threadID, messageID);
}
    }
}
this.onReply = ({ api, event, onReply }) => {
    const { type, author, messageID, data } = onReply;
    if (event.senderID !== author) return;
    const { threadData, data: replyData, threadID } = data;
    switch (type) {
        case 'clear': {
            if (event.body.toLowerCase() === "yes") {
                const index = replyData.findIndex(d => d.id === threadID);
                if (index !== -1) {
                    replyData.splice(index, 1);
                    fs.writeFileSync(p, JSON.stringify(replyData, null, 2), "utf-8");
                    api.sendMessage("☑️ Đã xóa tất cả autorep thành công!", threadID, messageID);
                }
            } else {
                api.sendMessage("❎ Hủy bỏ thao tác", threadID, messageID);
            }
            break;
        }
        case 'list': {
            if (event.messageID === messageID) {
                const indices = event.body.trim().split(' ').map(n => parseInt(n) - 1).filter(i => !isNaN(i) && i >= 0 && i < threadData.shorts.length);
                if (indices.length) {
                    indices.sort((a, b) => b - a).forEach(i => threadData.shorts.splice(i, 1));
                    fs.writeFileSync(p, JSON.stringify(replyData, null, 2), "utf-8");
                    api.sendMessage("☑️ Đã xóa autorep thành công!", threadID, messageID);
                } else {
                    api.sendMessage("❎ Không tìm thấy autorep cần xóa.", threadID, messageID);
                }
            }
            break;
        }
    }
}