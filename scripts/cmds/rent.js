const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const crypto = require('crypto');
const RENT_DATA_PATH = path.join(__dirname, '../../system/data/rent.json');
const RENT_KEY_PATH = path.join(__dirname, '../../system/data/rent_key.json');
const TIMEZONE = 'Asia/Ho_Chi_Minh';
let data = fs.existsSync(RENT_DATA_PATH) ? JSON.parse(fs.readFileSync(RENT_DATA_PATH, 'utf8')) : [];
let keys = fs.existsSync(RENT_KEY_PATH) ? JSON.parse(fs.readFileSync(RENT_KEY_PATH, 'utf8')) : {};
const saveData = () => fs.writeFileSync(RENT_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
const saveKeys = () => fs.writeFileSync(RENT_KEY_PATH, JSON.stringify(keys, null, 2), 'utf8');
const formatDate = input => input.split('/').reverse().join('/');
const isInvalidDate = date => isNaN(new Date(date).getTime());
function generateKey() {
    const randomString = crypto.randomBytes(6).toString('hex').slice(0, 6);
    return `seiko_${randomString}`.toLowerCase();
}
this.config = {
    name: 'rent',
    aliases: ["thuebot"],
    version: '1.0.1',
    role: 3,
    author: 'DC-Nam',
    info: 'Thuê bot',
    Category: 'Admin',
    guides: '[]',
    cd: 3,
    hasPrefix: true,
    images: []
};
this.onRun = async function(o) {
    const send = (msg, callback) => o.api.sendMessage(msg, o.event.threadID, callback, o.event.messageID);
    const prefix = global.config.PREFIX;
    const dataThread = (await o.Threads.getData(o.event.threadID)).threadInfo;
    switch (o.args[0]) {
        case 'add':
            if (!o.args[1]) return send(`❎ Dùng ${prefix}${this.config.name} add + reply tin nhắn người cần thuê`);
            let userId = o.event.senderID;
            if (o.event.type === "message_reply") {
                userId = o.event.messageReply.senderID;
            } else if (Object.keys(o.event.mentions).length > 0) {
                userId = Object.keys(o.event.mentions)[0];
            }
            let t_id = o.event.threadID;
            let time_start = moment.tz(TIMEZONE).format('DD/MM/YYYY');
            let time_end = o.args[1];
            if (o.args.length === 4 && !isNaN(o.args[1]) && !isNaN(o.args[2]) && o.args[3].match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
                t_id = o.args[1];
                userId = o.args[2];
                time_end = o.args[3];
            } else if (o.args.length === 3 && !isNaN(o.args[1]) && o.args[2].match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
                userId = o.args[1];
                time_end = o.args[2];
            }
            if (isNaN(userId) || isNaN(t_id) || isInvalidDate(formatDate(time_start)) || isInvalidDate(formatDate(time_end)))
                return send(`❎ ID hoặc Thời Gian Không Hợp Lệ!`);
            const existingData = data.find(entry => entry.t_id === t_id);
            if (existingData) {
                return send(`⚠️ Nhóm này đã có dữ liệu thuê bot!`);
            }
            data.push({ t_id, id: userId, time_start, time_end });
            send(`✅ Đã thêm dữ liệu thuê bot cho nhóm!`);
            break;
        case 'list':
    if (data.length === 0) {
        send('❎ Không có nhóm nào đang thuê bot!');
        break;
    }   
    const formattedData = await Promise.all(data.map(async (item, i) => {
        const { threadName } = (await o.Threads.getData(item.t_id)).threadInfo;
        return `${i + 1}. ${global.data.userName.get(item.id)}\n⩺ Tình trạng: ${new Date(formatDate(item.time_end)).getTime() >= Date.now() ? '✅' : '❎'}\n⩺ Nhóm: ${threadName || 'Không xác định'}`;
    }));    
    send(`[ DANH SÁCH THUÊ BOT ]\n\n${formattedData.join('\n\n')}\n\n⩺ Reply [ del | out | giahan ] + stt`, (err, res) => {
        res.name = exports.config.name;
        res.event = o.event;
        res.data = data;
        global.Seiko.onReply.push({ ...res, type: 'list' });
    });
    break;
        case 'del':
            if (o.args.length < 2) return send(`❎ Bạn phải cung cấp chỉ số hoặc ID nhóm để xóa!`);
            const identifier = o.args[1];
            if (identifier.length > 4) { 
                const originalLength = data.length;
                data = data.filter(entry => entry.t_id !== identifier);
                for (const key in keys) {
                    if (keys[key].groupId === identifier) {
                        delete keys[key];
                    }
                }
                send(data.length < originalLength ? `✅ Đã xóa thành công nhóm có id: ${identifier}` : `❎ Không tìm thấy dữ liệu nào với id nhóm: ${identifier}`);
            } else {
                const index = parseInt(identifier) - 1;
                if (index >= 0 && index < data.length) {
                    const groupId = data[index].t_id;
                    data.splice(index, 1);
                    for (const key in keys) {
                        if (keys[key].groupId === groupId) {
                            delete keys[key];
                        }
                    }
                    send(`✅ Xóa thành công nhóm có thứ tự ${identifier}`);
                } else {
                    send(`❎ Thứ tự không hợp lệ!`);
                }
            }
            break;
        case 'info':
            const rentInfo = data.find(entry => entry.t_id === o.event.threadID); 
            if (!rentInfo) {
                send(`❎ Không có dữ liệu thuê bot cho nhóm này`); 
            } else {
                const keyInfo = Object.entries(keys).find(([key, info]) => info.groupId === rentInfo.t_id) || ['Chưa có key', {}];
                const [key, keyDetails] = keyInfo;
                send(`[ Thông Tin Thuê Bot ]\n\n⩺ Người thuê: ${global.data.userName.get(rentInfo.id)}\n⩺ Link facebook: https://www.facebook.com/profile.php?id=${rentInfo.id}\n⩺ Ngày Thuê: ${rentInfo.time_start}\n⩺ Hết Hạn: ${rentInfo.time_end}\n⩺ Key: ${key}\n⩺ Còn ${Math.floor((new Date(formatDate(rentInfo.time_end)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày ${Math.floor((new Date(formatDate(rentInfo.time_end)).getTime() - Date.now()) / (1000 * 60 * 60) % 24)} giờ là hết hạn`);
            } 
            break;
        case 'key':
    let quantity, months;
    const arg1 = o.args[1];
    const arg2 = o.args[2];
    if (arg1 && arg1.match(/^\d+m$/)) {
        quantity = 1;
        months = parseInt(arg1.replace('m', ''));
    } else {
        quantity = parseInt(arg1) || 1;
        months = arg2 ? (arg2.match(/(\d+)m/) ? parseInt(arg2.replace('m', '')) : 1) : 1;
    }
    const expiryDate = moment.tz(TIMEZONE).add(months, 'months').format('DD/MM/YYYY');
    if (isNaN(quantity) || isNaN(months) || isInvalidDate(formatDate(expiryDate))) {
        return send(`❎ Số lượng hoặc ngày hết hạn không hợp lệ!`);
    }
    const generatedKeysArray = [];
    for (let i = 0; i < quantity; i++) {
        const generatedKey = generateKey();
        keys[generatedKey] = {
            expiryDate: expiryDate,
            used: false,
            groupId: null
        };
        generatedKeysArray.push(generatedKey);
    }    
    const generatedKeys = `🔑 New key:\n${generatedKeysArray.join('\n')}\n📆 Ngày hết hạn: ${expiryDate}`;
    send(generatedKeys.trim());
    saveKeys();
    break;
        case 'check':
            if (Object.keys(keys).length === 0) {
                send('❎ Không có key nào được tạo!');
                break;
            }
            send(`[ DANH SÁCH KEY ]\n\n${Object.entries(keys).map(([key, info], i) => 
                `${i + 1}. Key: ${key}\n⩺ Ngày hết hạn: ${info.expiryDate}\n⩺ Đã dùng: ${info.used ? '✅' : '❎'}`
            ).join('\n\n')}\n\n⩺ Reply [ del ] + stt key để xóa`, (err, res) => {
                res.name = exports.config.name;
                res.event = o.event;
                res.keys = keys;
                global.Seiko.onReply.push({ ...res, type: 'keys' });
            });
            break;
        default:
            send(`❎ Lựa chọn không hợp lệ!`);
            break;
    }
    saveData();
};
this.onReply = async function(o) {
    const _ = o.onReply;
    const send = (msg, callback) => o.api.sendMessage(msg, o.event.threadID, callback, o.event.messageID);
    if (!global.config.NDH.includes(o.event.senderID)) return;
    if (o.event.senderID !== _.event.senderID) return;
    const dataThread = (await o.Threads.getData(o.event.threadID)).threadInfo;
    const args = o.event.body.split(' ');
    const command = args.shift().toLowerCase();
    function sendToGroup(groupId, message) {
        o.api.sendMessage(message, groupId);
    }
    function isInvalidDate(date) {
        return !moment(date, 'DD/MM/YYYY', true).isValid();
    }
    function formatDate(date) {
        return moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    }
    if (_.type === 'keys') {
        o.msg.unsend(_.event.messageID);
        if (command === 'del') {
            if (args[0] === 'all') {
                const deletedKeys = [];
                for (const key in keys) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].key === key) {
                            data.splice(i, 1);
                            break;
                        }
                    }
                    deletedKeys.push(key);
                    delete keys[key];
                }
                send(`✅ Đã xóa tất cả các key: ${deletedKeys.join(', ')}`);
                saveKeys();
            } else {
                const keyIndices = args.map(num => parseInt(num) - 1).filter(index => !isNaN(index) && index >= 0);
                const keyEntries = Object.entries(_.data);
                let invalidIndices = [];
                let deletedKeys = [];
                keyIndices.forEach(keyIndex => {
                    if (keyIndex >= 0 && keyIndex < keyEntries.length) {
                        const [key, keyInfo] = keyEntries[keyIndex];
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].key === key) {
                                data.splice(i, 1);
                                break;
                            }
                        }
                        deletedKeys.push(key);
                        delete keys[key];
                    } else {
                        invalidIndices.push(keyIndex + 1);
                    }
                });
                if (invalidIndices.length > 0) {
                    send(`❎ Các số thứ tự không tồn tại: ${invalidIndices.join(', ')}`);
                } else {
                    send(`✅ Đã xóa các key: ${deletedKeys.join(', ')}`);
                }
                saveKeys();
            }
        } else {
            send(`❎ Lệnh không hợp lệ!`);
        }
    } else {
        switch (command) {
            case 'del':
                args.sort((a, b) => b - a).forEach($ => {
                    const groupId = data[$ - 1].t_id;
                    data.splice($ - 1, 1);
                    for (const key in keys) {
                        if (keys[key].groupId === groupId) {
                            delete keys[key];
                        }
                    }
                });
                send(`✅ Đã xóa thành công!`);
                saveKeys();
                break;
            case 'giahan':
                let time_start = moment.tz(TIMEZONE).format('DD/MM/YYYY'); 
                const [STT, time_end] = args;
                if (isInvalidDate(formatDate(time_end))) return send(`❎ Thời Gian Không Hợp Lệ!`);
                if (!data[STT - 1]) return send(`❎ Số thứ tự không tồn tại`);
                const groupId = data[STT - 1].t_id;
                const groupName = (global.data.threadInfo.get(groupId) || {}).threadName || 'Unknown Group';
                const startDate = moment(time_start, 'DD/MM/YYYY');
                const endDate = moment(time_end, 'DD/MM/YYYY');
                const duration = endDate.diff(startDate, 'days');
                Object.assign(data[STT - 1], { time_start, time_end });
                send(`✅ Đã gia hạn cho nhóm ${groupName} với thời hạn ${duration} ngày, kết thúc vào ngày ${time_end}`);
                sendToGroup(groupId, `[ Thông Báo ]\n\n📌 Nhóm của bạn đã được Admin gia hạn thêm ${duration} ngày\n⏰ Sẽ kết thúc vào ngày: ${time_end}`);
                break;
            case 'out':
                let outGroups = [];
                for (const i of args) {
                    const index = parseInt(i) - 1;
                    if (!isNaN(index) && index >= 0 && index < data.length) {
                        const groupId = data[index].t_id;
                        const groupName = (global.data.threadInfo.get(groupId) || {}).threadName || 'Unknown Group';
                        outGroups.push(`${groupName} (ID: ${groupId})`);
                        data.splice(index, 1);
                        for (const key in keys) {
                            if (keys[key].groupId === groupId) {
                                delete keys[key];
                            }
                        }
                        await o.api.removeUserFromGroup(o.api.getCurrentUserID(), groupId);
                    }
                }
                if (outGroups.length > 0) {
                    send(`✅ Đã out khỏi các nhóm: ${outGroups.join(', ')}`);
                } else {
                    send(`❎ Không có nhóm nào được out.`);
                }
                saveKeys();
                saveData();
                break;
            default:
                send(`❎ Lệnh không hợp lệ!`);
                break;
        }
    }
    saveData();
};
this.onEvent = async function(o) {
    const s = (msg, callback) => o.api.sendMessage(msg, o.event.threadID, callback, o.event.messageID);
    const m = o.event.body.toLowerCase();
    const g = o.event.threadID;
    function c(t) {
        const v = 7;
        const u = t.getTime() + (t.getTimezoneOffset() * 60000);
        return new Date(u + (3600000 * v));
    }
    function f(d, format = 'DD/MM/YYYY') {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        return format.replace('DD', day).replace('MM', month).replace('YYYY', year).replace('HH', hours).replace('mm', minutes).replace('ss', seconds);
    }
    if (/^seiko_[a-z0-9]{6}$/.test(m)) {
        if (keys.hasOwnProperty(m)) {
            const k = keys[m];
            const e = data.find(entry => entry.t_id === g);
            if (e) {
                return s(`❎ Nhóm này đã có dữ liệu thuê bot!`);
            }
            if (!k.used) {
                const n = new Date();
                const v = c(n);
                const ts = f(v);
                const edParts = k.expiryDate.split('/');
                const ed = new Date(edParts[2], edParts[1] - 1, edParts[0]);
                const te = f(ed);
                const diffTime = ed.getTime() - v.getTime();
                const diffSeconds = Math.ceil(diffTime / 1000);
                const days = Math.floor(diffSeconds / (24 * 3600));
                const hours = Math.floor((diffSeconds % (24 * 3600)) / 3600);
                const minutes = Math.floor((diffSeconds % 3600) / 60);
                const seconds = diffSeconds % 60;
                let ep = '';
                if (days > 0) ep += `${days} ngày `;
                if (hours > 0) ep += `${hours} giờ `;
                if (minutes > 0) ep += `${minutes} phút `;
                if (seconds > 0) ep += `${seconds} giây`;
                data.push({ t_id: g, id: o.event.senderID, time_start: ts, time_end: te });
                k.used = true;
                k.groupId = g;
                const gi = global.data.threadInfo.get(g);
                const gn = gi ? gi.threadName : 'Không rõ';
                const un = global.data.userName.get(o.event.senderID) || 'Không rõ';
                s(`✅ Kích hoạt thuê bot cho nhóm: ${gn}\n📆 Ngày hết hạn: ${te} - còn ${ep.trim()}`);
                o.api.sendMessage(`🔔 Key Thuê Bot Được Kích Hoạt 🔔\n\n⏰ Thời gian: ${f(v, 'DD/MM/YYYY || HH:mm:ss')}\n👤 Người kích hoạt: ${un}\n🌐 Nhóm: ${gn}\n🔑 Key: ${m}\n📆 Ngày hết hạn: ${te} - còn ${ep.trim()}`, global.config.NDH[0]);
                saveData();
                saveKeys();
            } else {
                return s(`❎ Key đã được kích hoạt cho nhóm: ${k.groupId}`);
            }
        } else {
            return s(`❎ Key không hợp lệ!`);
        }
    }
};