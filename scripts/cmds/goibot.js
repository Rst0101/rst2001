const fs = global.nodemodule["fs-extra"];
module.exports.config = {
  name: "goibot",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "manhIT",
  description: "goibot",
  commandCategory: "Tiện ích",
  usages: "noprefix",
  cooldowns: 0,
};
module.exports.handleEvent = async({ event, api, Users, Threads }) => {
  var { threadID, messageID, body, senderID } = event;
  const thread = global.data.threadData.get(threadID) || {};
  if (typeof thread["goibot"] !== "undefined" && thread["goibot"] == false) return;

  if (senderID == global.data.botID) return;
   function out(data){
  	api.sendMessage(data, threadID, messageID)
  }
  let name = await Users.getNameUser(event.senderID);
  let dataThread = await Threads.getData(event.threadID);
  let threadInfo = dataThread.threadInfo;
  var idbox = event.threadID;

  var tl = ["Đừng spam tui nha🥺", "Đụng là chạm nhắc tui là yêu tui 🗡️", "Gọi t ít thôi mà", "Đã bảo đừng gọi", "Nói t t ban ráng chịu", "gọi có việc gì không?", "Sử dụng callad để liên lạc với admin!","Có thể bạn chưa biết, admin đẹp trai vc ?","Tôi cute quá à ??","Gọi tôi làm gì đang bận-.-","Rồi biết toi cute r gọi hoài"];
  var rand = tl[Math.floor(Math.random() * tl.length)];

  if ((event.body.toLowerCase() == "bot lồn") || (event.body.toLowerCase() == "bot lon")) {
    return api.sendMessage("à thì em là bot nên em kh có mấy đó ạ", threadID);
  };

  if ((event.body.toLowerCase() == "bot óc chó") || (event.body.toLowerCase() == "bot oc")) {
    return api.sendMessage("tớ vả mồm cậu giờ ", threadID);
  };

  if ((event.body.toLowerCase() == "bot ơi") || (event.body.toLowerCase() == "bot oi")) {
    return api.sendMessage("Đây là tin nhắn tự động 💏\n Bạn đừng lo tôi luôn ở đây với bạn mà🥺", threadID);
  };

  if ((event.body.toLowerCase() == "yêu bot") || (event.body.toLowerCase() == "yeu bot")) {
    return api.sendMessage("Tôi biết bạn yêu tôi mà cảm ơn nhé. Yêu bạn nhất❤", threadID);
  };

  if ((event.body.toLowerCase() == ":))") || (event.body.toLowerCase() == "=))")) {
    return api.sendMessage("Sài icon ít thôi lo mà tương tác với box😡", threadID);
  };
if ((event.body.toLowerCase() == "haha") || (event.body.toLowerCase() == "Haha")) {
    return api.sendMessage("Cười cái gì tương tác với box chưa 😏?", threadID);
    };
  if ((event.body.toLowerCase() == ":v") || (event.body.toLowerCase() == ":3")) {
    return api.sendMessage("Không tương tác bố hôn cho cái chết luôn giờ đó :3 ?", threadID);
  };
  if ((event.body.toLowerCase() == "sad") || (event.body.toLowerCase() == "Sad")) {
    return api.sendMessage("có thể bạn chính là một sad boy/girl🐧", threadID);
  };
  if ((event.body.toLowerCase() == "lô") || (event.body.toLowerCase() == "Lô")) {
    return api.sendMessage("Bạn lô cái gì ?? Tương tác được không mà lô đề ?", threadID);
  };

 if ((event.body.toLowerCase() == "alo") || (event.body.toLowerCase() == "Alo")) {
    return api.sendMessage("Mình đây nè, bạn đã tương tác chưa thế ?", threadID);
  };

  if ((event.body.toLowerCase() == "bsvv nha mn") || (event.body.toLowerCase() == "bsvv nha mn")) {
    return api.sendMessage("chúc bạn một ngày mới tốt lành ❤️", threadID);
  };

  if ((event.body.toLowerCase() == "btvv nha mng") || (event.body.toLowerCase() == "btvv nha mng")) {
    return api.sendMessage("chúc bạn một ngày mới tốt lành ❤️", threadID);
  };

  if ((event.body.toLowerCase() == "hí ae") || (event.body.toLowerCase() == "hi ae")) {
    return api.sendMessage("chúc bạn một ngày mới tốt lành ❤️", threadID);
  };

  if ((event.body.toLowerCase() == "btvv nha mn") || (event.body.toLowerCase() == "btvv nha mn")) {
    return api.sendMessage(" chúc bạn một ngày mới tốt lành ❤️", threadID);
  };

  if ((event.body.toLowerCase() == "chào cậu") || (event.body.toLowerCase() == "chao cau")) {
    return api.sendMessage("Hí chào bạn <3", threadID);
  };

  if ((event.body.toLowerCase() == "cười") || (event.body.toLowerCase() == "cười")) {
    return api.sendMessage("️cừi rớt cục cứk vị giòn tan khó cưỡng: )", threadID);
  };

  if ((event.body.toLowerCase() == "tt đi nào mng") || (event.body.toLowerCase() == "tt di nao mng")) {
    return api.sendMessage("️1 là tương tác, 2 là ăn kick :))))", threadID);
  };

  if ((event.body.toLowerCase() == "tt mng ơi") || (event.body.toLowerCase() == "tt mng oi")) {
    return api.sendMessage("️1 là tương tác, 2 là ăn kick :))))", threadID);
  };

  if ((event.body.toLowerCase() == "nn nha mng") || (event.body.toLowerCase() == "nn nha mng")) {
    return api.sendMessage("️Chúc mọi người mơ siêu đẹp <3", threadID);
  };

  if ((event.body.toLowerCase() == "admin m là ai v bot") || (event.body.toLowerCase() == "admin m la ai v bot")) {
    return api.sendMessage("️Admin tao tên Dương Trúc có gì dùng lệnh .ad để biết thêm chi tiết", threadID);
  };

  if ((event.body.toLowerCase() == "admin m là ai vậy bot") || (event.body.toLowerCase() == "admin m la ai vậy bot")) {
    return api.sendMessage("️Admin tao tên Dương Trúc có gì dùng lệnh .ad để biết thêm chi tiết", threadID);
  };

  if ((event.body.toLowerCase() == "tt đi mn") || (event.body.toLowerCase() == "tt đi mn")) {
    return api.sendMessage("️1 là tương tác, 2 là ăn kick :))))", threadID);
  };

  if ((event.body.toLowerCase() == "flop quá") || (event.body.toLowerCase() == "flop qua")) {
    return api.sendMessage("️1 là tương tác, 2 là ăn kick :))))", threadID);
  };

  if ((event.body.toLowerCase() == "clmm bot") || (event.body.toLowerCase() == "clmm bot")) {
    return api.sendMessage("️Chửi gì đấy con dog :) bố mmày nhịn mày lâu lắm rồi đấy nhá", threadID);
  };

  if ((event.body.toLowerCase() == "bot cc") || (event.body.toLowerCase() == "bot cc")) {
    return api.sendMessage("️Chửi gì đấy con dog :) bố mmày nhịn mày lâu lắm rồi đấy nhá", threadID);
  };

  if ((event.body.toLowerCase() == "cc bot") || (event.body.toLowerCase() == "cc bot")) {
    return api.sendMessage("️Chửi gì đấy con dog :) bố mmày nhịn mày lâu lắm rồi đấy nhá", threadID);
  };

  if ((event.body.toLowerCase() == "bot dthw quá") || (event.body.toLowerCase() == "bot dthw qua")) {
    return api.sendMessage("️dạ quá khen ạ hihi :>", threadID);
  };
  
  if ((event.body.toLowerCase() == "đm bot") || (event.body.toLowerCase() == "dm bot")) {
    return api.sendMessage("️Chửi gì đâý :)", threadID);
  };

  if ((event.body.toLowerCase() == "ko ai thương t hết") || (event.body.toLowerCase() == "ko ai thuong t het")) {
    return api.sendMessage("️Thôi ngoan nào bot thương bạn mà <3 <3 ", threadID);
  };

  if ((event.body.toLowerCase() == "bot có yêu admin bot không") || (event.body.toLowerCase() == "bot co yeu admin bot khong")) {
    return api.sendMessage("Có, yêu chị ấy nhất đừng hòng cướp của tôi", threadID);
  };

  if ((event.body.toLowerCase() == "bot có người yêu chưa") || (event.body.toLowerCase() == "bot co nguoi yeu chua")) {
    return api.sendMessage("Rồi ạ, là cậu đấy <3", threadID);
  };

  if ((event.body.toLowerCase() == "bot im đi") || (event.body.toLowerCase() == "bot im di")) {
    return api.sendMessage("Im cc :>>", threadID);
  };

  if ((event.body.toLowerCase() == "bot cút đi") || (event.body.toLowerCase() == "bot cut di")) {
    return api.sendMessage("Cậu cút trước rồi tớ theo cậu ạ :))))", threadID);
  };

  if ((event.body.toLowerCase() == "bot chửi cái lon gì") || (event.body.toLowerCase() == "bot chui cai lon gi")) {
    return api.sendMessage("Dạ tớ đâu dám chửi ai", threadID);
  };

  if ((event.body.toLowerCase() == "bot có buồn ko") || (event.body.toLowerCase() == "bot co buon ko")) {
    return api.sendMessage("Có mọi người sao bé buồn đc <3 yêu lắm <3", threadID);
  };

  if ((event.body.toLowerCase() == "bot có yêu t ko") || (event.body.toLowerCase() == "bot co yeu t ko")) {
    return api.sendMessage("Dạ có yêu cậu và mọi người nhiều lắm", threadID);
  };

  if ((event.body.toLowerCase() == "bot đi ngủ đi") || (event.body.toLowerCase() == "bot di ngu di")) {
    return api.sendMessage("Tớ là bot, cậu là người nên cần đi ngủ nè <3", threadID);
  };

  if ((event.body.toLowerCase() == "bot ăn cơm chưa") || (event.body.toLowerCase() == "bot an com chua")) {
    return api.sendMessage("Mình nhìn cậu ăn là thấy no rồi <3", threadID);
  };

  if ((event.body.toLowerCase() == "bot có thương tui ko") || (event.body.toLowerCase() == "bot co thuong tui ko")) {
    return api.sendMessage("Có <3", threadID);
  };

  if ((event.body.toLowerCase() == "clmm") || (event.body.toLowerCase() == "Clmm")) {
    return api.sendMessage("Gkê chưa :)", threadID);
  };

  if ((event.body.toLowerCase() == "Đm") || (event.body.toLowerCase() == "đm")) {
    return api.sendMessage("Suốt ngày đm", threadID);
  };

  if ((event.body.toLowerCase() == "Dm") ||  (event.body.toLowerCase() == "dm")) {
    return api.sendMessage("Không được như vậy má la😡", threadID);
  };

  if ((event.body.toLowerCase() == "cc") ||  (event.body.toLowerCase() == "Cc")) {
    return api.sendMessage("ý cậu gọi bot là cục cưng á uwu >< ", threadID);
  };
  if (event.body.indexOf("bot") == 0 || (event.body.indexOf("Bot") == 0)) {
    var msg = {
      body: rand
    }
    return api.sendMessage(msg, threadID, messageID);
  }
}

module.exports.languages = {
  "vi": {"on": "Bật","off": "Tắt", "successText": "goibot thành công",},
  "en": {"on": "on","off": "off","successText": "goibot success!",}
}

module.exports.run = async function ({ api, event, Threads, getText }) {
  const { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
  if (typeof data["goibot"] == "undefined" || data["goibot"] == true) data["goibot"] = false;
  else data["goibot"] = true;
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${(data["goibot"] == false) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
}