# Mã nguồn server — Tuần 4

Trang này ghi **commit server dùng để đối chiếu báo cáo tuần 4**. Dùng khi muốn
xem hoặc chạy lại đúng bản đã nộp, kể cả khi nhánh phát triển đã sửa/xóa file.
Mã nguồn được giữ trong Git của server; file này chỉ ghi mốc và các link tra cứu.

**Ngày chốt nguồn:** 04/11/2026. **Commit:** `4c46b30d4bc87c70d1341e6a45737ad97b988283`.

[Mở toàn bộ mã nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/4c46b30d4bc87c70d1341e6a45737ad97b988283) ·
[Tải ZIP bản này](https://github.com/Tunhoclaptrinh/EruSentia-Server/archive/4c46b30d4bc87c70d1341e6a45737ad97b988283.zip)

## Đọc phần nào?

- [Outbox, RabbitMQ và welcome worker](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/4c46b30d4bc87c70d1341e6a45737ad97b988283/src/messaging).
- [Đăng ký và ghi outbox trong transaction](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/4c46b30d4bc87c70d1341e6a45737ad97b988283/src/auth/persistence/postgres-auth.store.ts).
- [Migration queue](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/4c46b30d4bc87c70d1341e6a45737ad97b988283/sql/06_message_queue.sql).
- [Docker RabbitMQ/Mailpit](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/4c46b30d4bc87c70d1341e6a45737ad97b988283/docker/docker-compose.queue.yml).
- [Kiểm thử queue/SMTP](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/4c46b30d4bc87c70d1341e6a45737ad97b988283/test/messaging.integration.test.cjs).

## Chạy lại đúng phiên bản

Clone vào một thư mục riêng rồi chọn commit này:

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia-Server.git EruSentia-Server-week-4
cd EruSentia-Server-week-4
git switch --detach 4c46b30d4bc87c70d1341e6a45737ad97b988283
pnpm install --frozen-lockfile
```

Sau đó làm theo README trong bản source vừa mở để cài đặt, cấu hình và chạy.
Database và `.env` local được chuẩn bị riêng theo hướng dẫn đó.

Báo cáo lưu trữ tại [tag `typ-2026-week-4`](https://github.com/Tunhoclaptrinh/trainning-typ-2026/tree/typ-2026-week-4/week-4).

Giữ nguyên commit/tag đã chốt; bản cập nhật sau này dùng mốc mới.

[Báo cáo](WEEK4_REPORT.md) · [Hướng dẫn thực hành](docs/00_GUIDE_INDEX.md).
