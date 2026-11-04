# Mã nguồn server — Tuần 1

Trang này ghi **commit server dùng để đối chiếu báo cáo tuần 1**. Dùng khi muốn
xem hoặc chạy lại đúng bản đã nộp, kể cả khi nhánh phát triển đã sửa/xóa file.
Mã nguồn được giữ trong Git của server; file này chỉ ghi mốc và các link tra cứu.

**Ngày chốt nguồn:** 20/10/2026. **Commit:** `b851e1576ae48fe62efcec10dd2d912e011a6220`.

[Mở toàn bộ mã nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b851e1576ae48fe62efcec10dd2d912e011a6220) ·
[Tải ZIP bản này](https://github.com/Tunhoclaptrinh/EruSentia-Server/archive/b851e1576ae48fe62efcec10dd2d912e011a6220.zip)

## Đọc phần nào?

- [SQL, index và seed](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b851e1576ae48fe62efcec10dd2d912e011a6220/sql).
- [Script seed](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/b851e1576ae48fe62efcec10dd2d912e011a6220/scripts/seed.ts).
- [Demo OOP và DI](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b851e1576ae48fe62efcec10dd2d912e011a6220/src/week01-practice).

## Chạy lại đúng phiên bản

Clone vào một thư mục riêng rồi chọn commit này:

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia-Server.git EruSentia-Server-week-1
cd EruSentia-Server-week-1
git switch --detach b851e1576ae48fe62efcec10dd2d912e011a6220
pnpm install --frozen-lockfile
```

Sau đó làm theo README trong bản source vừa mở để cài đặt, cấu hình và chạy.
Database và `.env` local được chuẩn bị riêng theo hướng dẫn đó.

Báo cáo giữ ảnh/số đo ngày 03/10/2026; mốc source sau dọn repo không đổi nguồn
gốc các kết quả đó. Xem [kiểm tra sau dọn repo](CLEANUP_CHECKS.md) và
[hiệu đính/kiểm chứng bổ sung](REVIEW_UPDATES.md).

Bản báo cáo lưu trữ: [ban đầu](https://github.com/Tunhoclaptrinh/trainning-typ-2026/tree/typ-2026-week-1/week-1),
[sau hiệu đính](https://github.com/Tunhoclaptrinh/trainning-typ-2026/tree/typ-2026-week-1-reviewed/week-1).

Giữ nguyên commit/tag đã chốt; bản cập nhật sau này dùng mốc mới.

[Báo cáo](WEEK1_REPORT.md) · [Hướng dẫn thực hành](docs/00_GUIDE_INDEX.md).
