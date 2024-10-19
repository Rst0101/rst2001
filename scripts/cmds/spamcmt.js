var axios = require("axios");
var count = 0;
var stopSpam = false;

module.exports.config = {
 name: 'spamcmt',
 aliases: ["spamcmt"],
 version: '1.0.0',
 author: 'DongDev',
 role: 3,
 info: 'Spam Comment trên Bài đăng Facebook',
 Category: 'Tiện ích',
 guides: '[quantity]',
 cd: 5,
 hasPrefix: true,
 images: []
};

module.exports.onRun = async ({ api, event, args }) => {
 var { threadID } = event;
 if (args[0] === 'stop') {
 stopSpam = true;
 return api.sendMessage("Done", event.threadID);
 }
 var join = args.join(" ");
 var id = join[0];
 var cookie = global.account.cookie;
 var content = ['Hi', 'Tương tác nha', 'Bú', 'Nonnn', 'Như nhồnnnn', 'Nhonnn nhặccccc', 'kkk', 'Siuuuu', 'anh nì dz', 'ghe', 'ttt', 'ttql', 'em chào anh', 'hi daica', 'hello ae', 'chao anh', 'tt nào ae', 'hehehe', 'hotboy', 'adu vip', 'ghê đấy', 'alo có tiền k', 'em xin tool', 'em xin tool ạ', 'rep ib em', 'rep em', 'anh ơi em hỏi tý', 'hi anh', 'hello anh', 'chào anh', 'uây ghê', 'vip', 'khá quá nhờ', 'à nhon xê ô'];
 var solan = 10;
 var headers = {
 'Connection': 'keep-alive',
 'Content-Type': 'application/x-www-form-urlencoded',
 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
 'Accept-language': 'en-US,en;q=0.9',
 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
 'Origin': 'https://d.facebook.com',
 'Cookie': cookie,
 'Host': 'd.facebook.com',
 'Sec-Fetch-Mode': 'navigate',
 'Sec-Fetch-Dest': 'document',
 'Sec-Fetch-Site': 'same-origin'
 };
 try {
 var profileResponse = await axios.get('https://d.facebook.com/profile.php', { headers });
 var name = profileResponse.data.split('<title>')[1].split('</title>')[0];
 var uid = headers['Cookie'].split('c_user=')[1].split(';')[0];
 var fb = profileResponse.data.split('<input type="hidden" name="fb_dtsg" value="')[1].split('"')[0];
 var ja = profileResponse.data.split('<input type="hidden" name="jazoest" value="')[1].split('"')[0];
 var spamDetails = setInterval(Data, 5 * 1000);
 function Data() {
if (count == solan || stopSpam) {
 api.sendMessage(`[ THÀNH CÔNG ] → Đã đủ ${solan} lần bình luận bạn yêu cầu`, threadID);
 clearInterval(spamDetails);
 return;
}
 var form = {
 fb_dtsg: fb,
 jazoest: ja,
 comment_text: content[Math.floor(Math.random() * content.length)]
 };
 axios.post(`https://d.facebook.com/a/comment.php?ft_ent_identifier=${id}`, form, { headers })
 .then(results => {
 var title = results.data.split('<title>')[1].split('</title>')[0];
 count++;
 })
 .catch(error => {
 api.sendMessage(`[ LỖI ] → Tài khoản của bạn có thể đã bị khóa hoặc bị chặn tính năng. Vui lòng kiểm tra lại...`, threadID);
 clearInterval(spamDetails);
 });
 }
 } catch (error) {
 console.error(error);
 api.sendMessage(`[ LỖI ] → Đã xảy ra lỗi trong quá trình thực hiện. Vui lòng kiểm tra lại...`, threadID);
 }
};