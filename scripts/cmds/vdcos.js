this.config = {
        name: "vdcos",
        aliases: ["vdcos"],
        version: "1.0.0",
        role: 0,
        author: "DongDev",
        info: "Xem video cosplay tiktok",
        Category: "Ảnh/Video",
        guides: "vdcos",
        cd: 5,
        hasPrefix: false,
        images: []
    };
this.onRun = async function ({ api, event, msg  }) {
   function random(array) {
       const i = Math.floor(Math.random() * array.length);
       return array[i];
   }
   let url = random(global.api.vdcos);
   return msg.reply({ attachment: await global.tools.streamURL(url, 'mp4')});
}