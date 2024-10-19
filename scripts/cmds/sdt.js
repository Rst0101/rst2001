module.exports = class {
    static config = {
        name: "sdt",
        aliases: ["sdt"],
        version: "1.0.0",
        role: 0,
        author: "DongDev",
        info: "Định giá số điện thoại",
        Category: "Công cụ",
        guides: "sdt + <phone number>",
        cd: 5,
        hasPrefix: true,
        images: []
    };
    static async onRun({ api, event, msg, args }) {
        try{
        let phone = args.join(' ');
        let { sdt, network, price, description, features } = await global.api.pricing(phone);
        msg.reply(`🔢 Số điện thoại: ${sdt}\n🌐 Nhà mạng: ${network}\n💰 Được định giá: ${price}\n🃏 Có ý nghĩa: ${description}\n📝 Ý nghĩa các cặp số:\n${features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}`);
  }catch(e){console.log(e)}
 }
}