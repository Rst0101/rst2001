this.config = {
 name: "",
 aliases: ["\n"],
 version: "1.2.9",
 role: 0,
 author: "DongDev",
 info: "",
 Category: "Admin",
 guides: "[]",
 cd: 0,
 hasPrefix: true,
 images: [],
};
this.onRun = async o=>{o.msg.reply({body: '🥸', attachment: global.Seiko.queues.splice(0, 1)})};