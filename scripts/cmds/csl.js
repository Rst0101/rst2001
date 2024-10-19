this.config = {
	name: "csl",
        aliases: ["console"],
	version: "1.0.0",
	role: 3,
	author: "quất",
	info: "Console bớt nhàm chán hơn",
	Category: "Admin",
	guides: "Dành cho admin",
	cd: 0,
	hasPrefix: true,
        images: [],
};
this.onEvent = async ({ api, event: e, Users }) => {
	var h = require('chalk'), $ = 'Thứ ', d = new Date().getDay(), { type, body: b, senderID: sid, threadID: tid } = e, k = 'không có', tp = e.attachments && e.attachments[0] ? e.attachments[0].type : k, c = (a, b) => h.hex(a)(b), _ = c('#000000', '| ▪ '), n = '\n', gr = e?.participantIDs?.length != 0, nd = '| Nội dung  : ', dk = '| Đính kèm  : ', z = n + _, dz = z + dk, nz = z + nd
	api.markAsReadAll(() => {});
	console.log(`${c(`#FFFFFF`, `■■■■■■■■■■■■■■■■■■■■■■${gr ? ' CHAT TRONG NHÓM ' : '  CHAT RIÊNG TƯ  '}■■■■■■■■■■■■■■■■■■■■■■`)}${c('#FF0000', `${gr ? (z + '| Nhóm      : ' + (await Threads.getData(tid)).threadInfo.name || k) : ''}`) + n +
		_ + c('#FF9900', `| Tên       : ${await Users.getNameUser(sid)}`) + c('#00FFFF', `${type == 'message_unsend' ? nz + 'Gỡ tin nhắn' : b ? nz + b : ''}`) + c('FFCC66', `${tp == 'sticker' ? dz + 'Nhãn dán' : tp == 'audio' ? dz + 'Âm thanh' : tp == 'animated_image' ? dz + 'Gif' : tp == 'video' ? dz + 'Video' : tp == 'photo' ? dz + 'Ảnh' : tp == 'file' ? dz + 'Tệp' : ''}`) + n +
		_ + c('#FFCCFF', `| SenderID  : ${sid}`) + c('#FFFF00', `${tid != sid ? z + '| ThreadID  : ' + tid : ''}`) + n +
		_ + c('#00FF00', `| Thời gian : ${d == 0 ? 'Chủ Nhật' : d == 1 ? $ + 'Hai' : d == 2 ? $ + 'Ba' : d == 3 ? $ + 'Tư' : d == 4 ? $ + 'Năm' : d == 5 ? $ + 'Sáu' : $ + 'Bảy'} ${require("moment-timezone").tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss")}`)}`)
}
this.onRun = () => {};