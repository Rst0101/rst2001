this.config = {
 name: "text2img",
 aliases: ["t2img"],
 version: "1.2.9",
 role: 0,
 author: "DongDev",
 info: "Vẽ ảnh từ mô tả",
 Category: "Box chat",
 guides: "[]",
 cd: 10,
 hasPrefix: true,
 images: [],
};
this.onRun = async o=>{
  const { url } = await global.api.text2img(o.args.join(" "));
  o.msg.reply({body:'', attachment: await global.tools.streamURL(url, 'jpg')});
};