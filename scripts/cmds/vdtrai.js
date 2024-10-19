this.config = {
        name: "vdtrai",
        aliases: ["vdtrai"],
        version: "1.0.0",
        role: 0,
        author: "DongDev",
        info: "Xem video trai tiktok",
        Category: "Ảnh/Video",
        guides: "vdtrai",
        cd: 5,
        hasPrefix: false,
        images: []
    };
this.onRun = async function ({ api, event, msg  }) {
   function random(array) {
       const i = Math.floor(Math.random() * array.length);
       return array[i];
   }
   let url = random(global.api.vdtrai);
   return msg.reply({ attachment: await global.tools.streamURL(url, 'mp4')});
}