this.config = {
 name: "rank",
 aliases: ["rankcard"],
 version: "1.2.9",
 role: 0,
 author: "CataliCS",
 info: "Lấy rank hiện tại của bạn trên hệ thống bot kèm khung theo level của bạn, remake rank_card from canvacord",
 Category: "Admin",
 guides: "[]",
 cd: 5,
 hasPrefix: true,
 images: [],
};
this.makeRankCard = async (data) => {    
    const fs = require("fs-extra");
    const path = require("path");
	const Canvas = require("canvas");
	const request = require("node-superfetch");
	const __root = path.resolve(__dirname, "cache");
	const PI = Math.PI;
    const { id, name, rank, level, expCurrent, expNextLevel } = data;
	Canvas.registerFont(__root + "/regular-font.ttf", {
		family: "Manrope",
		weight: "regular",
		style: "normal"
	});
	Canvas.registerFont(__root + "/bold-font.ttf", {
		family: "Manrope",
		weight: "bold",
		style: "normal"
	});
	const pathCustom = path.resolve(__dirname, "cache", "customrank");
	var customDir = fs.readdirSync(pathCustom);
	var dirImage = __root + "/rankcard2.png";
	customDir = customDir.map(item => item.replace(/\.png/g, ""));
	for (singleLimit of customDir) {
		var limitRate = false;
		const split = singleLimit.split(/-/g);
		var min = parseInt(split[0]), max = parseInt((split[1]) ? split[1] : min);	
		for (; min <= max; min++) {
			if (level == min) {
				limitRate = true;
				break;
			}
		}
		if (limitRate == true) {
			dirImage = pathCustom + `/${singleLimit}.png`;
			break;
		}
	}
	let rankCard = await Canvas.loadImage(dirImage);
	const pathImg = __root + `/rank_${id}.png`;	
	var expWidth = (expCurrent * 615) / expNextLevel;
	if (expWidth > 615 - 18.5) expWidth = 615 - 18.5;	
	let avatar = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
	avatar = await this.circle(avatar.body);
	const canvas = Canvas.createCanvas(934, 282);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(rankCard, 0, 0, canvas.width, canvas.height);
	ctx.drawImage(await Canvas.loadImage(avatar), 45, 50, 180, 180);
	ctx.font = `bold 36px Manrope`;
	ctx.fillStyle = "#FFFF00";
	ctx.textAlign = "start";
	ctx.fillText(name, 270, 164);
	ctx.font = `36px Manrope`;
	ctx.fillStyle = "#FF66FF";
	ctx.textAlign = "center";
	ctx.font = `bold 32px Manrope`;
	ctx.fillStyle = "#00FF00";
	ctx.textAlign = "end";
	ctx.fillText(level, 934 - 55, 82);
	ctx.fillStyle = "#EE0000";
	ctx.fillText("Lv.", 934 - 55 - ctx.measureText(level).width - 10, 82);
	ctx.font = `bold 32px Manrope`;
	ctx.fillStyle = "#3399CC";
	ctx.textAlign = "end";
	ctx.fillText(rank, 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 25, 82);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText("#", 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 16 - ctx.measureText(rank).width - 16, 82);
	ctx.font = `bold 26px Manrope`;
	ctx.fillStyle = "#FF99FF";
	ctx.textAlign = "start";
	ctx.fillText("/ " + expNextLevel, 710 + ctx.measureText(expCurrent).width + 10, 164);
	ctx.fillStyle = "#33FFFF";
	ctx.fillText(expCurrent, 710, 164);
	ctx.beginPath();
	ctx.fillStyle = "#4283FF";
	ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * PI, 0.5 * PI, true);
	ctx.fill();
	ctx.fillRect(257 + 18.5, 147.5 + 36.25, expWidth, 37.5);
	ctx.arc(257 + 18.5 + expWidth, 147.5 + 18.5 + 36.25, 18.75, 1.5 * PI, 0.5 * PI, false);
	ctx.fill();
	const imageBuffer = canvas.toBuffer();
	fs.writeFileSync(pathImg, imageBuffer);
	return pathImg;
}
this.circle = async (image) => {
    const jimp = require("jimp");
	image = await jimp.read(image);
	image.circle();
	return await image.getBufferAsync("image/png");
}
this.expToLevel = (point) => {
	if (point < 0) return 0;
	return Math.floor((Math.sqrt(1 + (4 * point) / 3) + 1) / 2);
}
this.levelToExp = (level) => {
	if (level <= 0) return 0;
	return 3 * level * (level - 1);
}
this.getInfo = async (uid, Currencies) => {
	let point = (await Currencies.getData(uid)).exp;
	const level = this.expToLevel(point);
	const expCurrent = point - this.levelToExp(level);
	const expNextLevel = this.levelToExp(level + 1) - this.levelToExp(level);
	return { level, expCurrent, expNextLevel };
}
this.onLoad = async function () {
    const { resolve } = require("path");
    const { existsSync, mkdirSync } = require("fs-extra");
    const { downloadfile } = global.utils;
	const path = resolve(__dirname, "cache", "customrank");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    if (!existsSync(resolve(__dirname, 'cache', 'regular-font.ttf'))) await downloadfile("https://github.com/kenyrm2250/font/blob/main/Canterbury.ttf?raw=true", resolve(__dirname, 'cache', 'regular-font.ttf'));
	if (!existsSync(resolve(__dirname, 'cache', 'bold-font.ttf'))) await downloadfile("https://github.com/kenyrm2250/font/blob/main/AmericanCaptain-MdEY.ttf?raw=true", resolve(__dirname, 'cache', 'bold-font.ttf'));
	if (!existsSync(resolve(__dirname, 'cache', 'rankcard2.png'))) await downloadfile("https://files.catbox.moe/6bam6e.png", resolve(__dirname, 'cache', 'rankcard2.png'));
}
this.onRun = async ({ event, api, args, Currencies, Users }) => {
	const fs = require("fs-extra");	
	let dataAll = (await Currencies.getAll(["userID", "exp"]));
	const mention = Object.keys(event.mentions);
	dataAll.sort((a, b) => {
		if (a.exp > b.exp) return -1;
		if (a.exp < b.exp) return 1;
	});
	if (args.length == 0) {
		const rank = dataAll.findIndex(item => parseInt(item.userID) == parseInt(event.senderID)) + 1;
		const name = global.data.userName.get(event.senderID) || await Users.getNameUser(event.senderID);
		if (rank == 0) return api.sendMessage("❎ Bạn hiện không có trong cơ sở dữ liệu nên không thể thấy thứ hạng của mình, vui lòng thử lại sau 5 giây", event.threadID, event.messageID);
		const point = await this.getInfo(event.senderID, Currencies);
		const timeStart = Date.now();
		let pathRankCard = await this.makeRankCard({ id: event.senderID, name, rank, ...point })
		return api.sendMessage({body: `👑 Tên: ${name}\n🏆 Top: ${rank}`, attachment: fs.createReadStream(pathRankCard, {'highWaterMark': 128 * 1024}) }, event.threadID, () => fs.unlinkSync(pathRankCard), event.messageID);
	}
	if (mention.length == 1) {
		const rank = dataAll.findIndex(item => parseInt(item.userID) == parseInt(mention[0])) + 1;
		const name = global.data.userName.get(mention[0]) || await Users.getNameUser(mention[0]);
		if (rank == 0) return api.sendMessage("❎ Bạn hiện không có trong cơ sở dữ liệu nên không thể thấy thứ hạng của mình, vui lòng thử lại sau 5 giây", event.threadID, event.messageID);
		let point = await this.getInfo(mention[0], Currencies);
		let pathRankCard = await this.makeRankCard({ id: mention[0], name, rank, ...point })
		return api.sendMessage({ attachment: fs.createReadStream(pathRankCard) }, event.threadID, () => fs.unlinkSync(pathRankCard), event.messageID);
	}
	if (mention.length > 1) {
		for (const userID of mention) {
			const rank = dataAll.findIndex(item => parseInt(item.userID) == parseInt(userID)) + 1;
			const name = global.data.userName.get(userID) || await Users.getNameUser(userID);
			if (rank == 0) return api.sendMessage("❎ Bạn hiện không có trong cơ sở dữ liệu nên không thể thấy thứ hạng của mình, vui lòng thử lại sau 5 giây", event.threadID, event.messageID);
			let point = await this.getInfo(userID, Currencies);
			let pathRankCard = await this.makeRankCard({ id: userID, name, rank, ...point })
			return api.sendMessage({ attachment: fs.createReadStream(pathRankCard) }, event.threadID, () => fs.unlinkSync(pathRankCard), event.messageID);
		}
	}
}