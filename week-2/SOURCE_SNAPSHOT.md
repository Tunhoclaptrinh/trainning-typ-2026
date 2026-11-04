# Mã nguồn server — Tuần 2

Trang này ghi **commit server dùng để đối chiếu báo cáo tuần 2**. Dùng khi muốn
xem hoặc chạy lại đúng bản đã nộp, kể cả khi nhánh phát triển đã sửa/xóa file.
Mã nguồn được giữ trong Git của server; file này chỉ ghi mốc và các link tra cứu.

**Ngày chốt nguồn:** 04/11/2026. **Commit:** `b9017f77f6b97a4935fd72d22f2e149f32c4b649`.

[Mở toàn bộ mã nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b9017f77f6b97a4935fd72d22f2e149f32c4b649) ·
[Tải ZIP bản này](https://github.com/Tunhoclaptrinh/EruSentia-Server/archive/b9017f77f6b97a4935fd72d22f2e149f32c4b649.zip)

## Đọc phần nào?

- [API Template, DTO và TypeORM](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b9017f77f6b97a4935fd72d22f2e149f32c4b649/src/templates).
- [Kiểm thử API/database](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b9017f77f6b97a4935fd72d22f2e149f32c4b649/test).
- [Collection và cấu hình Postman](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b9017f77f6b97a4935fd72d22f2e149f32c4b649/tools/postman).

## Chạy lại đúng phiên bản

Clone vào một thư mục riêng rồi chọn commit này:

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia-Server.git EruSentia-Server-week-2
cd EruSentia-Server-week-2
git switch --detach b9017f77f6b97a4935fd72d22f2e149f32c4b649
pnpm install --frozen-lockfile
```

Sau đó làm theo README trong bản source vừa mở để cài đặt, cấu hình và chạy.
Database và `.env` local được chuẩn bị riêng theo hướng dẫn đó.

Kết quả HTTP/DB/Postman thuộc lượt 03/11/2026. Swagger được bổ sung và kiểm tra
riêng ngày 04/11/2026; không coi đó là lượt chạy lại PostgreSQL. Chi tiết nằm
trong [báo cáo](WEEK2_REPORT.md).

Giữ nguyên commit/tag đã chốt; bản cập nhật sau này dùng mốc mới.

[Báo cáo](WEEK2_REPORT.md) · [Hướng dẫn thực hành](docs/00_GUIDE_INDEX.md).
