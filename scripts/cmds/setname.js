this.config = {
	name: "setname",
        aliases: ["setn"],
	version: "2.0.0",
	role: 0,
	author: "TrúcCute mod by Niio-team (Cthinh)",
	info: "Đổi biệt danh trong nhóm của bạn hoặc của người bạn tag",
	Category: "Nhóm",
	guides: "trống/tag/check/all/del/call + name",
	cd: 5,
        hasPrefix: true,
        images: [],
};
this.onRun = async ({ api, event, args, Users }) => {
	let { threadID, messageReply, senderID, mentions, type, participantIDs } = event;
	switch(args[0]){
        case 'call':
            case 'Call': {
                const dataThread = (await Threads.getData(threadID)).threadInfo;
                if (!dataThread.adminIDs.some(item => item.id === userID)) return api.sendMessage('⚠️ Bạn không đủ quyền hạn', threadID);
                const dataNickName = (await Threads.getData(threadID)).threadInfo.nicknames;
                const objKeys = Object.keys(dataNickName);
                const notFoundIds = participantIDs.filter(id => !objKeys.includes(id));
                const mentions = [];
                
                let tag = '';
                for (let i = 0; i < notFoundIds.length; i++) {
                    const id = notFoundIds[i];
                    const name = await Users.getNameUser(id);
                    mentions.push({ tag: name, id });
                    
                    tag += `${i + 1}. @${name}\n`;
                }
            
                const bd = '📣 Vui lòng setname để mọi người nhận biết bạn dễ dàng hơn';
                
                const message = {
                    body: `${bd}\n\n${tag}`,
                    mentions: mentions
                };
                api.sendMessage(message, threadID);
                return;
            }                          
                       
		case 'del':
		case 'Del': {
			const threadInfo = (await Threads.getData(threadID)).threadInfo;
			if (!threadInfo.adminIDs.some(admin => admin.id === senderID)) {
				return api.sendMessage(`⚠️ Chỉ quản trị viên mới có thể sử dụng`, threadID);
			}
			const dataNickName = threadInfo.nicknames
			var dataNotNN = []
			const objKeys = Object.keys(dataNickName);
			const notFoundIds = participantIDs.filter(id => !objKeys.includes(id));
			await notFoundIds.map(async (id)=> {
				try{
					api.removeUserFromGroup(id, threadID)
				}catch(e){
					console.log(e)
				}
			});
			return api.sendMessage(`✅ Đã xóa thành công những thành viên không setname`,threadID)
		}
		case 'check':
		case 'Check': {
			const dataNickName = (await Threads.getData(threadID)).threadInfo.nicknames
			var dataNotNN = []
			const objKeys = Object.keys(dataNickName);
			const notFoundIds = participantIDs.filter(id => !objKeys.includes(id));
			var msg = '📝 Danh sách các người dùng chưa setname\n',
				num = 1;
			await notFoundIds.map(async (id)=> {
				const name = await Users.getNameUser(id)
				msg += `\n${num++}. ${name}`
			});
                msg += `\n\n📌 Thả cảm xúc vào tin nhắn này để kick những người không setname ra khỏi nhóm`
			return api.sendMessage(msg,threadID,(error, info) => {
                global.Seiko.onReaction.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    abc: notFoundIds
                })
            })
		}
		break;
		case 'help':
            return api.sendMessage(
                `1. "setname + name" -> Đổi biệt danh của bạn\n` +
                `2. "setname @tag + name" -> Đổi biệt danh của người dùng được đề cập\n` +
                `3. "setname all + name" -> Đổi biệt danh của tất cả thành viên\n` +
                `4. "setname check" -> Hiển thị danh sách người dùng chưa đặt biệt danh\n` +
                `5. "setname del" -> Xóa người dùng chưa setname (chỉ dành cho quản trị viên)\n` +
                `6. "setname call" -> Yêu cầu người dùng chưa đặt biệt danh đặt biệt danh`, threadID);

		case 'all':
		case 'All': {
			try{
				const name = (event.body).split('all')[1]
				var num = 1;
				for(const i of participantIDs){
					num++
					try{
						api.changeNickname(name, threadID, i)
					}catch(e){
						console.log(num + " " + e)
					}
				}
				return api.sendMessage(`✅ Đã đổi biệt danh thành công cho tất cả thành viên`,threadID)
			}catch(e) {
				return console.log(e,threadID)
			}
		}
		break;
	}
	const delayUnsend = 60;// tính theo giây
    if (type === "message_reply") {
        const name = args.join(' ');
        if (name.length > 25) return api.sendMessage(`Tên như lồn dài vcl, ngắn thôi`,threadID)
        const name2 = await Users.getNameUser(messageReply.senderID);

        api.changeNickname(name, threadID, messageReply.senderID, (err) => {
            if (!err) {
                api.sendMessage(`✅ Đã đổi tên của ${name2} thành ${name || "tên gốc"}`, threadID, (error, info) => {
                    if (!error) {
                        setTimeout(() => {
                            api.unsendMessage(info.messageID);
                        }, delayUnsend * 1000);
                    }
                });
            } else {
                api.sendMessage(`❎ Nhóm chưa tắt liên kết mời!!`, threadID);
            }
        });
    } else {
        const mention = Object.keys(mentions)[0];
        const name2 = await Users.getNameUser(mention || senderID);

        if (args.join().indexOf('@') !== -1) {
            const name = args.join(' ').replace(mentions[mention], '');

            api.changeNickname(name, threadID, mention, (err) => {
                if (!err) {
                    api.sendMessage(`✅ Đã đổi tên của ${name2} thành ${name || "tên gốc"}`, threadID, (error, info) => {
                        if (!error) {
                            setTimeout(() => {
                                api.unsendMessage(info.messageID);
                            }, delayUnsend * 1000);
                        }
                    });
                } else {
                    api.sendMessage(`❎ Nhóm chưa tắt liên kết mời!!`, threadID);
                }
            });
        } else {
            const name = args.join(" ");
            if (name.length > 25) return api.sendMessage(`Tên như lồn dài vcl, ngắn thôi`,threadID)

            api.changeNickname(name, threadID, senderID, (err) => {
                if (!err) {
                    api.sendMessage(`✅ Đã đổi tên của bạn thành ${name || "tên gốc"}`, threadID, (error, info) => {
                        if (!error) {
                            setTimeout(() => {
                                api.unsendMessage(info.messageID);
                            }, delayUnsend * 1000);
                        }
                    });
                } else {
                    api.sendMessage(`❎ Nhóm chưa tắt liên kết mời!!`, threadID);
                }
            });
        }
    }


}
this.onReaction = async function({ api, event, Threads, onReaction, getText }) {
    if (event.userID != onReaction.author) return;
    if (Array.isArray(onReaction.abc) && onReaction.abc.length > 0) {
        let errorMessage = '';
        let successMessage = `✅ Đã xóa thành công ${handleReaction.abc.length} thành viên không set name`;
        let errorOccurred = false;

        for (let i = 0; i < onReaction.abc.length; i++) {
            const userID = onReaction.abc[i];
            try {
                await api.removeUserFromGroup(userID, event.threadID);
            } catch (error) {
                errorOccurred = true;
                errorMessage += `⚠️ Lỗi khi xóa ${userID} từ nhóm`;
            }
        }
        api.sendMessage(errorOccurred ? errorMessage : successMessage, event.threadID);
    } else {
        api.sendMessage(`Không có ai!`, event.threadID);
    }
}