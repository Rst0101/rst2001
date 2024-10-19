module.exports = class {
    static config = {
        name: "checkpn",
        aliases: ["violation"],
        version: "1.0.0",
        role: 0,
        author: "DongDev",
        info: "Kiểm tra phạt nguội phương tiện giao thông",
        Category: "Công cụ",
        guides: "checkpn + biển kiểm soát",
        cd: 5,
        hasPrefix: true,
        images: []
    };
    static async onRun({ api, event, msg, args }) {
        let bsx = args.join(' ');
        let data = await global.api.violation(bsx);
        const violationsDetails = data.violations.map((violation, index) => {
        return `🛑 Vi phạm ${index + 1}:\n ⩺ Trạng thái: ${violation.trang_thai}\n ⩺ Biển kiểm soát: ${violation.bien_kiem_sat}\n ⩺ Màu biển: ${violation.mau_bien}\n ⩺ Loại phương tiện: ${violation.loai_phuong_tien}\n ⩺ Thời gian vi phạm: ${violation.thoi_gian_vi_pham}\n ⩺ Địa điểm vi phạm: ${violation.dia_diem_vi_pham}\n ⩺ Hành vi vi phạm: ${violation.hanh_vi_vi_pham}\m ⩺ Đơn vị phát hiện vi phạm: ${violation.don_vi_phat_hien_vi_pham}\n ⩺ Nơi giải quyết vụ việc: ${violation.noi_giai_quyet_vu_viec}\n ⩺ Số điện thoại: ${violation.so_dien_thoai}\n ⩺ Mức phạt: ${violation.muc_phat}`}).join('\n');
        msg.reply(`🚧 Biển số xe: ${data.biensoxe}\n🔢 Tổng số vi phạm: ${data.totalViolations}\n📊 Dữ liệu mới nhất: ${data.is_new ? 'Có' : 'Không'}\n${violationsDetails}\n🚨 Số vi phạm đã xử lý: ${data.handledCount}\n⛔ Số vi phạm chưa xử lý: ${data.unhandledCount}\n⏰ Cập nhật lúc: ${data.updated_at}`);
    }
}