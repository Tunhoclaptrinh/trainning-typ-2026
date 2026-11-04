# Rà soát nền tảng trước project

**Ngày rà soát:** 04/11/2026, Asia/Bangkok. **Phạm vi:** nguồn server, báo cáo và
hướng dẫn tuần 1–5, khả năng kết nối client. Đây là hồ sơ chuẩn bị project;
chưa phải báo cáo hoàn thành tuần 6 hoặc biên bản nghiệm thu tích hợp App.

## 1. Kết quả và phạm vi áp dụng

Nền tảng đã có CRUD/ORM, authentication/authorization, xử lý bất đồng bộ và cache.
Lượt kiểm thử mới xác nhận PostgreSQL, JWT, RabbitMQ, SMTP local và Redis hoạt động
cùng nhau. Hai phần chuẩn bị server đã bổ sung: CORS theo danh sách origin và
API lấy danh mục. Runtime của App chưa thay đổi, chưa gọi API backend.

Phạm vi tích hợp đầu tiên được đề xuất là **thư viện template cộng đồng**: đăng nhập,
duyệt danh mục, xem thông tin, xuất bản nội dung do người dùng lựa chọn và lưu bản
sao để dùng offline. Ghi chú/vault hiện có tiếp tục lưu local. Trước khi thực thi
HTML lấy từ cộng đồng phải hoàn thành cơ chế cô lập và kiểm thử quyền truy cập.

## 2. Đối chiếu tuần 1–5

| Tuần | Kiến thức và bằng chứng có thể kế thừa | Giới hạn cần giữ đúng khi làm project |
|---|---|---|
| [1 — Database/OOP/DI](../week-1/WEEK1_REPORT.md) | Schema 9 bảng, index, pagination, transaction/savepoint, hai session locking; demo OOP/DI TypeScript | Locking ở bài SQL chưa trở thành chống ghi đè ở PATCH Template. Adapter PostgreSQL trong demo DI là mô phỏng; không dùng demo đó làm bằng chứng kết nối DB thật. Số đo index lịch sử và phép đo có kiểm soát được phân biệt trong báo cáo. |
| [2 — REST/ORM](../week-2/WEEK2_REPORT.md) | 5 operation Template, DTO, mapping TypeORM, memory/PostgreSQL, HTML envelope, Postman/Swagger | Collection tuần 2 thuộc hợp đồng trước JWT. Seed legacy vẫn đọc được nhưng không phải HTML envelope. Phân trang offset chưa bảo đảm snapshot ổn định qua nhiều request. |
| [3 — Auth](../week-3/WEEK3_REPORT.md) | Argon2id, JWT, role/ownership, private 404, refresh rotation/replay, admin CLI | Client chưa có phiên đăng nhập. Chưa rate limiting, reset password, email verification hay MFA; seed không có mật khẩu admin dùng được. |
| [4 — Message Queue](../week-4/WEEK4_REPORT.md) | Transactional outbox, RabbitMQ, worker welcome email, confirm/ack, retry/DLQ và ledger | SMTP chỉ tới Mailpit local; còn cửa sổ gửi trùng nếu SMTP nhận nhưng DB chưa commit. Dispatcher hiện chuyên cho sự kiện đăng ký, chưa dùng chung cho các loại event mới. |
| [5 — Redis](../week-5/WEEK5_REPORT.md) | Cache public detail, TTL/jitter, revision trigger, invalidation và fallback DB | HIT vẫn query quyền/session và metadata DB. Chưa cache list/private/auth, distributed single-flight hoặc Redis HA/ACL/TLS. Benchmark local không phải SLO production. |

Báo cáo các tuần mô tả trạng thái tại snapshot của tuần đó. Ví dụ tuần 2 chưa có
JWT, tuần 3 chưa có queue, tuần 5 có 11 operation; các mô tả này không được thay
bằng kết quả của nhánh chuẩn bị project. [Đề project gốc](README.md) yêu cầu 1–2
chức năng có độ khó cao; kế hoạch áp dụng vào domain EruSentia nằm ở
[PROJECT_PLAN](PROJECT_PLAN.md).

## 3. Các điểm cần xử lý trước hoặc trong tích hợp

| Mức / tình trạng | Phát hiện và ảnh hưởng | Cách xử lý / điều kiện hoàn thành |
|---|---|---|
| Đã xử lý ở server | Trước lượt chuẩn bị chưa có CORS cho client web khác origin | Origin HTTP(S) chính xác; dev mặc định hai origin cổng 5173, production mặc định không mở cross-origin. Kiểm thử cả preflight và fetch từ Chrome thật. |
| Đã xử lý ở server | Client chưa lấy được category ID hợp lệ qua API | `GET /categories` có JWT, projection an toàn và Swagger; dùng ID trả về khi POST Template. Memory có 2 danh mục, SQL seed có 8. |
| P0 — trước preview/chèn HTML cộng đồng | Nội dung HTML có script cần ranh giới tin cậy riêng | Chưa thực thi nội dung remote bằng luồng có quyền của trang cha. Kiểm chứng không đọc được storage/token, không gọi được quyền desktop, không điều hướng hay tải mạng ngoài chính sách. Chi tiết triển khai client ở tài liệu riêng tư. |
| P0 — trước nối App vào DB | DB dev nghiệp vụ còn schema và nội dung cũ | Chọn DB project riêng; nạp schema/index, áp 05/06/07 tường minh, tạo tài khoản mới và payload HTML độc lập. Không reset hoặc rewrite DB nghiệp vụ để làm demo. |
| P1 — trước gọi API có đăng nhập | Chưa có client auth/refresh coordinator | Session memory cho lát cắt web đầu tiên; serialize refresh theo phiên, retry có giới hạn, clear dữ liệu theo tài khoản. Desktop có thiết kế token storage riêng. |
| P1 — trước danh sách cộng đồng | GET list trả cả HTML; dữ liệu cũ không đúng format hiển thị mới | Thêm projection danh sách nhẹ và filter format/schema ở server trước pagination/count. Xử lý nội dung không hỗ trợ tường minh; không lọc riêng trang đầu ở UI rồi coi total là chính xác. |
| P1 — trước chỉnh sửa nhiều phiên | Hai người đọc cùng bản rồi PATCH đều được nhận | Thêm optimistic concurrency bằng điều kiện UPDATE ở DB và token revision trả cho client. Xung đột phải báo 409/412, giữ bản nháp và không tự ghi đè. |
| P1 — trước thêm notification/event mới | Worker publish mọi outbox row đang chờ bằng routing key đăng ký | Tách dispatcher theo event type hoặc giới hạn rõ loại row; test sự kiện khác không bị worker welcome nhận nhầm. |
| Trước bàn giao nguồn | Mốc tuần 5 hiện có trong local nhưng chưa được push | Publish đúng commit server, nhánh báo cáo và tag tuần 5 sau khi được yêu cầu. Kiểm tra mở permalink từ remote trước khi chốt snapshot project. |

P0 là điều kiện phải giải quyết trước khi mở luồng liên quan; không yêu cầu biến
mọi mục backlog thành tính năng production trong bài project.

### Hai phép thử xác định giới hạn hiện tại

**Cô lập HTML:** dùng một trang thử độc lập có giá trị localStorage giả
`audit-sentinel=dummy-only`. Iframe `srcdoc` có scripts + same-origin đọc được giá
trị trang cha; khi bỏ same-origin ở fixture thì việc đọc bị chặn. Không đọc storage,
token hoặc nội dung thật của App. Phép thử chứng minh giới hạn của cấu hình iframe,
chưa phải kiểm thử tấn công đầy đủ vào App. MDN mô tả quyền của các cờ sandbox và
rủi ro kết hợp chúng trong [tài liệu iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe).

**Ghi đè dữ liệu cũ:** hai GET cùng một Template, rồi PATCH A/B dùng cùng `version`
nội dung; cả hai trả 200, tiêu đề cuối là B. Tái hiện qua HTTP memory và đối chiếu
adapter PostgreSQL: chưa có điều kiện revision từ client. `version` dạng chuỗi là
phiên bản nội dung; `cache_revision` UUID phục vụ invalidation, chưa được dùng làm
điều kiện chống ghi đè. Đây là hạng mục triển khai project, chưa được sửa ở lượt này.

## 4. Kiểm chứng của lượt rà soát

| Kiểm tra | Kết quả / phạm vi |
|---|---|
| Server typecheck/build và bộ test mặc định | 39 pass, 0 fail; 4 suite tích hợp opt-in skip theo mặc định |
| Suite tổng hợp PostgreSQL + RabbitMQ + Mailpit + Redis | 5/5 pass, tính cả parent/subtest của Node runner |
| Luồng tổng hợp | 12 bảng sau SQL 01/02/03/05/06/07; register/login, danh mục, tạo Template, Redis MISS/HIT, chuyển private, 2 welcome email, refresh/logout và quyền phiên còn lại |
| Chrome gọi API khác origin | Trang thử tại `127.0.0.1:5173`: register 201, login 200, categories 200; 2 danh mục memory. Preflight origin localhost trả 204 và đúng allow-origin. |
| TypeScript App | `pnpm exec tsc -b --pretty false` đạt; chưa chạy luồng API trên giao diện App hoặc Electron E2E |
| Demo OOP/DI hiện tại | Chạy thành công; DI vẫn là demo dependency injection, không tính là PostgreSQL integration |
| Đường dẫn tài liệu tuần 1–5 | 63 file Markdown tracked, 268 target file local, không có file đích bị thiếu; không bao gồm kiểm chứng mọi heading anchor hoặc mọi website bên ngoài |
| Nguồn snapshot | 137 target Git của server hợp lệ trong object local, gồm cây commit và đường dẫn; 125 dòng SHA-256 khớp blob tại commit đã ghim |

Các suite riêng 19 test PostgreSQL, 13 test queue và 13 test cache đã có kết quả ở
báo cáo tuần 5; không ghi chúng thành lượt chạy lại mới trong bảng trên. Suite tổng
hợp mới bổ sung việc bật queue và cache cùng lúc. Không suy ra số endpoint từ số test.

## 5. Dữ liệu, nguồn và cách tái hiện

- Base server: `70e02a0ea0504b1eb20d26fe935a90ec54b400a9`; base TYP:
  `e023516a2389cb4b37385b886550c45942ea5066`. Xem [snapshot tuần 5](../week-5/SOURCE_SNAPSHOT.md).
- Nhánh chuẩn bị: server `feat/project-integration-prep`, TYP `week-6-project-plan`.
- Commit server của lượt chuẩn bị: `c96eaa17c8ce3a22c22a7164300783367931c08a`;
  [toàn bộ cây nguồn](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/c96eaa17c8ce3a22c22a7164300783367931c08a).
  Commit hiện có trong local, cần push để mở permalink trên GitHub. Đây là mốc
  chuẩn bị, chưa phải snapshot nghiệm thu project hoặc tích hợp App.
- Mã kiểm thử tổng hợp: `EruSentia-Server/test/project-stack.integration.test.cjs`,
  lệnh `RUN_PROJECT_TESTS=1 DB_DATABASE=project_test_<tên> pnpm test:project`.
  Hướng dẫn vận hành nằm trong `EruSentia-Server/docs/PROJECT_INTEGRATION.md`.
- DB nghiệp vụ `sentia_hub_db` giữ 10 users, 1.012 templates legacy; chưa áp dụng
  migration 05/06/07. SQL 03 riêng có 12 templates; lệnh `db:seed` còn thêm 1.000
  bản ghi benchmark. Dữ liệu này không phải thư viện HTML sẵn sàng tích hợp.
- DB test tổng hợp `project_test_20261104_readiness` và `project_test_20261104_finalprep`
  được tạo riêng; namespace RabbitMQ/Redis ngẫu nhiên. Tài khoản, HTML và email test
  là dữ liệu sinh độc lập. Hai DB đã được dọn; không còn namespace/email của suite.
  API/worker/browser thử đã đóng, harness và log tạm đã xóa; giữ container/volume dev.

Đề gốc, tài nguyên dùng chung, snapshot/tag cũ và các ảnh lịch sử được giữ nguyên.
Tuần 2 có commit nguồn ghim đầy đủ nhưng không có archive tag riêng; không khẳng
định mọi tuần đều đã có tag. Trước chốt project phải kiểm tra remote, trạng thái
DB test, namespace, email thử và các tiến trình demo; không xóa container/volume dev.

## 6. Tiêu chí để bắt đầu ghép App

Có thể tiếp tục chuẩn bị contract, dữ liệu và auth client theo thứ tự trong kế
hoạch. Luồng chạy HTML cộng đồng chỉ được mở sau kiểm thử cô lập. Mốc nghiệm thu
đợt đầu phải có một đường đi thực sự trên giao diện: đăng nhập → danh mục/danh sách
→ preview an toàn → lưu bản sao → dùng lại offline; kèm các ca private/khác tài khoản,
token hết hạn, API lỗi, nội dung không hỗ trợ và thao tác không tự đẩy dữ liệu local.

Chưa có minh chứng UI tích hợp vì tính năng chưa được triển khai. Ảnh/trace sẽ được
chụp từ luồng chạy thật tại mốc đó, dùng dữ liệu trung tính và không lộ token.
