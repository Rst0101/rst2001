const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

this.config = {
  name: "rateimg",
  aliases: ["rateimg"],
  version: "1.2.9",
  role: 0,
  author: "DongDev",
  info: "AI đánh giá hình ảnh của bạn",
  Category: "Công cụ",
  guides: "[]",
  cd: 5,
  hasPrefix: true,
  images: [],
};

const AiRateMyPhoto = async (imageUrl) => {
  return new Promise(async (resolve, reject) => {
    let filePath;
    try {
      if (!imageUrl) {
        return reject("Please provide the Image URL");
      }
      const { headers } = await axios.head(imageUrl);
      const contentType = headers['content-type'];
      const extension = contentType.split('/')[1] || 'bin';
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      filePath = path.join(cacheDir, `${Date.now()}.${extension}`);
      const response = await axios({ method: 'GET', url: imageUrl, responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => writer.on('finish', resolve).on('error', reject));     
      const imageData = fs.readFileSync(filePath, { encoding: "base64" });
      const form = new FormData();
      form.append("imageFile", "");
      form.append("canvasimg", "");
      form.append("image_data", `data:image/jpeg;base64,${imageData}`);
      const { data } = await axios.post("https://rate-my-photo.com/result", form, {
        headers: {
          ...form.getHeaders(),
          authority: "rate-my-photo.com",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
          "cache-control": "max-age=0",
          origin: "https://rate-my-photo.com",
          referer: "https://rate-my-photo.com/",
          "sec-ch-ua": '"Not)A;Brand";v="24", "Chromium";v="116"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
      });
      const $ = cheerio.load(data);
      const score = $(".skill_out .skill.html").first().text().trim().replace(/SCORE: /, "");
      const comparison = $(".skill_out .skill.html").last().text().trim();
      const ratingText = $("p.mt-3").last().text().trim() || null;
      resolve({
        score,
        comparison,
        ratingText,
      });
    } catch (error) {
      reject(error);
    } finally {
      if (filePath) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
          }
        });
      }
    }
  });
};
this.onRun = async (o) => {
  try {
    let url = o.event.messageReply.attachments[0].url;
    let data = await AiRateMyPhoto(url);
    o.msg.reply(`📃 Kết quả đánh giá hình ảnh của bạn:\n\n🔢 Điểm số: ${data.score}\n📊 Tỉ lệ: ${data.comparison}\n💬 Nhận xét: ${(await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(data.ratingText)}`)).data[0][0][0]}`);
  } catch (error) {
    o.msg.reply(`Error: ${error.message}`);
  }
};