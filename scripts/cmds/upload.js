this.config = {
  name: "upload",
  aliases: ["upl"],
  version: "1.0.0",
  role: 0,
  author: "DongDev",
  info: "Upload ảnh, video, nhạc, gif lên imgur|catbox|imgbb",
  Category: "Công cụ",
  guides: "upload [ibb|imgur|catbox]",
  cd: 5,
  hasPrefix: true,
  images: [],
};
this.onRun = async ({ api, event: { type, messageReply, threadID }, args, msg }) => {
  const prefix = (global.data.threadData.get(threadID) || {}).PREFIX || global.config.PREFIX;
  switch (args[0]) {
    case 'imgu':
    case 'imgur':
      if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
        return msg.reply("❎ Bạn phải reply một video, ảnh hoặc âm thanh nào đó");
      }      
      try {
        const a = messageReply.attachments;
        const b = await Promise.all(a.map(async c => {
          const d = await global.api.imgur(c.url);
          return d.link;
        }));       
        msg.reply(b.join(',\n'));
      } catch (e) {
        console.error(e);
        msg.reply("❎ Đã xảy ra lỗi khi upload lên Imgur");
      }
      break;
    case 'cb':
    case 'catbox':
      if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
        return msg.reply("❎ Bạn phải reply một video, ảnh hoặc âm thanh nào đó");
      }      
      try {
        const a = messageReply.attachments;
        const b = await Promise.all(a.map(async c => {
          const d = c.type == "photo" ? "jpg" : c.type == "video" ? "mp4" : c.type == "audio" ? "m4a" : c.type == "animated_image" ? "gif" : "txt";
          const e = __dirname + `/cache/${Date.now()}.${d}`;
          await global.tools.downloadFile(c.url, e);
          return e;
        }));        
        if (b.length === 0) {
          return msg.reply("❎ Không tìm thấy tệp để tải lên!");
        }      
        const f = await Promise.all(b.map(async g => await global.api.catbox(g)));
        const h = f.map(i => `"${i}"`).join(',\n');      
        msg.reply(h);
        b.forEach(j => require('fs').unlinkSync(j));
      } catch (e) {
        console.error(e);
        msg.reply("❎ Lỗi khi tải lên lên Catbox");
      }
      break;
    case 'ibb':
    case 'imgbb':
      if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
        return msg.reply("❎ Bạn phải reply một hình ảnh hoặc gif");
      }      
      try {
        const a = messageReply.attachments.filter(b => b.type === "photo" || b.type === "animated_image");       
        if (a.length === 0) {
          return msg.reply("❎ Chỉ có hình ảnh và gif mới có thể upload");
        }        
        const c = await Promise.all(a.map(async d => {
          const e = await global.api.ibb(d.url);
          return `"${e}"`;
        }));        
        msg.reply(c.join(',\n'));
      } catch (e) {
        console.error(e);
        msg.reply("❎ Đã xảy ra lỗi khi upload lên ImgBB");
      }
      break;
    default:
      msg.reply(`upload imgur: tải ảnh/video/gif lên imgur\nupload catbox: tải ảnh/video/gif/nhạc lên catbox\nupload ibb: tải ảnh/gif lên imgbb\n──────────────────\n📝 HDSD: ${prefix}upload + [text] lệnh cần dùng`);
      break;
  }
};