this.config = {
    name: "dịch",
    aliases: ["trans"],
    version: "1.0.1",
    role: 0,
    author: "Niiozic",
    info: "Dịch văn bản",
    Category: "Tiện ích",
    guides: "[en/ko/ja/vi] [Text]",
    cd: 5,
    hasPrefix: false,
    images: []
};
this.onRun = async ({ api, event, args }) => {
	const request = require("request");
	var content = args.join(" ");
	if (content.length == 0 && event.type != "message_reply") return global.utils.throwError(this.config.name, event.threadID,event.messageID);
	var translateThis = content.slice(0, content.indexOf("->"));
	var lang = content.substring(content.indexOf("->") + 4);
	if (event.type == "message_reply") {
		translateThis = event.messageReply.body
		if (content.indexOf("->") !== -1) lang = content.substring(content.indexOf("->") + 3);
		else lang = 'vi';
	}
	else if (content.indexOf("->") == -1) {
		translateThis = content.slice(0, content.length)
		lang = 'vi';
	}
	return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), (err, response, body) => {
		if (err) return api.sendMessage("⚠️ Đã có lỗi xảy ra!", event.threadID, event.messageID);
		var retrieve = JSON.parse(body);
		var text = '';
		retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
		var fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0]
		api.sendMessage(`🔄 Bản dịch: \n\n${text}\n\n✏️ Dịch từ ${fromLang} sang ${lang}`, event.threadID, event.messageID);
	});
}