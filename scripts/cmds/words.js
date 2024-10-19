const entryFee = 5000; // Phí tham gia trò chơi
const minHintFee = 10000; // Phí gợi ý tối thiểu
const maxHintFee = 50000; // Phí gợi ý tối đa
const maxReward = 200000; // Phần thưởng tối đa
const minReward = 50000; // Phần thưởng tối thiểu
const maxPoints = 15; // Điểm tối đa
const minPoints = 5; // Điểm tối thiểu
const answerPenalty = 5000; // Phí trừ khi trả lời sai
const hintPenaltyMultiplier = 20000; // Hệ số phạt tiền cho mỗi lần sử dụng gợi ý
const hintPenaltyMultiplierPoints = 5; // Hệ số phạt điểm cho mỗi lần sử dụng gợi ý
const timeLimit = 300000; // Thời gian giới hạn (5 phút)
const fs = require('fs').promises;
const path = require('path');
const shuffle = (word) => {
  let arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};
const wordsFilePath = path.resolve(__dirname, '../../system/data/game/words/words.json');
const gameDataPath = path.resolve(__dirname, '../../system/data/game/words');
const leaderboardPath = path.join(gameDataPath, 'leaderboard.json');
let wordsCache = null;
let leaderboardCache = null;
const readFileCached = async (filePath, cache) => {
  if (cache) return cache;
  try {
    const data = await fs.readFile(filePath, 'utf8');
    cache = JSON.parse(data);
  } catch (error) {
    cache = [];
  }
  return cache;
};
const writeFileCached = async (filePath, data, cache) => {
  cache = data;
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
const readWords = async () => readFileCached(wordsFilePath, wordsCache);
const writeWords = async (words) => writeFileCached(wordsFilePath, words, wordsCache);
const readLeaderboard = async () => readFileCached(leaderboardPath, leaderboardCache);
const writeLeaderboard = async (leaderboard) => writeFileCached(leaderboardPath, leaderboard, leaderboardCache);
const clearGameData = (threadID) => {
  if (global.Seiko.giaiMaGame) {
    delete global.Seiko.giaiMaGame[threadID];
  }
};
module.exports = {
  config: {
    name: "words",
    aliases: ["words"],
    version: "1.0.0",
    author: "DongDev",
    role: 0,
    info: "Giải mã từ vựng tiếng Việt!",
    Category: "Game",
    guides: "words",
    cd: 5,
    hasPrefix: true,
    images: [],
  },
  onLoad: async () => {
    try {
      await fs.mkdir(gameDataPath, {
        recursive: true
      });
      await readWords();
      await readLeaderboard();
    } catch (error) {
      console.error('Error initializing game data:', error);
    }
  },
  onRun: async ({
    event,
    api,
    Currencies,
    msg,
    Users,
    args
  }) => {
    const {
      senderID,
      threadID
    } = event;
    try {
      switch (args[0]) {
        case "top":
        case "lb":
          msg.reply(await getLeaderboard());
          break;
        case "add":
          if (!global.config.NDH.includes(senderID.toString())) {
            return msg.reply(`❎ Bạn không có quyền thêm từ mới`);
          }
          const newWords = args.slice(1).join(' ').split(',').map(word => word.trim());
          if (newWords.length > 0) {
            const wordsadd = await readWords();
            const addedWords = [];
            const existingWords = [];
            newWords.forEach(newWord => {
              if (wordsadd.includes(newWord)) {
                existingWords.push(newWord);
              } else {
                wordsadd.push(newWord);
                addedWords.push(newWord);
              }
            });
            await writeWords(wordsadd);
            let replyMessage = `✅ Đã thêm từ mới: ${addedWords.join(', ')}`;
            if (existingWords.length > 0) {
              replyMessage += `\n❎ Các từ đã tồn tại: ${existingWords.join(', ')}`;
            }
            msg.reply(replyMessage);
          } else {
            msg.reply(`❎ Bạn cần nhập một hoặc nhiều từ mới để thêm`);
          }
          break;
        case "del":
          if (!global.config.NDH.includes(senderID.toString())) {
            return msg.reply(`❎ Bạn không có quyền xóa từ`);
          }
          const deleteWords = args.slice(1).join(' ').split(',').map(word => word.trim());
          if (deleteWords.length > 0) {
            if (deleteWords.includes("all")) {
              await writeWords([]);
              return msg.reply(`✅ Đã xóa toàn bộ từ`);
            }
            const wordsdel = await readWords();
            const remainingWords = wordsdel.filter(word => !deleteWords.includes(word));
            await writeWords(remainingWords);
            let replyMessage = `✅ Đã xóa các từ: ${deleteWords.join(', ')}`;
            if (remainingWords.length === wordsdel.length) {
              replyMessage += `\n❎ Không tìm thấy các từ để xóa: ${deleteWords.join(', ')}`;
            }
            msg.reply(replyMessage);
          } else {
            msg.reply(`❎ Bạn cần nhập một hoặc nhiều từ để xóa`);
          }
          break;
        case "check":
          if (!global.config.NDH.includes(senderID.toString())) {
            return msg.reply(`❎ Bạn không có quyền kiểm tra`);
          }
          const wordcount = await readWords();
          msg.reply(`📄 Hiện có ${wordcount.length} từ trong danh sách`);
          break;
        default:
          if (global.Seiko.giaiMaGame && global.Seiko.giaiMaGame[threadID]) {
            return msg.reply(`❎ Hiện tại đang có một trò chơi đang diễn ra. Vui lòng hoàn thành trò chơi trước khi bắt đầu trò chơi mới!`);
          }
          const userData = await Currencies.getData(senderID);
          clearGameData(threadID);
          if (userData.money < entryFee) {
            return msg.reply(`❎ Bạn không có đủ tiền để tham gia trò chơi. Phí tham gia là ${entryFee.toLocaleString()}$`);
          }
          await Currencies.decreaseMoney(senderID, entryFee);
          const words = await readWords();
          if (words.length === 0) {
            return msg.reply(`❎ Hiện tại không có từ nào để chơi. Vui lòng thử lại sau`);
          }
          const word = words[Math.floor(Math.random() * words.length)];
          const wordLength = word.length;
          const scrambled = shuffle(word).toUpperCase().split('').join(' ');
          msg.reply(`🔠 Giải mã từ vựng tiếng Việt!\n🖊️ Hãy giải mã từ (${wordLength} chữ): ${scrambled}\n💡 Để nhận gợi ý, nhập "gợi ý", phí từ ${minHintFee.toLocaleString()}$ - ${maxHintFee.toLocaleString()}$ cho mỗi gợi ý\n⏳ Bạn có thời gian là 5 phút để giải mã từ`, (err, info) => {
            if (!global.Seiko.giaiMaGame) global.Seiko.giaiMaGame = {};
            global.Seiko.giaiMaGame[threadID] = {
              originalWord: word,
              scrambledWord: scrambled,
              messageID: info.messageID,
              userID: senderID,
              hints: 0,
              maxHints: 3,
              revealedLetters: new Set(),
              attempts: 0,
              startTime: Date.now()
            };
            setTimeout(async () => {
              if (global.Seiko.giaiMaGame[threadID]) {
                let name = await Users.getNameUser(senderID);
                msg.reply({
                  body: `⏳ Hết thời gian! ${name} đã không kịp giải mã từ: ${global.Seiko.giaiMaGame[threadID].originalWord}`,
                  mentions: [{
                    tag: name,
                    id: senderID
                  }]
                });
                clearGameData(threadID);
              }
            }, timeLimit);
          });
          break;
      }
    } catch (error) {
      console.error('Error during game run:', error);
      msg.reply(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau`);
    }
  },
  onEvent: async ({
    event,
    api,
    Currencies,
    msg,
    Users
  }) => {
    const {
      threadID,
      body,
      senderID
    } = event;
    if (!global.Seiko.giaiMaGame || !global.Seiko.giaiMaGame[threadID]) return;
    const gameData = global.Seiko.giaiMaGame[threadID];
    if (senderID !== gameData.userID) return;
    try {
      const userData = await Currencies.getData(senderID);
      if (body.toLowerCase().trim() === "gợi ý" || body.toLowerCase().trim() === "hint") {
        if (gameData.hints >= gameData.maxHints) {
          return msg.reply(`❎ Bạn đã sử dụng hết số lần gợi ý!`);
        }
        let hintFee;
        let revealCount;
        switch (gameData.hints) {
          case 0:
            hintFee = minHintFee;
            revealCount = Math.floor(Math.random() * 3) + 2;
            break;
          case 1:
            hintFee = (minHintFee + maxHintFee) / 2;
            revealCount = Math.floor(Math.random() * 6) + 5;
            break;
          case 2:
            hintFee = maxHintFee;
            revealCount = Math.floor(Math.random() * 7) + 6;
            break;
          default:
            hintFee = maxHintFee;
            revealCount = Math.floor(Math.random() * 7) + 6;
            break;
        }
        if (userData.money < hintFee) {
          return msg.reply(`❎ Bạn không có đủ tiền để nhận gợi ý. Phí mỗi gợi ý là ${hintFee.toLocaleString()}$`);
        }
        await Currencies.decreaseMoney(senderID, hintFee);
        let wordArr = gameData.originalWord.split('');
        let revealed = '';
        let revealedCount = 0;
        wordArr.forEach((char) => {
          if (char === ' ') {
            revealed += '  ';
          } else if (gameData.revealedLetters.has(char) || (revealedCount < revealCount && Math.random() > 0.5)) {
            gameData.revealedLetters.add(char);
            revealed += `${char} `;
            revealedCount++;
          } else {
            revealed += '_ ';
          }
        });
        gameData.hints++;
        const hintsRemaining = gameData.maxHints - gameData.hints;
        msg.reply(`💡 Gợi ý của bạn: "${revealed.trim()}"\n💰 Đã trừ: ${hintFee.toLocaleString()}$`);
      } else if (body.toLowerCase().trim() === "status") {
        if (gameData) {
          const elapsed = Date.now() - gameData.startTime;
          const remainingTime = Math.max(0, timeLimit - elapsed);
          const minutes = Math.floor(remainingTime / 60000);
          const seconds = ((remainingTime % 60000) / 1000).toFixed(0);
          const formattedTime = `${minutes < 10 ? '0' : ''}${minutes} phút ${seconds < 10 ? '0' : ''}${seconds} giây`;
          msg.reply(`📊 Trạng thái trò chơi:\n\n🔠 Từ xáo trộn: ${gameData.scrambledWord}\n💡 Gợi ý đã dùng: ${gameData.hints}/${gameData.maxHints}\n⏳ Thời gian còn lại: ${formattedTime}\n❓ Số lần thử: ${gameData.attempts}`);
        } else {
          msg.reply(`❎ Hiện tại không có trò chơi nào đang diễn ra`);
        }
        return;
      } else if (body.toLowerCase().trim() === "end" || body.toLowerCase().trim() === "kết thúc") {
        if (global.Seiko.giaiMaGame && global.Seiko.giaiMaGame[threadID] && senderID === global.Seiko.giaiMaGame[threadID].userID) {
          let name = await Users.getNameUser(senderID);
          msg.reply(`🚪 Trò chơi đã được kết thúc bởi ${name}`);
          clearGameData(threadID);
        } else {
          return;
        }
        return;
      } else if (body.toLowerCase().trim() === "bỏ qua" || body.toLowerCase().trim() === "skip") {
        try {
          const gameData = global.Seiko.giaiMaGame[threadID];
          if (!gameData) {
            return msg.reply(`❎ Hiện tại không có trò chơi nào đang diễn ra`);
          }
          const skippedWord = gameData.originalWord;
          clearGameData(threadID);
          const skipFee = Math.ceil(entryFee * 0.05);
          const remainingMoney = await Currencies.getData(senderID);
          if (remainingMoney.money < skipFee || skipFee <= 0) {
            return msg.reply(`❎ Bạn không có đủ tiền để bỏ qua từ này.`);
          }
          await Currencies.decreaseMoney(senderID, skipFee);
          msg.reply(`🔄 Bạn đã bỏ qua từ "${skippedWord}", đang tải từ mới, bắt đầu sau 3 giây...`, async (err, info) => {
            const countdown = ["2", "1", "0"];
            countdown.forEach((item, index) => {
              setTimeout(() => {
                api.editMessage(info.messageID, `🔄 Bạn đã bỏ qua từ "${skippedWord}", đang tải từ mới, bắt đầu sau ${2 - index} giây...`);
              }, (index + 1) * 1000);
            });
            setTimeout(async () => {
              try {
                const words = await readWords();
                if (words.length === 0) {
                  return msg.reply(`❎ Hiện tại không có từ nào để chơi. Vui lòng thử lại sau`);
                }
                const word = words[Math.floor(Math.random() * words.length)];
                const wordLength = word.length;
                const scrambled = shuffle(word).toUpperCase().split('').join(' ');
                msg.reply(`🔠 Giải mã từ vựng tiếng Việt!\n🖊️ Hãy giải mã từ (${wordLength} chữ): ${scrambled}\n💡 Để nhận gợi ý, nhập "gợi ý", phí từ ${minHintFee.toLocaleString()}$ - ${maxHintFee.toLocaleString()}$ cho mỗi gợi ý\n⏳ Bạn có thời gian là 5 phút để giải mã từ`, async (err, newInfo) => {
                  if (err) return;
                  if (!global.Seiko.giaiMaGame) global.Seiko.giaiMaGame = {};
                  global.Seiko.giaiMaGame[threadID] = {
                    originalWord: word,
                    scrambledWord: scrambled,
                    messageID: newInfo.messageID,
                    userID: senderID,
                    hints: 0,
                    maxHints: 3,
                    revealedLetters: new Set(),
                    attempts: 0,
                    startTime: Date.now()
                  };
                  setTimeout(async () => {
                    if (global.Seiko.giaiMaGame[threadID]) {
                      let name = await Users.getNameUser(senderID);
                      msg.reply({
                        body: `⏳ Hết thời gian! ${name} đã không kịp giải mã từ: ${global.Seiko.giaiMaGame[threadID].originalWord}`,
                        mentions: [{
                          tag: name,
                          id: senderID
                        }]
                      });
                      clearGameData(threadID);
                    }
                  }, timeLimit);
                });
                await api.unsendMessage(info.messageID);
              } catch (error) {
                console.error('Error starting new word:', error);
                msg.reply(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau`);
              }
            }, 3000);
          });
        } catch (error) {
          console.error('Error when skipping word:', error);
          msg.reply(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau`);
        }
      } else if (body.toLowerCase().trim() === gameData.originalWord.toLowerCase().trim()) {
        gameData.attempts++;
        const timeTaken = Date.now() - gameData.startTime;
        function calculateReward(attempts, timeTaken) {
             const baseReward = Math.ceil(maxReward - ((attempts - 1) * ((maxReward - minReward) / attempts)));
             const hintPenalty = gameData.hints > 0 ? gameData.hints * hintPenaltyMultiplier : 0;
             const finalReward = Math.max(minReward, baseReward - hintPenalty);
             return Math.max(1, finalReward);
        }
       function calculatePoints(attempts, timeTaken) {
             const basePoints = Math.ceil(maxPoints - ((attempts - 1) * ((maxPoints - minPoints) / attempts)));
             const hintPenaltyPoints = gameData.hints > 0 ? gameData.hints * hintPenaltyMultiplierPoints : 0;
             const finalPoints = Math.max(minPoints, basePoints - hintPenaltyPoints);
             return Math.max(1, finalPoints);
        }
        const reward = calculateReward(gameData.attempts, timeTaken);
        const points = calculatePoints(gameData.attempts, timeTaken);
        await Currencies.increaseMoney(senderID, reward);
        let name = await Users.getNameUser(event.senderID);
        let mentions = [{
          tag: name,
          id: senderID
        }];
        msg.reply({
          body: `🎊 Chúc mừng ${name} đã giải mã từ \"${gameData.originalWord}\" thành công\n🔢 Số lần đoán: ${gameData.attempts}\n💰 Bạn được cộng: ${reward.toLocaleString()}$ vào tài khoản\n🔖 Số điểm đạt được: ${points}\n⏳ Thời gian trả lời: ${Math.floor(timeTaken / 1000)} giây`,
          mentions: mentions
        });
        let leaderboard = await readLeaderboard();
        const existingUser = leaderboard.find(user => user.userID === senderID);
        if (existingUser) {
          existingUser.reward += reward;
          existingUser.points += points;
        } else {
          leaderboard.push({
            userID: senderID,
            name,
            reward,
            points
          });
        }
        leaderboard.sort((a, b) => b.points - a.points);
        leaderboard = leaderboard.slice(0, 10);
        await writeLeaderboard(leaderboard);
        clearGameData(threadID);
      } else {
        await Currencies.decreaseMoney(senderID, answerPenalty);
        gameData.attempts++;
        msg.reply(`🗿 Đoán sai rồi! Bạn bị trừ ${answerPenalty.toLocaleString()}$. Hãy thử lại!`);
      }
    } catch (error) {
      console.error('Error during game event:', error);
      msg.reply(`❎ Đã có lỗi xảy ra, vui lòng thử lại sau`);
    }
  }
};
const getLeaderboard = async () => {
  const leaderboard = await readLeaderboard();
  if (leaderboard.length === 0) {
    return "🏆 Bảng xếp hạng hiện đang trống!";
  }
  const currentTime = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh'
  });
  let leaderboardString = `[ Bảng Xếp Hạng Words Cramble ]\n\n`;
  leaderboardString += leaderboard.map((user, index) => {
    let medal;
    switch (index) {
      case 0:
        medal = "🥇.";
        break;
      case 1:
        medal = "🥈.";
        break;
      case 2:
        medal = "🥉.";
        break;
      default:
        medal = `${index + 1}.`;
        break;
    }
    return `${medal} ${user.name}\n🔢 Tổng điểm: ${user.points}\n💰 Tổng số tiền đã nhận: ${user.reward.toLocaleString()}$`;
  }).join('\n\n');
  leaderboardString += `\n\n⏰ Được cập nhật lúc: ${currentTime}`;
  return leaderboardString;
};