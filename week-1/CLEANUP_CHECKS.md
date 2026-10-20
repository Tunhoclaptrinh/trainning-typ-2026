# Kiểm tra sau khi dọn repo tuần 1

Ngày kiểm tra: 20/10/2026. Commit mã nguồn backend được kiểm tra: `52a5fd7`. Kết quả này bổ sung cho báo cáo thực hành ngày 03/10/2026; không thay thế các số đo và ảnh lịch sử trong báo cáo đó.

## Phân chia nội dung

- Repo TYP giữ báo cáo, 8 chuyên đề lý thuyết, hướng dẫn và 12 ảnh minh chứng.
- Repo [EruSentia-Server](https://github.com/Tunhoclaptrinh/EruSentia-Server) giữ SQL, domain models, script database, demo OOP/DI và kiểm thử CLI.
- Các bản SQL và demo TypeScript trùng ở TYP đã được đối chiếu nội dung trước khi loại bỏ.
- Bản nháp tuần 2 đang tạm cất; chưa nhập vào backend.

## Môi trường kiểm tra

- Node.js 24.21.0, pnpm 12.11.2.
- PostgreSQL 18.6 từ gói Ubuntu, chạy trong thư mục tạm và chỉ nghe loopback.
- Docker daemon không sẵn có trong môi trường kiểm tra. Cấu hình Compose của dự án vẫn dùng PostgreSQL 16; lần kiểm tra này chưa xác nhận lại bằng image PostgreSQL 16 đó.
- Database thử nghiệm được khởi tạo mới, dừng và xóa sau khi kiểm tra; không dùng database hoặc volume phát triển hiện có.

## Kết quả

| Kiểm tra | Kết quả |
|---|---|
| `pnpm typecheck` | Đạt |
| `pnpm build` | Đạt; entry point là `dist/src/main.js` |
| `pnpm test` | 6/6 test đạt: thiếu đối số, thiếu file SQL và lỗi kết nối của các CLI |
| `pnpm demo:oop`, `pnpm demo:di` | Chạy hoàn tất; repository Postgres trong demo DI là mô phỏng |
| Manifest và lockfile pnpm | Kiểm tra frozen lockfile đạt, không tải hoặc thực thi package |
| Markdown | 61 liên kết nội bộ và giữa hai repo hợp lệ trước khi thêm trang kết quả này |
| Schema và index | Tạo đủ 9 bảng nghiệp vụ |
| Seed lần đầu | 1.012 template, 10 user, 8 category |
| Seed lần hai | Vẫn 1.012 template; thêm 0 template benchmark |
| `db:check` và entry point đã build | Kết nối thành công, trả exit code 0 và đóng pool |
| Benchmark | Cả hai truy vấn `EXPLAIN ANALYZE` chạy thành công |
| SQL sai tên bảng | Trả exit code 1 |
| Benchmark trên database chưa có schema | Trả exit code 1 |
| Seed gặp lỗi giữa chừng | Trả exit code 1; cập nhật seed mẫu và insert benchmark cùng rollback |

Để kiểm tra rollback, database tạm được gắn trigger gây lỗi khi insert template có tag `benchmark`. Một title của seed mẫu được đặt thành giá trị kiểm chứng trước khi chạy seed. Sau lỗi, title vẫn giữ giá trị đó và tổng template vẫn là 1.012, xác nhận các thay đổi trước lỗi không được commit.

## Tái hiện với Docker PostgreSQL 16

Chạy từ repo backend, dùng database phát triển dành riêng cho việc kiểm thử:

```bash
pnpm install --frozen-lockfile
docker compose -f docker/docker-compose.dev.yml up -d
pnpm db:check
pnpm db:schema
pnpm db:indexes
pnpm db:seed
pnpm db:seed
pnpm db:benchmark
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Nếu database đã có thêm dữ liệu từ các lần thực hành khác, tổng số bản ghi có thể cao hơn. So sánh số lượng trước và sau lần seed thứ hai để kiểm tra tính không nhân đôi dữ liệu.
