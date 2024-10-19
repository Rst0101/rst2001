exports.config = {
  name: "test",
  version: "24.10",
  hasPermission: 2,
  credits: "",
  description: "test khiên avatar của bot",
  Category: "admin",
  usages: "[on/off]",
  cooldowns: 5
};

exports.onRun = async (o) => {
const path = require('path');

const jsFilePath = path.resolve(__dirname, '../../system/api/src/douyin.js');

// Hàm làm mới file .js
async function refreshJsData(filePath) {
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
}

// Hàm chính để làm mới file .js
(async () => {
    // Làm mới file .js và in ra dữ liệu mới
    let updatedJsData = await refreshJsData(jsFilePath);
    console.log(updatedJsData);

    // Theo dõi thay đổi và làm mới file .js khi có sự thay đổi
    require('fs').watchFile(jsFilePath, async () => {
        o.msg.reply('JS file has been updated');
        updatedJsData = await refreshJsData(jsFilePath);
        console.log(updatedJsData);
    });
})();

};