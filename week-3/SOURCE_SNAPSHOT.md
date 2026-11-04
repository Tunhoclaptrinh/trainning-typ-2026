# Mã nguồn server — Tuần 3

Trang này ghi **commit server dùng để đối chiếu báo cáo tuần 3**. Dùng khi muốn
xem hoặc chạy lại đúng bản đã nộp, kể cả khi nhánh phát triển đã sửa/xóa file.
Mã nguồn được giữ trong Git của server; file này chỉ ghi mốc và các link tra cứu.

**Ngày chốt nguồn:** 04/11/2026. **Commit:** `d5c845891a28094b7fc935573509e904d4c8b09b`.

[Mở toàn bộ mã nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/d5c845891a28094b7fc935573509e904d4c8b09b) ·
[Tải ZIP bản này](https://github.com/Tunhoclaptrinh/EruSentia-Server/archive/d5c845891a28094b7fc935573509e904d4c8b09b.zip)

## Đọc phần nào?

- [Auth, JWT, guards và session stores](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/d5c845891a28094b7fc935573509e904d4c8b09b/src/auth).
- [Migration refresh sessions](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/d5c845891a28094b7fc935573509e904d4c8b09b/sql/05_auth_sessions.sql).
- [Kiểm thử auth/CRUD/PostgreSQL](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/d5c845891a28094b7fc935573509e904d4c8b09b/test).

## Chạy lại đúng phiên bản

Clone vào một thư mục riêng rồi chọn commit này:

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia-Server.git EruSentia-Server-week-3
cd EruSentia-Server-week-3
git switch --detach d5c845891a28094b7fc935573509e904d4c8b09b
pnpm install --frozen-lockfile
```

Sau đó làm theo README trong bản source vừa mở để cài đặt, cấu hình và chạy.
Database và `.env` local được chuẩn bị riêng theo hướng dẫn đó.

Báo cáo lưu trữ tại [tag `typ-2026-week-3`](https://github.com/Tunhoclaptrinh/trainning-typ-2026/tree/typ-2026-week-3/week-3).

Giữ nguyên commit/tag đã chốt; bản cập nhật sau này dùng mốc mới.

[Báo cáo](WEEK3_REPORT.md) · [Hướng dẫn thực hành](docs/00_GUIDE_INDEX.md).
