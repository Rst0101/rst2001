this.config = {
        name: "vdgai",
        aliases: ["vdgai"],
        version: "1.0.0",
        role: 0,
        author: "DongDev",
        info: "Xem video gái tiktok siêu múp",
        Category: "Ảnh/Video",
        guides: "vdgai",
        cd: 5,
        hasPrefix: false,
        images: []
 };
this.onRun = async function ({ api, event, msg  }) {
     msg.reply({ attachment: global.Seiko.queues.splice(0, 1)});
};