this.config = {
	name: "ping",
	aliases: ["ping"],
	version: "1.0.5",
	role: 1,
	credits: "Mirai Team",
	info: "tag toàn bộ thành viên",
	Category: "Quản trị viên",
	guides: "[Text]",
	cd: 0,
	hasPrefix: true,
	images: []
};
this.onRun = async function({ api, event, args }) {
	try {
		const botID = api.getCurrentUserID();
		var listAFK, listUserID;
		global.moduleData["afk"] && global.moduleData["afk"].afkList ? listAFK = Object.keys(global.moduleData["afk"].afkList || []) : listAFK = []; 
		listUserID = event.participantIDs.filter(ID => ID != botID && ID != event.senderID);
		listUserID = listUserID.filter(item => !listAFK.includes(item));
		var body = (args.length != 0) ? args.join(" ") : "Lên tương tác đi kìa 😡", mentions = [], index = 0;
		for(const idUser of listUserID) {
			body = "‎" + body;
			mentions.push({ id: idUser, tag: "‎", fromIndex: index - 1 });
			index -= 1;
		}
		return api.sendMessage({ body, mentions }, event.threadID, event.messageID);
	} catch (e) { return console.log(e)}}