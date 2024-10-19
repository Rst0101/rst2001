module.exports = {
  config: {
    name: "slot",
    aliases: ["slothq"],
    version: "1.0.5",
    author: "DongDev",
    role: 0,
    info: "Cờ bạc bằng hình thức hoa quả",
    Category: "Game",
    guides: "slot [nho/dưa/táo/777/dâu/đào] + số tiền cược lưu ý số tiền cược phải trên 50$",
    cd: 0,
    hasPrefix: true,
    images: [],
  },
  onRun: async ({ api: { sendMessage: sM, editMessage: eM, unsendMessage: uM }, event: { threadID: tID, messageID: mID, senderID: sID }, Currencies: { setData: sD, getData: gD }, args: [f, bA] }) => {
    const fI = { nho: "🍇", dưa: "🍉", táo: "🍏", "777": "7️⃣", dâu: "🍓", đào: "🍑" };
    const fs = Object.keys(fI);
    const { money: m } = await gD(sID);
    const send = (msg, cb) => sM(msg, tID, cb ? cb : mID);
    if (!fs.includes(f)) return send("❎ Bạn chưa đặt cược");
    const b = bA === "all" ? m : bA.endsWith("%") ? (m / 100n) * BigInt(bA.slice(0, -1)) : BigInt(bA);
    if (b < 50n || b > m) return send(b < 50n ? "❎ Vui lòng cược ít nhất 50$" : "❎ Bạn không đủ tiền");
    const r = Array.from({ length: 3 }, () => fs[Math.floor(Math.random() * fs.length)]);
    const matchingFruits = r.filter(x => x === f).length;
    let winMultiplier = 1;
    if (f === "777") {
      winMultiplier = matchingFruits === 3 ? 10 : matchingFruits === 2 ? 2 : 1;
    } else {
      winMultiplier = matchingFruits === 3 ? 5 : matchingFruits === 2 ? 2 : 1;
    }
    const winAmount = b * BigInt(winMultiplier);
    await sD(sID, { money: m + (matchingFruits === 0 ? -b : winAmount) });
    send("🎰 Vui lòng chờ sau 6 giây...", (msg, cb) => {
      const countdown = ["5", "4", "3", "2", "1", "0"];
      countdown.forEach((item, index) => {
        setTimeout(() => {
          eM(cb.messageID, `🎰 Vui lòng chờ sau ${5 - index} giây...`, (err) => {
            if (err) console.log(err);
          });
        }, (index + 1) * 1000);
      });
      setTimeout(() => uM(cb.messageID), 6000);
      setTimeout(() => {
        send(matchingFruits >= 1 ?
          `🎉 ${["Chúc mừng bạn đã chiến thắng! 🥳", "Wow! Bạn đã thắng lớn rồi! 🎉", "Bạn đã thắng! Phong độ quá!" ][Math.floor(Math.random() * 3)]}\n` +
          `🎭 Quay được ${matchingFruits} ${fI[f]}\n🎰 Kết quả: ${r.map(x => fI[x]).join(" | ")}\n` +
          `💰 Bạn nhận được: + ${winAmount.toLocaleString()}$\n` :
          `💸 ${["Tiếc quá! Bạn đã không thắng được! 😢", "Không sao đâu, còn cơ hội khác mà! 😢", "Đừng buồn, cờ bạc là đỏ đen! 😢"][Math.floor(Math.random() * 3)]}\n` +
          `🎭 Quay được ${matchingFruits} ${fI[f]}\n🎰 Kết quả: ${r.map(x => fI[x]).join(" | ")}\n` +
          `💸 Bạn mất đi: - ${b.toLocaleString()}$\n`);
      }, 6000);
    });
  }
};