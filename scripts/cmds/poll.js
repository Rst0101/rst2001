this.config = {
 name: "poll",
 aliases: ["poll"],
 version: "1.2.9",
 role: 1,
 author: "DongDev",
 info: "Tạo bình chọn trong nhóm",
 Category: "Quản trị viên",
 guides: "[]",
 cd: 20,
 hasPrefix: true,
 images: [],
};
this.onReply = async ({ api, event, onReply }) => {
    const { threadID, messageID, senderID, body } = event;
    if (onReply.content.id !== senderID) return;
    const input = body.trim();
    const sendC = (msg, step, content) => {
        api.sendMessage(msg, threadID, (err, info) => {
            global.Seiko.onReply.splice(global.Seiko.onReply.indexOf(onReply), 1);
            api.unsendMessage(onReply.messageID);
            global.Seiko.onReply.push({
                step: step,
                name: this.config.name,
                messageID: info.messageID,
                content: content
            });
        }, messageID);
    };
    switch (onReply.step) {
        case 1:
            onReply.content.title = input;
            sendC("⏩ Reply tin nhắn này để nhập các lựa chọn (có thể tạo nhiều lựa chọn, cách nhau bởi dấu ' | ')!", 2, onReply.content);
            break;
        case 2:
            onReply.content.options = input.split(" | ");
            api.sendMessage("🔄 Đang tạo bình chọn!", threadID, async (err, info) => {
                global.Seiko.onReply.splice(global.Seiko.onReply.indexOf(onReply), 1);
                api.unsendMessage(onReply.messageID);
                await api.createPollMqtt(onReply.content.title, onReply.content.options, threadID);
                api.unsendMessage(info.messageID);
            }, messageID);
            break;
    }
};
this.onRun = async ({ api, event }) => {
    api.sendMessage("⏩ Reply tin nhắn này để nhập tiêu đề cho bình chọn!", event.threadID, (err, info) => {
        global.Seiko.onReply.push({
            step: 1,
            name: this.config.name,
            messageID: info.messageID,
            content: {
                id: event.senderID,
                title: "",
                options: []
            }
        });
    }, event.messageID);
};