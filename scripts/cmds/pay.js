this.config = {
  name: "pay",
  aliases: ["pay"],
  version: "1.3.0",
  role: 0,
  author: "Mirai Team",
  info: "Chuyển tiền của bản thân cho ai đó",
  Category: "Box chat",
  guides: "pay @tag coins hoặc pay @tag số+đơn vị",
  cd: 5,
  hasPrefix: true,
  images: [],
};

this.onRun = async ({ event, api, Currencies, args, Users }) => {
  let { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions)[0];
  const transactionFeePercentage = 5;
  const baseUnit = 1024000000;
  const units = {
    b: baseUnit,
    kb: baseUnit * 8,
    mb: baseUnit * 8 * 1024,
    gb: baseUnit * 8 * 1024 * 1024,
    tb: baseUnit * 8 * 1024 * 1024 * 1024,
    pb: baseUnit * 8 * 1024 * 1024 * 1024 * 1024,
    eb: baseUnit * 8 * 1024 * 1024 * 1024 * 1024 * 1024,
    zb: baseUnit * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    yb: baseUnit * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    bb: baseUnit * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    geb: baseUnit * 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
  };
  function convertToCoins(amount) {
    let unit = amount.match(/[a-zA-Z]+/) ? amount.match(/[a-zA-Z]+/)[0].toLowerCase() : '';
    let value = parseFloat(amount.replace(unit, ''));
    if (units[unit]) {
      return value * units[unit];
    }
    return value;
  }
  async function handleTransfer(recipientID, coins, name) {
    let fee = Math.ceil(coins * (transactionFeePercentage / 100));
    let balance = (await Currencies.getData(senderID)).money;
    if (coins <= 0 || fee < 0 || coins + fee > balance) {
      return api.sendMessage(`❎ Số coins bạn muốn chuyển lớn hơn số coins bạn hiện có hoặc không hợp lệ!`, threadID, messageID);
    }
    return api.sendMessage({ body: `✅ Bạn đã chuyển ${coins.toLocaleString()}$ cho ${name}\n🧮 Phí giao dịch là ${transactionFeePercentage}%` }, threadID, async () => {
      await Currencies.increaseMoney(recipientID, coins);
      await Currencies.decreaseMoney(senderID, coins + fee);
    }, messageID);
  }
  if (!args[0]) {
    return api.sendMessage('❎ Vui lòng nhập số coins muốn chuyển', threadID, messageID);
  }
  if (!mention && event.messageReply) {
    if (isNaN(args[0].replace(/[a-zA-Z]+/, '')) && !args[0].includes('b')) {
      return api.sendMessage(`❎ Nội dung bạn nhập không phải là 1 con số hợp lệ!`, threadID, messageID);
    }
    coins = convertToCoins(args[0]);
    const recipientID = event.messageReply.senderID;
    const namePay = (await Users.getData(recipientID)).name;
    await handleTransfer(recipientID, coins, namePay);
  } else if (mention) {
    let nameLength = event.mentions[mention].split(" ").length;
    if (!isNaN(args[nameLength].replace(/[a-zA-Z]+/, '')) || args[nameLength].includes('b')) {
      coins = convertToCoins(args[nameLength]);
      const namePay = event.mentions[mention].replace(/@/g, "");
      await handleTransfer(mention, coins, namePay);
    } else {
      return api.sendMessage('❎ Vui lòng nhập số coins muốn chuyển', threadID, messageID);
    }
  } else {
    return api.sendMessage('❎ Vui lòng tag hoặc reply tin nhắn của người muốn chuyển tiền!', threadID, messageID);
  }
};