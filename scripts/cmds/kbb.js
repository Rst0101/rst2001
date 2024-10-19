const { get: axiosGet } = require('axios');
const moment = require("moment-timezone");

const kbbOptions = ['kéo', 'búa', 'bao'];

const imageUrlsA = [
  'https://i.imgur.com/4Hfduoe.png',
  'https://i.imgur.com/EHsr9RL.png',
  'https://i.imgur.com/Xuw6yG8.png'
];

const imageUrlsB = [
  'https://i.imgur.com/YPhfjfU.png',
  'https://i.imgur.com/mahn5lm.png',
  'https://i.imgur.com/cEivriJ.png'
];

this.config = {
  name: "kbb",
  version: "1.0.0",
  role: 0,
  credits: "quất",
  info: "Chơi kéo búa bao",
  Category: "Game",
  guides: "[từ khoá]",
  cd: 0
};
this.onRun = async function ({ api, event, args, Currencies, Users, msg }) {
  const { threadID: threadId, senderID: senderId } = event;
  const { sendMessage } = api;
  const { increaseMoney, getData } = Currencies;
  const { getNameUser } = Users;

  const rd = kbbOptions[Math.floor(Math.random() * kbbOptions.length)];
  const ra = args[0] === 'kéo' ? 0 : args[0] === 'búa' ? 1 : 2;
  const rb = rd === 'kéo' ? 0 : rd === 'búa' ? 1 : 2;

  const w = 'https://i.imgur.com/tYFcqjH.png';
  const l = 'https://i.imgur.com/4QBP4bC.png';
  const d = 'https://i.imgur.com/AYhzVjZ.png';

  const moneyData = (await getData(senderId)).data || {};
  const M = moneyData.money;
  
  const tm = moment().tz("Asia/Ho_Chi_Minh").format('HH:mm:ss || DD/MM/YYYY');
  const n = await getNameUser(senderId);

  if (!args[0] || (!parseFloat(args[1]) && args[1] !== 'all')) {
    return msg.reply('Vui lòng chọn kéo búa hoặc bao và cược tiền');
  }

  let m = args[1] === 'all' ? M : parseFloat(args[1]);
  if (isNaN(m) || m <= 0) {
    return msg.reply('Số tiền cược phải là một số nguyên dương');
  }

  let result, attachment;

  switch (args[0]) {
    case 'kéo':
      result = rd === 'bao' ? 'thắng' : rd === 'búa' ? 'thua' : 'hòa';
      attachment = [
        await axiosGet(imageUrlsA[ra], { responseType: 'stream' }).then(r => r.data),
        await axiosGet(result === 'thắng' ? w : result === 'thua' ? l : d, { responseType: 'stream' }).then(r => r.data),
        await axiosGet(imageUrlsB[rb], { responseType: 'stream' }).then(r => r.data)
      ];
      await increaseMoney(senderId, parseFloat(result === 'thắng' ? m : result === 'thua' ? -m : 0));
      break;

    case 'búa':
      result = rd === 'kéo' ? 'thắng' : rd === 'bao' ? 'thua' : 'hòa';
      attachment = [
        await axiosGet(imageUrlsA[ra], { responseType: 'stream' }).then(r => r.data),
        await axiosGet(result === 'thắng' ? w : result === 'thua' ? l : d, { responseType: 'stream' }).then(r => r.data),
        await axiosGet(imageUrlsB[rb], { responseType: 'stream' }).then(r => r.data)
      ];
      await increaseMoney(senderId, parseFloat(result === 'thắng' ? m : result === 'thua' ? -m : 0));
      break;

    case 'bao':
      result = rd === 'búa' ? 'thắng' : rd === 'kéo' ? 'thua' : 'hòa';
      attachment = [
        await axiosGet(imageUrlsA[ra], { responseType: 'stream' }).then(r => r.data),
        await axiosGet(result === 'thắng' ? w : result === 'thua' ? l : d, { responseType: 'stream' }).then(r => r.data),
        await axiosGet(imageUrlsB[rb], { responseType: 'stream' }).then(r => r.data)
      ];
      await increaseMoney(senderId, parseFloat(result === 'thắng' ? m : result === 'thua' ? -m : 0));
      break;

    default:
      return;
  }

  const dn = result === 'thắng' ? `nhận: ${m}$\n> Hiện bạn còn: ${1000 + M + m}$` :
             result === 'thua' ? `mất: ${m}$\n> Hiện bạn còn: ${1000 + M - m}$` :
             `giữ lại: ${m}$\n> Hiện bạn còn: ${M + 1000}$`;

  sendMessage({
    body: `> Người chơi: ${n}\n> Lúc: ${tm}\n> Kết quả: ${result}\n> Bạn đưa ra: ${args[0]}\n> Bot đưa ra: ${rd}\n> Bạn ${dn}`,
    attachment: attachment
  }, threadId);
};