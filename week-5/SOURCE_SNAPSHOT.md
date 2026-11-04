# Mã nguồn server — Tuần 5

Trang này ghi **commit server dùng để đối chiếu báo cáo tuần 5**. Dùng khi muốn
xem hoặc chạy lại đúng bản đã nộp, kể cả khi nhánh phát triển đã sửa/xóa file.
Mã nguồn được giữ trong Git của server; file này chỉ ghi mốc và các link tra cứu.

**Ngày chốt nguồn:** 04/11/2026. **Commit:** `70e02a0ea0504b1eb20d26fe935a90ec54b400a9`.

[Mở toàn bộ mã nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/70e02a0ea0504b1eb20d26fe935a90ec54b400a9) ·
[Tải ZIP bản này](https://github.com/Tunhoclaptrinh/EruSentia-Server/archive/70e02a0ea0504b1eb20d26fe935a90ec54b400a9.zip)

## Đọc phần nào?

- [Redis cache](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/70e02a0ea0504b1eb20d26fe935a90ec54b400a9/src/cache).
- [API Template và invalidation](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/70e02a0ea0504b1eb20d26fe935a90ec54b400a9/src/templates).
- [Migration cache revision](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/70e02a0ea0504b1eb20d26fe935a90ec54b400a9/sql/07_template_cache_revision.sql).
- [Kiểm thử cache/PostgreSQL/Redis](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/70e02a0ea0504b1eb20d26fe935a90ec54b400a9/test/cache.integration.test.cjs).
- [Benchmark và thực hành data types](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/70e02a0ea0504b1eb20d26fe935a90ec54b400a9/scripts).

## Chạy lại đúng phiên bản

Clone vào một thư mục riêng rồi chọn commit này:

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia-Server.git EruSentia-Server-week-5
cd EruSentia-Server-week-5
git switch --detach 70e02a0ea0504b1eb20d26fe935a90ec54b400a9
pnpm install --frozen-lockfile
```

Sau đó làm theo README trong bản source vừa mở để cài đặt, cấu hình và chạy.
Database và `.env` local được chuẩn bị riêng theo hướng dẫn đó.

Báo cáo lưu trữ tại [tag `typ-2026-week-5`](https://github.com/Tunhoclaptrinh/trainning-typ-2026/tree/typ-2026-week-5/week-5).

Giữ nguyên commit/tag đã chốt; bản cập nhật sau này dùng mốc mới.

[Báo cáo](WEEK5_REPORT.md) · [Hướng dẫn thực hành](docs/00_GUIDE_INDEX.md).
