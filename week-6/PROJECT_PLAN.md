# Kế hoạch project và tích hợp API

**Ngày lập và rà soát:** 04/11/2026. **Trạng thái:** chuẩn bị triển khai.
[Đề gốc](README.md) giữ nguyên; App chưa tích hợp API.

## 1. Hiện trạng và kết quả rà soát

| Tuần | Nền tảng đã có | Giới hạn khi chuyển sang project |
|---|---|---|
| [1 — Database/OOP/DI](../week-1/WEEK1_REPORT.md) | Schema/index, pagination, transaction/locking, OOP/DI TypeScript | Locking SQL chưa áp vào PATCH Template; adapter PostgreSQL trong demo DI là mô phỏng. Số đo index lịch sử được phân biệt với benchmark có kiểm soát. |
| [2 — REST/ORM](../week-2/WEEK2_REPORT.md) | 5 operation Template, DTO/TypeORM, HTML envelope, Postman/Swagger | Collection thuộc hợp đồng trước JWT; seed legacy không phải HTML envelope; offset không giữ snapshot qua nhiều request. |
| [3 — Auth](../week-3/WEEK3_REPORT.md) | Argon2id, JWT, RBAC/ownership, private 404, refresh rotation/replay | Chưa có auth client, rate limiting, verification/reset hoặc MFA; seed password không dùng được để login. |
| [4 — Queue](../week-4/WEEK4_REPORT.md) | Outbox, RabbitMQ, welcome worker, confirm/ack, retry/DLQ và ledger | SMTP chỉ tới Mailpit local; còn cửa sổ gửi trùng. Dispatcher hiện chuyên route đăng ký. |
| [5 — Redis](../week-5/WEEK5_REPORT.md) | Public detail cache, TTL/jitter, revision/invalidation và fallback | HIT vẫn query quyền/metadata DB; chưa cache list/private/auth, distributed single-flight hoặc HA/ACL/TLS. |

Nguồn server: `9ebcd1376fd61c3a0304d72915c27f5cbd72c0dd`
([toàn bộ cây nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/9ebcd1376fd61c3a0304d72915c27f5cbd72c0dd)),
kế thừa [snapshot tuần 5](../week-5/SOURCE_SNAPSHOT.md). Nhánh server
`feat/project-integration-prep`, TYP `week-6-project-plan`; các nhánh chuẩn bị và
mốc tuần 5 đã được push, gồm tag lưu trữ TYP `typ-2026-week-5`.

Mốc dọn tài liệu giữ nguyên mã thực thi và tests của lượt kiểm chứng dưới đây.

| Kiểm chứng lượt chuẩn bị | Kết quả |
|---|---|
| Server typecheck/build và bộ test mặc định | 39 pass, 0 fail; 4 suite opt-in skip |
| PostgreSQL + RabbitMQ + Mailpit + Redis bật cùng nhau | 5/5 pass, tính cả parent/subtest: 12 bảng, auth/categories/Template, MISS/HIT/private, 2 welcome email và refresh/logout |
| Chrome gọi API khác origin | Register 201, login 200, categories 200 từ trang thử `127.0.0.1:5173`; preflight localhost 204 |
| TypeScript App và demo OOP/DI | Đạt; chưa App/Electron API E2E, demo DI không tính là DB integration |
| Tham chiếu tuần 1–5 | 63 Markdown, 268 target file local không thiếu đích; 137 target Git local hợp lệ, 125 SHA-256 khớp blob đã ghim |

Các suite riêng 19 test DB, 13 queue và 13 cache là kết quả đã ghi ở tuần 5, không
tính thành lượt chạy lại mới. Kiểm tra link trên không bao gồm mọi heading anchor
hoặc website ngoài. DB/namespace/email thử, API/worker/browser và file tạm đã dọn;
container/volume dev giữ nguyên. Đề gốc, tài nguyên chung, snapshot/tag và ảnh các
tuần không đổi; báo cáo cũ vẫn mô tả hành vi tại đúng mốc nguồn của tuần đó.

Hai giới hạn đã kiểm chứng cần xử lý: fixture iframe scripts + same-origin đọc
được sentinel giả ở parent storage, frame opaque bị chặn; hai GET rồi PATCH cùng
version nội dung đều nhận 200 và bản cuối ghi đè. Phép thử dùng trang/dữ liệu độc
lập, không đọc dữ liệu thật của App; đối chiếu PostgreSQL chưa có expected revision.
Yêu cầu cô lập tham khảo [MDN iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).

## 2. Mục tiêu và hai chức năng trọng tâm

Domain tiếp tục là EruSentia — chia sẻ template cho công việc/học tập. Giữ stack
NestJS, TypeORM, PostgreSQL, RabbitMQ và Redis đã thực hành; tích hợp từng phần vào
App hiện có. Không cần đổi domain thành đặt vé/đặt hàng để áp dụng transaction.

| Chức năng project | Kiến thức vận dụng | Tiêu chí nghiệm thu |
|---|---|---|
| Thư viện template cộng đồng có quyền truy cập và bản sao offline | ORM/DTO, JWT/ownership, pagination/index, cache, ranh giới thực thi HTML | Người dùng tự chọn nội dung để xuất bản; private không lộ; client chỉ chạy nội dung trong môi trường cô lập; bản sao local lưu được nguồn/phiên bản và dùng lại khi mất mạng. |
| Cập nhật template có phát hiện xung đột và lịch sử phiên bản | Transaction, optimistic concurrency, unique constraint, outbox/idempotency, invalidation | Hai phiên sửa cùng revision chỉ một phiên thành công; bản còn lại nhận conflict và giữ nháp. Nội dung, revision/lịch sử và sự kiện nghiệp vụ commit nhất quán; worker xử lý lặp không làm sai trạng thái nghiệp vụ. |

Welcome email đã có giúp kiểm chứng queue. Nếu bổ sung thông báo xuất bản/cập nhật
cho project, phải hoàn thành dispatcher theo loại sự kiện trước. Không gọi thao tác
lưu bản sao local là fork server khi chưa có API và quy tắc nghiệp vụ fork.

## 3. Thứ tự triển khai theo phụ thuộc

| Bước | Công việc | Đầu ra bắt buộc trước khi sang bước tiếp theo | Trạng thái |
|---|---|---|---|
| 0 | Rà soát tuần 1–5, dữ liệu, nguồn và kiểm thử stack chung | Ghi rõ nền tảng có sẵn, giới hạn, trạng thái local/remote; không đổi mốc cũ | Đã rà soát, kết quả ở mục 1 |
| 1 | Chuẩn bị server cho client web: CORS và category discovery | Origin chính xác, JWT cho danh mục, preflight và browser fetch đạt | Đã commit ở nhánh chuẩn bị server |
| 2 | Chốt contract và database project | DB riêng, SQL 05/06/07, seed HTML trung tính; thống nhất đường dẫn API, summary list và filter format | Chưa triển khai |
| 3 | Thiết kế và kiểm chứng runner cho HTML không tin cậy | Không đọc dữ liệu/truy cập quyền của trang cha; giới hạn mạng/điều hướng; message validation và provenance được kiểm tra | Chặn mở preview/chèn remote cho tới khi đạt |
| 4 | Làm adapter HTTP và đăng nhập trên client | Base URL theo môi trường, token/session manager, refresh một lượt, logout/account switching; kiểm thử lỗi | Chưa triển khai; có thể làm song song bước 3 nhưng chưa chạy HTML remote |
| 5 | Ghép thư viện cộng đồng | Duyệt/lọc/phân trang → preview an toàn → lưu bản sao offline; không tự upload nội dung có sẵn | Sau bước 2–4 |
| 6 | Xuất bản và chỉnh sửa có xung đột | Quyền owner, visibility tường minh, revision/lịch sử transactional; UI giữ nháp khi conflict | Sau bước 5; chưa mở sửa nhiều phiên trước khi có concurrency control |
| 7 | Mở rộng event nghiệp vụ nếu cần | Dispatcher đúng type/routing, retry/DLQ/idempotency; cache không trả bản private/cũ sai quyền | Sau thiết kế event của bước 6 |
| 8 | Nghiệm thu và đóng gói project | Kiểm thử App thật + stack thật, ảnh/trace sạch, hướng dẫn chạy/dọn, snapshot và remote đã đối chiếu | Chưa thực hiện |

Bước 2 chọn API hiện tại làm đường cơ sở: chưa có tiền tố `/api/v1`. Nếu thêm
versioning, cần alias hoặc kế hoạch chuyển client/tests/Swagger cùng lúc, không
chỉ sửa URL trong tài liệu. Các mốc tuần 1–5 vẫn chạy theo snapshot riêng.

## 4. Contract cần chốt trước khi viết màn hình

1. **Danh sách:** DTO summary không mang toàn bộ HTML. Filter format/schema,
   taxonomy, visibility và search chạy trên server trước count/pagination. Kiểm
   tra semantics search/tag để không hứa tìm giống thư viện local khi API chưa hỗ trợ.
2. **Định danh:** UUID server riêng với ID local. Bản sao offline có thông tin
   nguồn và revision; không biến mọi nội dung được lưu local thành bản đã xuất bản.
3. **Nội dung:** type guard `format/schemaVersion`, giới hạn ký tự/byte; payload
   legacy hoặc schema mới chưa hỗ trợ có trạng thái rõ ràng. Không truncate HTML.
4. **Xuất bản:** client gửi `isPublic` tường minh, chọn category ID từ API, xử lý
   slug conflict. Không tải template riêng tư/độc quyền hoặc ghi chú lên server
   chỉ vì người dùng bấm lưu local.
5. **Cập nhật:** PATCH `contentJson` thay toàn bộ envelope; giữ cả metadata có giá
   trị `false`. `version` nội dung, `schemaVersion`, cache revision và revision
   chống ghi đè là các khái niệm riêng.
6. **Xung đột:** chọn counter số hoặc ETag mạnh/If-Match; UPDATE có điều kiện
   trong cùng transaction, trả revision mới. Nếu dùng header mới, cập nhật cả
   CORS, Swagger, cache và client. Conflict không được tự retry với bản cũ.
7. **Phiên:** refresh được điều phối theo phiên; 401 thử refresh có giới hạn, 403
   không refresh. Mất response sau mutation không tự gửi lại vô hạn; muốn retry
   an toàn phải có idempotency contract và unique constraint tương ứng.

Server hiện mặc định `isPublic=true` nếu bỏ trống. Quy tắc UI project phải gửi rõ
giá trị người dùng đã chọn; không giả định server đang mặc định private.

## 5. Tách dữ liệu thực hành và dữ liệu project

Tại lúc rà soát, `sentia_hub_db` có 10 users, 1.012 templates legacy, chưa áp SQL
05/06/07. SQL 03 riêng có 12 templates; `db:seed` thêm 1.000 rows benchmark. Chưa
có dữ liệu HTML project sẵn dùng và không tự migrate/reset DB nghiệp vụ.

Tạo database mới cho project, kiểm tra DB_* trước mọi lệnh ghi. Bootstrap schema
01/index02, seed taxonomy/tài khoản phù hợp, rồi auth05/queue06/cache07 theo thứ tự.
Chưa có migration runner/journal tự động; cần thêm cơ chế theo dõi đã áp dụng và
restore rehearsal khi tiến tới triển khai thật. Không dùng `db:fresh` cho DB cần giữ.

Seed tuần 1 và 1.000 rows benchmark giữ phục vụ tái hiện; không sửa chúng thành
dữ liệu App. Dataset tích hợp mới cần HTML tự tạo, Unicode, `false`, nội dung lớn,
private/public, tác giả khác nhau và một case legacy có chủ đích. Admin mới tạo qua
CLI; không tạo mật khẩu dùng chung trong repository.

## 6. Ma trận kiểm thử nghiệm thu

| Nhóm | Ca bắt buộc |
|---|---|
| DB/contract | Fresh bootstrap và upgrade có kiểm soát; lỗi tham chiếu; category thật; summary/count/filter thống nhất; legacy/schema chưa hỗ trợ |
| Auth/quyền | Register/login, expiry, refresh đồng thời, replay/logout, chuyển tài khoản; owner/admin/user khác; private 404; không lộ credential trong lỗi/log/ảnh |
| Cô lập HTML | Không đọc storage/token/parent DOM hoặc IPC; kiểm tra message giả, mạng/điều hướng, preview và sau lưu/chèn/mở lại; không nâng quyền nhờ import/export |
| Thư viện | Phân trang/lọc remote, trạng thái loading/empty/error, mạng chậm/offline, hủy request cũ, định danh không trùng, local vẫn dùng được khi API tắt |
| Mutation/concurrency | Hai phiên PATCH cùng revision; một thành công, một conflict; giữ nháp; slug trùng; double-click/mất response; rollback không để lịch sử/event dở dang |
| Queue/cache | Queue+cache bật chung; retry/DLQ/redelivery, duplicate event; private/delete sau HIT; Redis down fallback; broker/SMTP lỗi không rollback user đã commit |
| Platform | Browser trước, Electron dev/packaged sau; không cho phép Origin:null đại trà hoặc tắt web security để vượt CORS |
| Đóng gói | Snapshot source/report, SHA-256/permalink, README tái hiện, ảnh thao tác thật, DB/queue/key/email/tiến trình test được dọn |

Số đo latency/load ghi payload, dataset, warmup, concurrency, mẫu và phân vị. Không
lấy tốc độ benchmark tuần 5 để hứa hiệu năng của project khi chưa đo lại.

## 7. Backlog sau lát cắt đầu tiên

| Hạng mục | Khi nào cần |
|---|---|
| Persistence token desktop qua OS secure storage, broker main process | Trước phát hành Electron có đăng nhập bền vững; kiểm tra backend thực tế trên Ubuntu |
| Rate limiting, email verification/reset, quản lý phiên UI, audit log nghiệp vụ | Trước mở dịch vụ cho người dùng thật |
| Health/readiness, migration journal, backup/restore, log/metrics/alert, retention outbox/ledger | Trước vận hành dài hạn |
| HTTPS, secret management, giới hạn cổng DB/Adminer, Redis/RabbitMQ ACL/TLS và phương án HA | Trước deploy ngoài local |
| Thumbnail/upload và chính sách URL, moderator/report nội dung, quota/kích thước | Khi bắt đầu nhận nội dung cộng đồng ở quy mô thực tế |
| Ratings/forks/notifications API | Khi có use case cụ thể; hiện có bảng không đồng nghĩa có endpoint |
| Cursor pagination/full-text search/distributed stampede control | Khi dữ liệu và phép đo chỉ ra cần thiết |
| Đồng bộ vault/ghi chú, cộng tác thời gian thực, AI gateway, thanh toán | Dự án/phạm vi riêng sau khi thư viện đầu tiên ổn định |

## 8. Tài liệu bàn giao

Source/SQL/tests và hướng dẫn vận hành ở server; TYP lưu yêu cầu, lý thuyết, báo cáo
và minh chứng. Chi tiết App giữ trong repo riêng tư. Kế hoạch này là mốc hiện trạng,
không đổi đề gốc hoặc biến các mục tương lai thành tính năng đã có.

Hướng dẫn chạy/dọn suite tổng hợp ở `EruSentia-Server/docs/COMMANDS_AND_CHEATSHEET.md`,
mục Kiểm thử stack project; mã test ở `test/project-stack.integration.test.cjs`.

Khi chốt mốc triển khai, ghi commit đầy đủ, kết quả kiểm thử, giới hạn và cách mở
toàn bộ cây nguồn tại đúng thời điểm. Commit/tag cũ giữ nguyên; kiểm tra remote đã
có đối tượng trước khi khẳng định người đọc mở được permalink.
