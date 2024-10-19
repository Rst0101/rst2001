const fs = require('fs');
const path = require('path');
const cardsFilePath = path.join(__dirname, '../../system/data/cards.json');
function readCardsData() {
  if (!fs.existsSync(cardsFilePath)) {
    return {};
  }
  const rawData = fs.readFileSync(cardsFilePath);
  return JSON.parse(rawData);
}
function writeCardsData(data) {
  fs.writeFileSync(cardsFilePath, JSON.stringify(data, null, 2));
}
function checkCard(maThe, soSerial) {
  const cards = readCardsData();
  if (cards[maThe] && cards[maThe].serial === soSerial) {
    return {
      value: cards[maThe].value,
      used: cards[maThe].used,
      networkProvider: cards[maThe].networkProvider
    };
  }
  return null;
}
function generateCardNumber(networkProvider, soSerial) {
  let length;
  switch (networkProvider) {
    case 'Viettel':
      length = soSerial.length === 11 ? 13 : 15;
      break;
    case 'Mobifone':
    case 'Vinaphone':
    case 'Vietnamobile':
    case 'Gmobile':
    case 'iTel':
    case 'Local':
      length = 12;
      break;
    default:
      length = 12;
      break;
  }
  let cardNumber = '';
  for (let i = 0; i < length; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }
  return cardNumber;
}
function generateSerial() {
  const prefix = '10000';
  const suffix = (Math.floor(Math.random() * 10000000000)).toString().padStart(11 - prefix.length, '0');
  return prefix + suffix;
}
function isValidValue(value) {
  const validValues = [10000, 20000, 50000, 100000, 200000, 500000];
  return validValues.includes(value);
}
async function processCardUsage(maThe, soSerial, senderID, Currencies) {
  const card = checkCard(maThe, soSerial);
  if (card && !card.used) {
    await Currencies.increaseMoney(senderID, card.value);
    const cards = readCardsData();
    const money = (await Currencies.getData(senderID)).money;
    delete cards[maThe];
    writeCardsData(cards);
    const moneyFormatted = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `✅ Nạp thẻ ${card.networkProvider} thành công!\n🔢 Bạn được cộng: ${card.value.toLocaleString()}$ vào tài khoản\n💰 Số tiền hiện có: ${moneyFormatted}$`;
  } else if (card && card.used) {
    return "Thẻ này đã được sử dụng.";
  } else {
    return "❎ Nạp thẻ thất bại, vui lòng kiểm tra lại mã thẻ và số serial, hoặc thẻ đã được sử dụng";
  }
}
module.exports = {
  config: {
    name: "card",
    aliases: ["card"],
    version: "1.0.0",
    role: 0,
    author: "DongDev",
    info: "Nạp thẻ cào điện thoại",
    Category: "Admin",
    guides: "[nạp] [mã thẻ] [số serial]",
    cd: 5,
    hasPrefix: true,
    images: [],
  },
  onRun: async ({ event, api, args, Users, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    const [command, ...rest] = args;
    switch (command) {
      case 'reg': {
        const [networkProvider, value] = rest;
        if (!networkProvider || !value) {
          return api.sendMessage("❎ Vui lòng nhập đầy đủ thông tin đăng ký: [nhà mạng] [mệnh giá]", threadID, messageID);
        }
        const numericValue = parseInt(value);
        if (!isValidValue(numericValue)) {
          return api.sendMessage("❎ Mệnh giá không hợp lệ, các mệnh giá hợp lệ là 10000, 20000, 50000, 100000, 200000, 500000", threadID, messageID);
        }
        const soSerial = generateSerial();
        const maThe = generateCardNumber(networkProvider, soSerial);
        const cards = readCardsData();
        cards[maThe] = {
          serial: soSerial,
          value: numericValue,
          networkProvider,
          used: false,
        };
        writeCardsData(cards);
        return api.sendMessage(`✅ Đăng ký thẻ thành công!\n🌐 Nhà mạng: ${networkProvider}\n🔢 Mã thẻ: ${maThe}\n🆔 Số serial: ${soSerial}\📊 Mệnh giá: ${numericValue.toLocaleString()}$`, threadID, messageID);
      }
      case 'nạp': {
        const [maThe, soSerial] = rest;
        if (!maThe || !soSerial) {
          return api.sendMessage("❎ Vui lòng nhập đầy đủ mã thẻ và số serial", threadID, messageID);
        }
        const responseMessage = await processCardUsage(maThe, soSerial, senderID, Currencies);
        api.sendMessage(responseMessage, threadID, messageID);
        break;
      }
      case 'check': {
        const [soSerial] = rest;
        if (!soSerial) {
          return api.sendMessage("❎ Vui lòng nhập số serial để kiểm tra", threadID, messageID);
        }
        const cards = readCardsData();
        const foundCard = Object.values(cards).find(card => card.serial === soSerial);
        if (foundCard) {
          api.sendMessage(`📝 Thông tin thẻ:\n🌐 Nhà mạng: ${foundCard.networkProvider}\n🔢 Mã thẻ: ${Object.keys(cards).find(key => cards[key].serial === soSerial)}\n📊 Mệnh giá: ${foundcard.value.toLocaleString()}$\n📌 Trạng thái: ${foundCard.used ? 'Đã sử dụng' : 'Chưa sử dụng'}`, threadID, messageID);
        } else {
          api.sendMessage("❎ Không tìm thấy thẻ với số serial này", threadID, messageID);
        }
        break;
      }
      case 'list': {
        const cards = readCardsData();
        const cardList = Object.entries(cards).map(([maThe, card]) => {
          return `🔢 Mã thẻ: ${maThe}\n🆔 Số serial: ${card.serial}\n🌐 Nhà mạng: ${card.networkProvider}\n📊 Giá trị: ${card.value.toLocaleString()}$\n📌 Trạng thái: ${card.used ? 'Đã sử dụng' : 'Chưa sử dụng'}`;
        }).join('\n\n');
        const message = cardList.length > 0 ? cardList : "❎ Hiện không có thẻ nào trong dữ liệu";
        api.sendMessage(message, threadID, messageID);
        break;
      }
      default:
        api.sendMessage("Lệnh không hợp lệ, sử dụng [nạp] + [mã thẻ] + [số serial] để nạp thẻ", threadID, messageID);
        break;
    }
  },
  onLoad: async o => {
    if (!fs.existsSync(cardsFilePath)) {
      fs.mkdirSync(path.dirname(cardsFilePath), { recursive: true });
      fs.writeFileSync(cardsFilePath, JSON.stringify({}));
    }
  },
};