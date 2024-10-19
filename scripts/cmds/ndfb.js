this.config = {
	name: "ndfb",
    aliases: ["ndfb"],
	version: "1.0.0",
	role: 1,
	credits: "ProCoderMew",
	info: "Lọc người dùng Facebook",
	Category: "Box chat",
	guides: "",
	cd: 20,
    hasPrefix: true,
    images: [],
};
this.onRun = async function({ api, event }) {
    var { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);    
    var success = 0, fail = 0;
    var arr = [];
    for (const e of userInfo) {
        if (e.gender == undefined) {
            arr.push(e.id);
        }
    };
    adminIDs = adminIDs.map(e => e.id).some(e => e == api.getCurrentUserID());
    if (arr.length == 0) {
        return api.sendMessage("🔎 Nhóm không có người dùng fb", event.threadID, event.messageID);
    } else {
        api.sendMessage(`🔎 Có ${arr.length} người dùng fb`, event.threadID, function () {
            if (!adminIDs) {
                api.sendMessage("❎ Vui lòng thêm bot làm qtv rồi thử lại", event.threadID);
            } else {
                api.sendMessage("🔄 Bắt đầu lọc...", event.threadID, async function() {
                    for (const e of arr) {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            await api.removeUserFromGroup(parseInt(e), event.threadID);   
                            success++;
                        }
                        catch {
                            fail++;
                        }
                    }                  
                    api.sendMessage(`☑️ Lọc thành công ${success} người dùng fb`, event.threadID, function() {
                        if (fail != 0) return api.sendMessage(`❎ Lọc thất bại ${fail} người dùng fb`, event.threadID);
                    });
                })
            }
        })
    }
}