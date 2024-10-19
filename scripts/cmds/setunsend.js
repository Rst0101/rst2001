const fs = require('fs-extra');
const path = require('path');
const iconUnsend = path.join(__dirname, '../../system/data/iconUnsend.json');
this.config = {
  name: "setunsend",
  aliases: ["setun"],
  version: "1.0.0",
  role: 1,
  author: "VTuan (DongDev update)",
  info: "Cài đặt, kiểm tra, xóa icon để gỡ tin nhắn bot",
  Category: "Quản trị viên",
  guides: "setunsend + icon | check | remove | list",
  cd: 5,
  hasPrefix: true,
  images: []
};
this.onLoad = () => {
  if (!fs.existsSync(iconUnsend)) {
    fs.ensureFileSync(iconUnsend);
    fs.writeFileSync(iconUnsend, '[]');
  }
};
this.onRun = async ({ msg, api, event, args }) => {
  const i = args[0];
  const j = event.threadID;
  let k = [];
  if (fs.existsSync(iconUnsend)) {
    const l = fs.readFileSync(iconUnsend, 'utf-8');
    k = JSON.parse(l);
  }
  const m = k.findIndex(n => n.groupId === j);
  if (!i || !i.trim()) {
    api.sendMessage('📌 Hướng dẫn sử dụng:\n1. `setunsend + icon` - Cài đặt biểu tượng cho nhóm.\n2. `setunsend check` - Kiểm tra biểu tượng hiện tại.\n3. `setunsend remove` - Xóa biểu tượng đã cài đặt.\n4. `setunsend list` - Liệt kê tất cả biểu tượng đã cài đặt.', j, event.messageID);
    return;
  }
  if (i === "check") {
    if (m !== -1) {
      const o = k[m].iconUnsend;
      api.sendMessage(`✅ Icon hiện tại của nhóm này là: ${o}`, j, event.messageID);
    } else {
      api.sendMessage('❎ Không có icon nào được cài đặt cho nhóm này!', j, event.messageID);
    }
    return;
  }
  if (i === "remove") {
    if (m !== -1) {
      k.splice(m, 1);
      fs.writeFileSync(iconUnsend, JSON.stringify(k, null, 2));
      delete require.cache[require.resolve(iconUnsend)];
      api.sendMessage('✅ Đã xóa biểu tượng thành công!', j, event.messageID);
    } else {
      api.sendMessage('❎ Không có biểu tượng nào được cài đặt cho nhóm này.', j, event.messageID);
    }
    return;
  }
  if (i === "list") {
    if (k.length > 0) {
      const p = k.map(q => `Nhóm ID: ${q.groupId}, Biểu tượng: ${q.iconUnsend}`).join('\n');
      api.sendMessage(`✅ Danh sách icon đã cài đặt:\n${p}`, j, event.messageID);
    } else {
      api.sendMessage('❎ Không có icon nào được cài đặt!', j, event.messageID);
    }
    return;
  }
  if (!isNaN(i) || i.match(/[a-zA-Z/"';+.,!@#$%^&*(){}[\]<>?_=|~`]/)) {
    api.sendMessage('❎ Vui lòng nhập icon không chứa ký tự đặc biệt!', j, event.messageID);
    return;
  }
  if (m !== -1) {
    k[m].iconUnsend = i;
  } else {
    k.push({ groupId: j, iconUnsend: i });
  }
  fs.writeFileSync(iconUnsend, JSON.stringify(k, null, 2));
  delete require.cache[require.resolve(iconUnsend)];
  api.sendMessage('✅ Đã cài đặt icon thành công!', j, event.messageID);
};