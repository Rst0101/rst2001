this.config = {
    name: "tv",
    aliases: ["tuvi"],
    version: "1.0.1",
    role: 0,
    author: "Dũngkon", 
    info: "Xem tử vi",
    Category: "Tiện ích",
    guides: "ntns | giới tính",
    cd: 5,
    hasPrefix: true,
    images: []
};
this.onRun = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const moment = require("moment-timezone");
    const axios = require('axios').default;
    const cheerio = require('cheerio');
    const [
        date,
        gt
    ] = args.join(" ").trim().split(" | ");
    if (!date) return api.sendMessage(`Thiếu ngày tháng năm sinh`, event.threadID, event.messageID);
    if (!gt) return api.sendMessage(`Thiếu giới tính (1 là nam 2 là nữ)`, event.threadID, event.messageID);
    const options = {
        method: 'POST',
        url: 'https://lichngaytot.com/ajax/tuvitrondoi',
        headers: {
            "accept": "text/html, */*; q=0.01",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "_uidcms=1719838728158812014; __gads=ID=efeab3ae83d56d21:T=1719838728:RT=1719838728:S=ALNI_MbxLKiTTuoMXrZ7g5KVCuZC7LTcMA; __gpi=UID=00000e6e3dd5dc35:T=1719838728:RT=1719838728:S=ALNI_MaDlCNVyejrTc-ipYL8ZC9_wccdUQ; __eoi=ID=dfe0656761a1834f:T=1719838728:RT=1719838728:S=AA-AfjbUaI8ZAwsauxY0v6c1nQX3; _ga_65BBX8EG5Q=GS1.1.1719838728.1.0.1719838728.60.0.0; __RC=45; __R=2; __uif=__uid%3A241983872920265296%7C__create%3A1719838729; _ga=GA1.2.1349205141.1719838728; _gid=GA1.2.1886603788.1719838729; _dc_gtm_UA-10655998-26=1; _pbjs_userid_consent_data=3524755945110770; _admchkCK=1; __uidac=3478a4cc2e0c5d9a8d3391ed395ec406; MgidStorage=%7B%220%22%3A%7B%22svspr%22%3A%22https%3A%2F%2Fl.facebook.com%2F%22%2C%22svsds%22%3A1%7D%2C%22C1329179%22%3A%7B%22page%22%3A1%2C%22time%22%3A%221719838731257%22%7D%7D; FCNEC=%5B%5B%22AKsRol9n0QG6scBhE9-tiT7UASu7lMg6ggoVuDi4KgMb7W-zRbUOOYS7Dn-X1Hsb0FJumDwo5fUDzcjFKGaOiTDL90pH9iNwubJbxtnPYRGdj0jO1aqAKiAwgv5VI8LN5GB3TgcRZwd2ixFPdpnNvrXdU6J2cRZNiQ%3D%3D%22%5D%5D; cto_bundle=_K2VJl9OM1YySlhya2ZYallQSiUyRjIyNzlxOXg2VDRBdHNzMXYyJTJCbDE5dHB1Ykp5cm1odW0wcGJMWmglMkYwNk5GSXhyMjBOZ2hCa01aZlpUeHpPMCUyQjh0YU9jUlZPeHNZQkRsdmQlMkZCejNMbzlpaTJ1a0lrOWhDRldLRWRTaSUyRlpTUE9ia0ZFRQ; cto_bidid=Srf_219qYkhrS0lIYmpFU0dpSmtNOGJIdSUyRjZmbHg0dUNJNGFXRU9NcGc0WXg1ZXVHTDQ2WkZacXVUVmhvcXlNRWhKVEk5aVVGSWZnR2xSbEhNMHVqb090b01BJTNEJTNE",
            "Referer": "https://lichngaytot.com/tu-vi-tron-doi.html?fbclid=IwZXh0bgNhZW0CMTAAAR2znQ0oB1f__-zxfEUPdqxC6gNA9sRBAEmWibdDXfE5dIT_tn1ncDnrFGo_aem_YmJ7FEhztNQhj6RbOL8Rvg",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        data: {
            strDateOfBirth: date,
            strGenderId: gt
        }
    };
    try {
        const response = await axios.request(options);
        const responseData = response.data;
        const $ = cheerio.load(responseData);
        const textData = $('body').text().trim();
        const cleanedData = textData.replace(/var parent = \$('.boxs_sao_han');\s*\$\('.canchi', parent\)\.html\('.*?'\);\s*\$\('.yearView', parent\)\.text\(.*?\);/g, '').trim();
        const sections = cleanedData.split('\n').filter(line => line.trim() !== '');
        const formattedData = sections.map(section => section.trim()).join('\n\n');
        return api.sendMessage(`${formattedData}`, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        return api.sendMessage(`Có lỗi xảy ra khi tải dữ liệu từ API`, event.threadID, event.messageID);
    }
};