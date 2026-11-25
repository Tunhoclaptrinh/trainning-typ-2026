# Tuần 6 — hướng dẫn chuẩn bị bài nộp

Tài liệu này là checklist chuẩn bị, không khẳng định bài đã được nộp, repo đã được công khai hoặc mentor đã truy cập được. Yêu cầu gốc và cách gửi: [issue hướng dẫn của khóa](https://github.com/quanglam04/trainning-typ-2026/issues/5). Theo hướng dẫn đó, bài nằm trong `week-6/` trên nhánh riêng từ `master`, PR gửi về repo gốc, tiêu đề `[Week 6] Nguyễn Tiến Tuấn`.

## Nội dung để người chấm xem

1. [Báo cáo tổng kết Word](final/NguyenTienTuan_BaoCaoTongKet_TYP2026_Final.docx) và [PDF](final/NguyenTienTuan_BaoCaoTongKet_TYP2026_Final.pdf): báo cáo ngắn ngày 12/11/2026, trình bày kiến thức, hai bài toán kỹ thuật, bằng chứng và giới hạn.
2. [Báo cáo kỹ thuật](WEEK6_REPORT.md), [HTML tương tác](WEEK6_REPORT.html), [PDF](WEEK6_REPORT.pdf): chi tiết kiến trúc, Outbox, workspace/RBAC và kịch bản demo. Xem [mốc nguồn](SOURCE_SNAPSHOT.md) để phân biệt bản tài liệu và phiên bản code.
3. Mã nguồn backend: `https://github.com/Tunhoclaptrinh/EruSentia-Server`. Cần xác nhận mentor được cấp quyền đọc repo, hoặc chuẩn bị một phạm vi source được phép chia sẻ và xác nhận cách gửi với mentor. Link tồn tại trong báo cáo **không chứng minh** người chấm có quyền truy cập hay mã chạy được. Không tự công khai repo hoặc đưa mã App private, `.env`, token, khóa hay dữ liệu thật vào PR.

Yêu cầu source chạy được không được thay thế bằng `.exe`, `.deb`, ảnh chụp hoặc HTML mô phỏng. Installer và artboard là tài liệu hỗ trợ trình bày. Những thành phần đưa ra ngoài cần được chủ dự án rà soát trước.

## Hướng dẫn chạy backend cho người chấm

Tại checkout **backend được cấp quyền**, xem `README.md` và `docs/LOCAL_DEVELOPMENT.md` của đúng revision được bàn giao. Repo mô tả Node 24, pnpm 12.11.2, Docker Engine và Compose v2. Trên máy thử độc lập, đối chiếu môi trường và cổng trước khi chạy:

```bash
pnpm install --frozen-lockfile
pnpm stack:config
pnpm stack:up
pnpm stack:status
```

Theo hướng dẫn repo backend, stack mặc định dùng PostgreSQL, RabbitMQ, Redis, Mailpit, API và worker; Swagger tại `http://127.0.0.1:3001/docs`. Stack có migration và seed, dùng volume bền: **không chạy trên database thật hoặc môi trường có dữ liệu cần giữ**. Tài khoản dev mặc định chỉ được dùng local. Dừng bằng `pnpm stack:down` theo hướng dẫn repo; không xóa volume nếu chưa hiểu dữ liệu trong đó.

Lệnh trên trích từ hướng dẫn hiện có; chưa được chạy lại trong lần chuẩn bị tài liệu này. Trước khi gửi, chạy lại trên máy sạch hoặc môi trường thử riêng, ghi revision, các bước, kết quả và cách xử lý lỗi thực tế. Không sao chép `.env` hoặc cấu hình cá nhân cho người chấm.

## Chuẩn bị demo

- Giải thích 2 bài toán: cập nhật template → transaction/outbox → thông báo chống trùng; lời mời và vai trò workspace → transaction/khóa bảo vệ owner cuối cùng.
- Dùng dữ liệu và tài khoản kiểm thử riêng. Xem kịch bản 12–15 phút ở mục 12 của [báo cáo](WEEK6_REPORT.md).
- Kiểm tra `/health`, Swagger, đăng nhập và request phù hợp; nếu không có broker hoặc API thật thì nói rõ đang dùng mô phỏng hoặc kết quả kiểm thử đã lưu.
- Số liệu 44/44 và 91/91 trong bản tổng kết là bằng chứng mốc 11/11/2026, không tự nhận là lượt kiểm thử mới hoặc chứng nhận toàn bộ hệ thống vận hành.
- Gói cũ `TYP_Week6_EruSentia_1.1.0-beta.3_CHO_BUILD` tự ghi thiếu installer Tauri Windows/Linux. Bản Electron beta.6 là bản khác; chỉ dẫn người chấm tới bản app cụ thể sau khi đối chiếu phiên bản, checksum và thử trên hệ điều hành đích.

## Checklist trước PR

- [ ] Quyết định chính xác source backend nào được chia sẻ; chủ dự án duyệt phạm vi và mentor thực sự đọc được.
- [ ] Kiểm thử lại backend bằng dữ liệu demo, ghi revision và kết quả; không tự suy ra từ bằng chứng cũ.
- [ ] Rà soát báo cáo và demo có phù hợp revision định gửi, không chứa thông tin riêng tư hoặc secret.
- [ ] Kiểm tra nhánh PR dựa trên `master` của repo gốc; diff chỉ gồm nội dung tuần 6. Đối chiếu `week-6-project-plan` với remote và repo gốc trước khi quyết định đưa vào PR; việc lưu nhánh trên fork không đồng nghĩa đã nộp bài cho mentor.
- [ ] Xác nhận các link và file người chấm mở được, chuẩn bị demo và phương án offline.
- [ ] Chỉ tạo/push PR khi phạm vi chia sẻ và nội dung đã được duyệt.

## Nội dung PR dự thảo

**Tiêu đề:** `[Week 6] Nguyễn Tiến Tuấn`

> Em gửi báo cáo project tuần 6 về Sentia Hub, backend của EruSentia. Bài trình bày kiến trúc và hai chức năng trọng tâm: thông báo qua Transactional Outbox và quản lý thành viên, phân quyền workspace. Báo cáo tổng kết và báo cáo kỹ thuật nằm trong `week-6/`. Mã nguồn backend và hướng dẫn chạy sẽ được cung cấp theo quyền truy cập đã thống nhất. Các kết quả và giới hạn kiểm thử được ghi trong báo cáo.

Chỉ gửi nội dung này sau khi đã điền đường dẫn source, xác nhận quyền truy cập và cập nhật kết quả kiểm thử thực tế.
