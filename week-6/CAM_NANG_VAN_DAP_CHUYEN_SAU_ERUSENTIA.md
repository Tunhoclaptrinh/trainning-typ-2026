# CẨM NANG VẤN ĐÁP SIÊU CHI TIẾT — ERUSENTIA

Bản tra cứu mở rộng, đối chiếu source ngày 20/11/2026. Backend `b38390d`; app hiện tại `44fec1ec`, engine 3.15.0; bài nộp app beta.6/engine 3.14.6. Mỗi đoạn trích lấy từ checkout hiện tại, số dòng để dò nhanh và có thể đổi nếu mã thay đổi.

## Bản đồ tra cứu chủ đề

- **Kiến trúc, NestJS, DI, DTO, CORS:** [chương 3–4](#3-bản-đồ-kiến-trúc), chuyên khảo [21.1](#211-khởi-động-backend-và-cấu-hình-toàn-cục) và [21.2](#212-controller-route-và-injection).
- **Authentication, Argon2id, JWT, refresh, guard:** [chương 5](#5-authentication-session-và-authorization), [21.3–21.6](#213-argon2id-và-dummy-hash); [tài liệu Authentication](../../erusentia-server/docs/AUTHENTICATION.md). Keycloak/GitHub **chưa triển khai**, xem chương 5.
- **Transaction, SQL, queue, outbox, ACK, retry, idempotency:** [chương 6](#6-transactional-outbox--chức-năng-khó-số-1), [21.8–21.13](#218-transaction-ghi-template-và-outbox); [tài liệu Message Queue](../../erusentia-server/docs/MESSAGE_QUEUE.md).
- **Workspace, RBAC, cache quyền, concurrency:** [chương 7](#7-workspace-rbac-và-concurrency--chức-năng-khó-số-2), [21.17–21.19](#2117-role-workspace-và-cache-600-giây); [tài liệu Workspace](../../erusentia-server/docs/WORKSPACE_DEVELOPMENT.md).
- **Index, cursor, Redis, cache-aside, TTL, ETag:** [chương 8–11](#8-postgresql-sql-orm-và-thiết-kế-dữ-liệu), [21.7](#217-optimistic-concurrency-bằng-etag), [21.13–21.16](#2113-ddl-khóa-chính-và-index); [tài liệu Cache](../../erusentia-server/docs/CACHE.md).
- **Resource Gateway, local-first, Electron, HTML, canvas, in:** [chương 12–13](#12-resource-gateway-và-an-toàn-khi-gọi-api), [21.20–21.22](#2120-electron-và-ranh-giới-tiến-trình); [tài liệu standalone](../../erusentia-app/docs/STANDALONE_PAPER_PARITY.md).
- **Testing, giới hạn, demo, câu hỏi và thuật ngữ:** [chương 14–20](#14-testing-bằng-chứng-và-cách-nói-cho-chuẩn). Các kỹ thuật chưa áp dụng hoặc chưa kiểm chứng được chỉ rõ trong từng chương; không đồng nhất “có code” với “đã chứng minh bằng hạ tầng thật”.

- **Chạy Redis/PostgreSQL/RabbitMQ, Swagger và demo:** [chương 23](#23-hướng-dẫn-chạy-từng-thành-phần-và-thực-hành-vấn-đáp).

## Hình minh họa từ dự án

![Ảnh báo cáo kỹ thuật](../../erusentia-server/docs/assets/01_week6_technical_report_overview.png)

Hình 1. Ảnh màn hình báo cáo trong repo, là hình tư liệu; không phải bằng chứng rằng lần kiểm tra hiện tại đã chạy lại.

![Ảnh minh họa kiến trúc và outbox](../../erusentia-server/docs/assets/02_architecture_outbox_card.png)

Hình 2. Ảnh minh họa kiến trúc/outbox. Xem giải thích và giới hạn tại chương 6 và 21.8–21.12.

![Ảnh workspace và RBAC](../../erusentia-server/docs/assets/07_app_workspace_manager_rbac.png)

Hình 3. Ảnh giao diện workspace/RBAC trong repo. Quyền phải được kiểm tra ở server, không suy ra từ hình.

---

Tài liệu ôn tập theo mã nguồn thực tế, cập nhật ngày 20/11/2026. Trọng tâm là backend TYP tuần 6; phần ứng dụng được bổ sung để giải thích dự án toàn diện. Đây là tài liệu học và chuẩn bị vấn đáp, không thay thế báo cáo đã nộp.

## 0. Đọc phần này trước: phạm vi, phiên bản và sự trung thực

- Backend trong bộ nộp: `EruSentia-Server-b38390d.zip`, commit `b38390d6cf58faab69d54bb2962da7b3ec951837`. Mã backend đang đọc trong workspace cũng ở mốc b38390d.
- Bộ nộp tuần 6 dùng app `1.1.0-beta.6`; báo cáo kỹ thuật đã xuất bằng engine 3.14.6. Mã app hiện tại có commit `44fec1ec`, engine 3.15.0, bổ sung sửa bảng vẽ standalone sau khi đóng gói bài nộp. Không được nói bộ cài trong bài nộp đã có sửa đổi sau đó nếu chưa build lại.
- Báo cáo lịch sử có kết quả 44/44 backend và 91/91 app ở một mốc trước. Lần chạy backend b38390d ngày 20/11 dùng Node 24: 160 bài, 141 đạt, 0 lỗi, 19 bỏ qua; môi trường thiếu Docker/PostgreSQL nên không coi đây là nghiệm thu đầy đủ PostgreSQL, RabbitMQ, Redis thật hoặc load test.
- Keycloak, đăng nhập GitHub và lớp phê duyệt truy cập là **kế hoạch**, không trình bày như tính năng đã hoàn thành. Auth hiện tại của backend là cơ chế riêng dựa trên JWT và session.
- Không bịa số lượng người dùng, throughput, thời gian đáp ứng, kết quả kiểm thử hay phần việc cá nhân. Khi chưa chắc: “Theo source em đã đọc…, phần này em chưa kiểm chứng ở môi trường thật.”

## 1. TYP yêu cầu gì và dự án đáp ứng như thế nào?

Tuần 6 yêu cầu chọn một domain, xây dựng backend project có 1–2 chức năng khó và vận dụng kiến thức đã học: database, ORM, authentication, message queue, Redis và pagination. Đầu ra cần mã nguồn chạy được và báo cáo giải thích kiến trúc, chức năng và vấn đề kỹ thuật. Xem `trainning-typ-2026/week-6/README.md`.

EruSentia là hệ thống quản lý kiến thức cá nhân theo hướng local-first, có ứng dụng desktop/web và backend Sentia Hub phục vụ chia sẻ template, tài khoản, workspace và các dịch vụ liên quan. Hai điểm nên tập trung bảo vệ:

1. **Thông báo bất đồng bộ khi template công khai được cập nhật**: transactional outbox, PostgreSQL transaction, RabbitMQ, consumer idempotent, retry và cache số chưa đọc.
2. **Workspace và phân quyền theo thành viên**: owner/editor/viewer, lời mời, transaction và khóa hàng để bảo vệ owner cuối cùng, kèm hạn chế của cache quyền.

Hai chức năng có vấn đề kỹ thuật rõ ràng, dễ trình bày hơn việc chỉ liệt kê nhiều công nghệ. Chức năng bổ trợ là đăng nhập, API template, cache Redis, feed phân trang và Resource Gateway.

## 2. Bài nói mẫu: 30 giây, 2 phút và 5 phút

### 2.1. Trong 30 giây

“Em chọn domain quản lý và chia sẻ tri thức. Ứng dụng EruSentia ưu tiên làm việc với dữ liệu cục bộ, còn Sentia Hub quản lý tài khoản, template, workspace và thông báo. Em tập trung vào hai bài toán backend: bảo đảm không mất ý định gửi thông báo khi cập nhật template bằng transactional outbox, và phân quyền workspace có kiểm soát trường hợp owner cuối cùng. Em dùng NestJS/TypeScript, PostgreSQL, Redis và RabbitMQ; các giới hạn kiểm chứng hạ tầng thật được ghi rõ trong báo cáo.”

### 2.2. Trong 2 phút

“Bài toán thứ nhất là dual write: khi cập nhật một template công khai, nếu lưu database thành công nhưng gửi message thất bại, người theo dõi có thể không được báo. Thay vì gọi broker và database như hai thao tác độc lập, em ghi bản cập nhật và bản ghi outbox trong cùng transaction PostgreSQL. Worker đọc outbox chưa phát bằng `FOR UPDATE SKIP LOCKED`, publish qua RabbitMQ và đánh dấu đã phát. Do có thể phát lại khi lỗi ở giữa các bước, consumer dùng khóa nghiệp vụ gồm người nhận, template và revision, kết hợp unique index và `ON CONFLICT DO NOTHING` để tránh thông báo trùng.

Bài toán thứ hai là phân quyền workspace. Backend phân biệt owner, editor và viewer, kiểm tra quyền ở service. Khi thay đổi role hoặc xóa thành viên, các hàng owner được khóa trong transaction để bảo vệ bất biến workspace không mất owner cuối cùng. Em không kết luận rằng đã chứng minh mọi tình huống concurrency và deadlock; việc đó cần bài kiểm tra nhiều kết nối thực tế.

Dự án còn có auth JWT/session với Argon2id, cache Redis có kiểm tra quyền, feed dùng cursor ghép và các API có DTO, Swagger, kiểm thử. Bài nộp đóng gói source backend tại commit cụ thể, còn số test trên môi trường thiếu hạ tầng được báo rõ phần skip.”

### 2.3. Trong 5 phút

Nói theo thứ tự: bài toán và người dùng → sơ đồ thành phần → một request đi qua controller/service/store → hai chức năng khó → các công nghệ liên quan → cách kiểm chứng → giới hạn và hướng tiếp. Đừng bắt đầu bằng hàng chục tên thư viện. Ở mỗi chức năng hãy kể một lỗi thực tế có thể xảy ra, giải pháp, tại sao giải pháp hợp lý và giới hạn còn lại.

## 3. Bản đồ kiến trúc

```text
Người dùng
   ├── EruSentia App (React + TypeScript; web hoặc Electron)
   │      ├── Editor, template, dữ liệu cục bộ
   │      └── API client / bridge khi dùng dịch vụ backend
   └── EruSentia Admin (frontend quản trị)
                    |
                    | HTTP/JSON + Bearer token
                    v
Sentia Hub / NestJS
   ├── Controller → DTO/Pipe → Guard → Service → Store/Repository
   ├── Auth, Templates, Notifications, Workspaces, Resources...
   ├── PostgreSQL: dữ liệu chính, transaction, outbox, notifications
   └── Redis: cache theo use case, không thay thế PostgreSQL
                    |
               Outbox dispatcher
                    v
                RabbitMQ
                    |
                 Worker → ghi notifications → vô hiệu cache
```

Sơ đồ là mô hình trách nhiệm, không khẳng định mọi thao tác của app đều đi qua backend. Kiến thức chính: phân tầng, REST, HTTP, bất đồng bộ, transaction, cache và ranh giới tin cậy.

### 3.1. Đọc đường vào server

`erusentia-server/src/main.ts`: `bootstrap()` nạp cấu hình môi trường, gọi `readConfig()`, tạo app bằng `createApplication`, bật shutdown hooks và `listen`. Nếu không có `JWT_SECRET`, code cảnh báo dùng khóa tạm cho môi trường phát triển; production phải có secret phù hợp và ổn định.

`erusentia-server/src/app.ts`: dynamic module đăng ký các module; nếu cấu hình store là PostgreSQL thì đăng ký TypeORM. `synchronize: false` nghĩa là không dựa vào TypeORM tự thay đổi schema khi khởi động; schema/migration có kịch bản riêng. App cấu hình CORS theo danh sách origin, giới hạn JSON 2 MB, ValidationPipe, exception filter và Swagger khi được bật.

**Câu hỏi:** Tại sao phân chia module? Mỗi module đóng gói provider/controller và ranh giới nghiệp vụ, giảm phụ thuộc trực tiếp và hỗ trợ kiểm thử. Module NestJS không mặc nhiên là microservice: ở đây nhiều module vẫn chạy cùng tiến trình API.

### 3.2. Controller, service, store và dependency injection

- Controller nhận request, mô tả route và mapping dữ liệu; ví dụ `src/templates/templates.controller.ts` có `@Controller("templates")`, `@Get()`, `@Post()`, DTO, `@CurrentUser()`.
- DTO/ValidationPipe kiểm tra hình dạng đầu vào. `whitelist: true` và `forbidNonWhitelisted: true` giúp từ chối trường ngoài contract; không đồng nghĩa đã giải quyết toàn bộ kiểm tra nghiệp vụ.
- Guard quyết định request có được tiếp tục: xác thực phiên và kiểm tra role.
- Service thực hiện quy tắc nghiệp vụ và phối hợp store/cache; ví dụ `TemplatesService`.
- Store/repository phụ trách truy cập dữ liệu, transaction, query. Dự án hỗ trợ cấu hình memory và PostgreSQL, nhưng test memory không thay thế được bằng chứng transaction trên PostgreSQL.
- Constructor injection: NestJS cấp instance phụ thuộc; không cần mỗi controller tự `new` service. Lợi ích: quản lý vòng đời, thay thế test double, giảm ghép cứng.

Ví dụ giải thích code: `constructor(private readonly service: TemplatesService) {}` khai báo dependency; `@Get(":id")` ánh xạ GET; `UuidPipe` kiểm tra và chuẩn hóa tham số; `@CurrentUser()` lấy identity đã được guard gắn vào request. Service vẫn phải kiểm tra quyền đọc tài nguyên, không tin ID do client gửi.

## 4. Từ HTTP request đến database: walkthrough cụ thể

Ví dụ người dùng yêu cầu một template:

1. Client gửi `GET /templates/:id` với `Authorization: Bearer <access-token>`.
2. `AccessTokenGuard` ở `src/auth/auth.guards.ts` nhận Bearer token, gọi `authenticateSession` và gắn `request.user`, `request.sessionId`. Endpoint public là ngoại lệ theo metadata; không mặc định mọi endpoint đều public.
3. Controller chuyển id và user vào service. Pipe kiểm tra UUID; dữ liệu sai có thể bị từ chối trước service.
4. Service dùng cache/store. Cache đọc stamp để biết revision và trạng thái hiển thị; phải kiểm tra được phép đọc trước khi trả dữ liệu cache.
5. Trả JSON, `ETag` và `X-Cache`. `X-Cache` cho biết đường HIT/MISS/BYPASS..., không phải thông tin xác thực.

**Tại sao không cho client chọn authorId?** Danh tính phải lấy từ phiên đã xác thực và quy tắc server; nếu tin payload thì client có thể giả mạo chủ sở hữu.

**Vì sao có thể dùng 404 thay cho 403?** Với một số tài nguyên riêng tư, không xác nhận sự tồn tại của tài nguyên cho người không có quyền là một chính sách có thể chấp nhận; cần mô tả theo endpoint thực tế, không nói mọi lỗi đều 404.

## 5. Authentication, session và authorization

### 5.1. Phân biệt thuật ngữ

- Authentication: người gọi là ai? Ví dụ xác minh token/session.
- Authorization: người đó có quyền thực hiện hành động trên tài nguyên này không?
- JWT: token có chữ ký, mang claims; chữ ký chống sửa nội dung mà không có khóa ký. JWT thông thường không tự mã hóa nội dung.
- Access token: dùng trong request API. Refresh token: dùng lấy access token mới theo contract; cần bảo vệ và có khả năng thu hồi.
- Session: trạng thái phía server liên quan đến phiên. Có JWT không có nghĩa ứng dụng bắt buộc stateless hoàn toàn.

### 5.2. Password

`src/auth/passwords.ts` sử dụng Argon2id; các tham số trong source gồm memoryCost 19456, timeCost 2, parallelism 1 và outputLen 32. Lưu hash, không lưu mật khẩu plaintext. Hash là phép một chiều phục vụ kiểm tra, khác mã hóa có khóa giải mã. Với tài khoản không tồn tại, code thực hiện một lượt verify với dummy hash để giảm khác biệt thời gian; không khẳng định loại bỏ mọi timing side channel.

### 5.3. Đăng nhập và refresh

`src/auth/auth.service.ts`: đăng nhập kiểm tra thông tin, tạo refresh token ngẫu nhiên từ `randomBytes(32)`, lưu hash của refresh token cùng session và thời hạn; access token được ký bằng JWT. Refresh tạo token tiếp theo và gọi `rotateSession`: token cũ không đơn giản được dùng mãi. Logout/thu hồi được triển khai thông qua store và session family; xem chính xác từng method trước khi trình bày.

`AccessTokenGuard` đọc header Bearer, gọi `authenticateSession`; `RolesGuard` dùng metadata roles cho quyền hệ thống. Không đồng nhất role hệ thống (`user`, `creator`, `admin`) với role trong một workspace (`owner`, `editor`, `viewer`).

**Câu hỏi:** JWT hết hạn có logout ngay được không? Chữ ký và expiry chỉ là một phần; ở dự án này guard còn gọi kiểm tra session. Cần xem `authenticateSession` và store thực tế để trả lời đường thu hồi cụ thể, không nói “JWT luôn không thể thu hồi”.

**Keycloak/GitHub:** hiện mới là kế hoạch. OAuth/OIDC/Keycloak nếu triển khai sau sẽ cần cấu hình client, redirect URI, xác thực chữ ký/issuer/audience/state và phân quyền/duyệt ở server; lớp phủ giao diện đơn thuần không bảo vệ dữ liệu phía server.

## 6. Transactional Outbox — chức năng khó số 1

### 6.1. Kể câu chuyện dual write

Tác giả cập nhật template công khai; follower cần nhận thông báo. Nếu API ghi PostgreSQL và sau đó gọi RabbitMQ, giữa hai thao tác có thể crash. Khi đó bản cập nhật đã commit nhưng message chưa gửi. Nếu gửi broker trước rồi DB rollback, worker lại nhận sự kiện về một thay đổi không thành công. Giao dịch database không tự bao gồm broker; hai hệ thống có biên lỗi khác nhau.

Giải pháp: trong cùng transaction cập nhật template/revision, ghi thêm một hàng `message_outbox` biểu diễn ý định phát sự kiện. Commit thành công nghĩa là cả dữ liệu nghiệp vụ và ý định phát đều bền vững. Commit thất bại thì cả hai rollback. Outbox không tự bảo đảm broker đã nhận ngay, mà cho phép dispatcher xử lý sau.

Trong `src/templates/persistence/postgres-template.store.ts`, vùng transaction cập nhật dữ liệu; source kiểm tra sự tồn tại bảng outbox trước khi chèn sự kiện đối với điều kiện nghiệp vụ. Điều kiện bảng/migration và trạng thái public/moderation cần nêu trung thực; đừng nói mọi cập nhật đều tạo sự kiện. Vì code có kiểm tra bảng tồn tại, cấu hình migration thiếu có thể không tạo event: môi trường cần cài schema đúng, không tuyên bố vô điều kiện sẽ có thông báo.

### 6.2. Dispatcher lấy sự kiện như thế nào?

Xem `src/messaging/notification-repository.ts`, method `dispatch`:

```sql
SELECT id, payload FROM message_outbox
WHERE published_at IS NULL AND event_type = $1
ORDER BY created_at, id
LIMIT $2 FOR UPDATE SKIP LOCKED;
```

- `published_at IS NULL`: hàng chưa được đánh dấu đã phát.
- `ORDER BY created_at, id`: thứ tự ổn định hơn chỉ dùng timestamp.
- `LIMIT`: giới hạn số hàng mỗi lượt.
- `FOR UPDATE`: khóa hàng trong transaction đang giữ.
- `SKIP LOCKED`: dispatcher khác bỏ qua hàng đang bị khóa để lấy hàng khác, giảm tranh chấp; không phải lời hứa về thứ tự toàn cục tuyệt đối.
- Sau `publish` thành công, code cập nhật `published_at`, rồi COMMIT; lỗi sẽ ROLLBACK và release connection.

Giải thích đánh đổi: code giữ transaction và khóa DB trong lúc chờ publish broker; broker chậm có thể giữ khóa/connection lâu. Phải đo và cân nhắc lease, batch, timeout hoặc kiến trúc dispatcher khác nếu tải cao. Không kết luận miễn phí vì “đã có SKIP LOCKED”.

### 6.3. Vì sao vẫn có thể gửi lặp?

Broker có thể đã xác nhận nhận message nhưng tiến trình chết trước khi transaction đánh dấu `published_at` commit. Khi chạy lại, hàng còn chưa đánh dấu và có thể được publish lại. Đây là lý do thiết kế hướng tới **at-least-once** và consumer idempotent, không phải exactly-once end-to-end. Lỗi trước khi publish được xử lý nhờ bản ghi outbox còn chờ.

### 6.4. Consumer, retry, dead letter

`src/messaging/notification-worker.ts`: consumer đọc message (`noAck: false`), parse event, gọi `repository.deliver`, sau đó mới `ack`. Message hỏng là lỗi permanent; lỗi xử lý khác được gửi vào retry hoặc dead queue tùy số lần. Source dùng initial delivery cộng tối đa hai delayed retries theo điều kiện attempt hiện tại. Publish đường retry/dead trước khi ack bản cũ; nếu không hoàn tất thì không được tùy tiện coi xử lý đã xong.

Khái niệm: ACK báo broker có thể bỏ message đã xử lý; retry xử lý lỗi tạm thời; dead-letter giúp cô lập message không xử lý được để phân tích. Chi tiết topology, TTL và queue nằm trong `src/messaging/rabbit.ts`; không tuyên bố bài kiểm thử hiện có đã xác nhận mọi tình huống broker thật nếu chưa chạy.

### 6.5. Idempotency ở đâu?

Trong `deliver`, transaction lấy advisory transaction lock theo `templateId:revision`, kiểm tra template vẫn tồn tại, public và không hidden, tìm follower, sau đó insert notification. Unique index trong `sql/12_template_notifications.sql` trên `(recipient_id, template_id, revision)` kết hợp `ON CONFLICT ... DO NOTHING` làm cho việc xử lý lại cùng nội dung nghiệp vụ không tạo notification trùng cho cùng người.

Advisory lock giúp tuần tự hóa các lượt giao cùng khóa trong transaction; unique index là hàng rào bền vững ở DB. Đây là idempotency đối với khóa nghiệp vụ đã chọn, không đồng nghĩa mọi hiệu ứng bên ngoài đều exactly-once.

Sau COMMIT, code cố gắng xóa cache số chưa đọc của người nhận mới. Nếu Redis lỗi, PostgreSQL vẫn có notification; cache có thể cũ cho tới khi hết hạn hoặc được xử lý. Không nói Redis và DB luôn nhất quán tức thời.

### 6.6. Fanout có gì cần cải thiện?

Code lấy danh sách follower rồi chia nhóm 100, nhưng bên trong vẫn INSERT từng người. Vì vậy không gọi đây là bulk insert thực sự. Follower rất nhiều có thể gây dùng nhiều bộ nhớ, transaction dài và nhiều round-trip. Hướng sau: đo, phân trang follower theo cursor, chia job, bulk insert, giới hạn batch, quan sát outbox lag và retry; vẫn phải giữ idempotency.

## 7. Workspace, RBAC và concurrency — chức năng khó số 2

### 7.1. Mô hình

`workspaces` là không gian làm việc; `workspace_members` gắn người dùng với workspace và role. Có owner, editor, viewer. Owner quản lý workspace, lời mời và membership; editor được thêm liên kết tài nguyên theo API hiện tại; viewer chủ yếu đọc. Những quyền cụ thể phải đối chiếu endpoint và service: không suy ra editor được sửa mọi template riêng tư.

`src/workspaces/workspaces.controller.ts` định nghĩa route; `src/workspaces/workspaces.service.ts` kiểm tra `resolveRole` và `requireRole`. Client ẩn nút không thay cho server kiểm tra quyền: người gọi có thể gọi API trực tiếp.

### 7.2. Lời mời

Owner tạo lời mời cho email cụ thể và role. Người nhận đăng nhập, gửi token, service trong transaction khóa hàng lời mời và kiểm tra workspace, email, thời hạn, trạng thái đã dùng. Việc ghi membership và cập nhật trạng thái cần nhất quán. Trường hợp đã là thành viên không nên vô tình hạ role hiện có; đối chiếu source nếu được hỏi chi tiết.

Token mời là bí mật mang quyền chấp nhận trong phạm vi điều kiện server, không phải mật khẩu và không nên ghi vào log hoặc chia sẻ tùy tiện. Kiểm tra token không thay thế kiểm tra email/người dùng/hạn.

### 7.3. Owner cuối cùng và race condition

Giả sử có hai owner A và B. Nếu mỗi request đọc số owner = 2 ở ngoài transaction, cả A và B có thể đồng thời kết luận có thể tự rời và cùng xóa, làm workspace còn 0 owner. Đây là race condition: kết quả phụ thuộc thứ tự xen kẽ các thao tác.

`updateMemberRole` và `removeMember` trong `workspaces.service.ts` dùng `db.transaction`, `SELECT ... FOR UPDATE` để khóa các hàng owner và hàng mục tiêu, rồi kiểm tra trước khi update/delete. Khóa giữ đến khi transaction kết thúc. Bất biến cần bảo vệ: không hạ hoặc xóa owner cuối cùng qua các đường xử lý đó.

Phải nói rõ giới hạn: các bài kiểm thử hợp đồng không tự chứng minh mọi interleaving trên hai connection thật hoặc không xảy ra deadlock; cần test concurrency thực với PostgreSQL, xem thứ tự khóa, isolation level, timeout và hành vi rollback. Trả lời trung thực như vậy tốt hơn nói “chắc chắn không bao giờ xảy ra race”.

### 7.4. Cache quyền: điểm thầy có thể hỏi sâu

`resolveRole` đọc Redis trước và ghi cache role với TTL 600 giây. Đường đổi role/xóa thành viên có invalidate, nhưng lỗi xóa cache bị bỏ qua. Do đó nếu invalidate lỗi, role cũ có thể còn được trả trong một khoảng; không thể khẳng định thu hồi quyền luôn có hiệu lực tức thì trong mọi lỗi Redis. Cần test ca lỗi invalidate và cân nhắc đọc DB cho hành động nhạy cảm, versioning quyền hoặc cơ chế nhất quán rõ ràng. Đây là khác biệt giữa cache dữ liệu hiển thị và cache quyết định cấp quyền.

### 7.5. Giới hạn phạm vi

API workspace/membership và liên kết tài nguyên không tự chứng minh đầy đủ luồng chia sẻ/sửa mọi template private, đồng bộ thời gian thực hay đồng biên tập. Chỉ giới thiệu những gì đã kiểm chứng; các đường quyền xuyên qua template/resources cần nghiệm thu riêng.

## 8. PostgreSQL, SQL, ORM và thiết kế dữ liệu

### 8.1. Khái niệm cần nắm

- Primary key định danh hàng và duy nhất; composite key gồm nhiều cột. `template_follows(user_id, template_id)` ngăn cùng người follow cùng template nhiều lần.
- Foreign key đảm bảo quan hệ tham chiếu theo schema; `ON DELETE CASCADE` có tác dụng xóa liên quan theo cấu hình và cần cân nhắc hậu quả.
- Unique index là ràng buộc duy nhất được DB thực thi, đáng tin hơn chỉ kiểm tra rồi insert trong code vì hai request có thể chạy đồng thời.
- Transaction nhóm các thao tác; ACID là atomicity, consistency, isolation, durability. Isolation có nhiều mức và không tự biến mọi thuật toán ứng dụng thành đúng.
- ORM ánh xạ dữ liệu và hỗ trợ transaction, nhưng source cũng dùng SQL trực tiếp khi cần query/lock rõ ràng. Dùng ORM không loại bỏ nhu cầu hiểu SQL, index và isolation.
- Parameterized SQL `$1`, `$2` tách dữ liệu khỏi câu lệnh, giảm nguy cơ SQL injection ở phần tham số; không tự an toàn nếu ghép tên bảng/cột động từ dữ liệu không tin cậy.

### 8.2. Dữ liệu trong project

`templates` và revisions lưu nội dung/phiên bản; `message_outbox` lưu sự kiện chờ; `template_follows` nối người theo dõi; `notifications` là thông báo theo người nhận; `workspaces`, `workspace_members`, `workspace_invites`, `workspace_resources` phục vụ nhóm; resource module có các bảng/grant/quota riêng. Xem schema `sql/01_schema.sql`, `sql/12_template_notifications.sql`, `sql/13_workspaces_rbac.sql` và code thực tế.

Không nói “toàn bộ hệ thống chỉ có 14 bảng” vì số 14 trong tên một migration không phải thống kê tổng số bảng.

### 8.3. Index và đánh đổi

Index `(recipient_id, created_at DESC, id DESC)` phù hợp feed lọc theo người nhận và sắp xếp mới nhất trước. Index theo template hỗ trợ tìm follower. Index giúp một số truy vấn nhưng tốn dung lượng và làm ghi chậm hơn; cần `EXPLAIN (ANALYZE, BUFFERS)` trên dữ liệu đại diện để xác nhận kế hoạch thực tế. Không cam kết thời gian O(1) cho mọi query.

## 9. Pagination: offset và cursor

Offset: `LIMIT 20 OFFSET 100` đơn giản, thuận tiện trang số, nhưng offset sâu có thể phải bỏ qua nhiều hàng; dữ liệu chèn/xóa ở đầu có thể làm người dùng thấy trùng hoặc thiếu khi lật trang.

Notification feed dùng cursor ghép `(created_at, id)` và thứ tự giảm dần. Với trang sau, điều kiện tuple tương ứng là lấy các bản ghi nhỏ hơn cursor trong thứ tự đang dùng, cùng recipient. `id` là tie-breaker khi nhiều thông báo cùng timestamp. Cursor được mã hóa dạng opaque để client mang đi, không được coi base64 là mã hóa bảo mật. `src/notifications/notifications.service.ts` có encode/decode và truy vấn. Xem code để xác nhận cách parse.

Cần phân biệt: cursor giúp tiếp tục từ một vị trí theo thứ tự, không tự tạo snapshot bất biến khi có dữ liệu mới hoặc bản ghi bị xóa. Index phải phù hợp bộ lọc và thứ tự; giới hạn kích thước trang để tránh yêu cầu quá lớn.

## 10. Redis, cache và tính nhất quán

### 10.1. Cache-aside cho template

`src/cache/template-cache.ts` cho thấy:

1. Khi cache tắt, đọc store và trả `BYPASS_DISABLED`.
2. Nếu bật, đọc stamp từ DB để biết revision, author và public; kiểm tra quyền trước khi dùng cache.
3. Template private bypass cache public (`BYPASS_PRIVATE`). Redis không sẵn sàng thì fallback store (`BYPASS_REDIS`).
4. Key có namespace, template id và revision. Nếu có giá trị hợp lệ là HIT; không có thì load, kiểm tra lại stamp trước khi fill.
5. `pending` map gom các yêu cầu đồng thời cho cùng key trong **một process**, tránh nhiều lần load giống nhau trong process đó; không phải distributed lock xuyên mọi instance.
6. TTL có jitter ngẫu nhiên để giảm nhiều key cùng hết hạn một lúc. `cacheTtl` cộng tối đa khoảng 20% tùy giá trị random.

**Vì sao vẫn đọc DB trước cache?** Đây là đánh đổi chi phí một truy vấn stamp để kiểm tra trạng thái quyền/revision mới, tránh dùng cache public đã cũ khi visibility thay đổi. Cache thường giúp giảm tải truy vấn/khối dữ liệu lớn, nhưng không tuyên bố 100% request không đụng DB.

### 10.2. Cache invalidation

Khi update/delete, service lấy stamp và thử invalidate. Versioned key giúp tách phiên bản; TTL giới hạn vòng đời dữ liệu nhưng không thay thế kiểm soát quyền. Lỗi Redis có thể được bỏ qua để API vẫn hoạt động theo dữ liệu bền vững. “Fail open cache” ở đây là bỏ qua cache để đọc nguồn thật, không có nghĩa bỏ qua authorization.

## 11. API, REST, HTTP và ETag

GET đọc, POST tạo/hành động theo contract, PATCH cập nhật một phần, DELETE xóa hoặc soft delete tùy endpoint. Không định nghĩa REST chỉ là “dùng JSON”. Response nên có status code phù hợp, hợp đồng đầu vào và lỗi nhất quán.

- `400`: dữ liệu/format không hợp lệ theo contract.
- `401`: thiếu hoặc không hợp lệ về xác thực.
- `403`: đã xác thực nhưng không đủ quyền, tùy chính sách che giấu tài nguyên.
- `404`: không tìm thấy hoặc không tiết lộ tài nguyên.
- `409`: xung đột nghiệp vụ, ví dụ trường hợp owner cuối cùng.
- `412`: `If-Match` cũ, bản client đang sửa không còn khớp revision.
- `428`: thiếu điều kiện `If-Match` theo contract cập nhật template.

`ETag`/`If-Match` dùng optimistic concurrency: đọc tài nguyên và ETag, gửi ETag trong lần sửa, server kiểm tra revision hiện tại; mismatch thì từ chối thay vì ghi đè bản mới của người khác. Client cần giữ bản nháp và để người dùng so sánh; retry mù với ETag mới có thể làm mất sửa đổi. Không nhầm ETag là khóa pessimistic trong database.

Swagger được cấu hình trong `src/openapi.ts` và các decorator. Swagger hỗ trợ tài liệu/hợp đồng tương tác; không thay cho authorization, test hoặc triển khai nghiệp vụ.

## 12. Resource Gateway và an toàn khi gọi API

Các bề mặt HTML khác nhau có ranh giới khác nhau: một file mở từ đĩa, web page theo origin và desktop IPC không tự có cùng quyền mạng. Trình duyệt có CORS, mixed content và chính sách origin; không nên “sửa” bằng cách tắt bảo vệ cho toàn ứng dụng.

Báo cáo tuần 6 mô tả các đường truy cập tài nguyên và gateway. Khi nói về gateway, giải thích mục tiêu: chuyển yêu cầu qua một điểm có chính sách, kiểm tra người dùng/quyền, hạn mức, mục tiêu mạng và audit theo phạm vi đã triển khai. Cần phân biệt cấu hình demo, dịch vụ local và deployment production. SSRF là rủi ro nếu server bị điều khiển gọi đến địa chỉ nội bộ; cần kiểm soát đích, DNS/redirect và thời gian chờ ở mọi hop. Đừng khẳng định toàn bộ lỗ hổng đã bị loại bỏ chỉ vì có gateway.

## 13. App, Electron và standalone HTML

### 13.1. Vì sao local-first?

Ứng dụng ưu tiên trải nghiệm làm việc với dữ liệu trên máy, không yêu cầu mọi thao tác editor đều qua backend. Điều này hữu ích khi mất mạng và cho phép người dùng giữ tài liệu. Local-first không tự đồng nghĩa đã có đồng bộ đa thiết bị, mã hóa dữ liệu hoặc giải quyết xung đột tự động.

Frontend dùng React/TypeScript và các store/module editor. Electron đóng gói ứng dụng web vào môi trường desktop; `electron/main.js`, `electron/preload.cjs` và các module IPC là điểm nên đọc. Main process và renderer có trách nhiệm khác nhau; preload expose API có kiểm soát thay vì cho trang truy cập toàn bộ Node tùy tiện. Trước khi nói chi tiết cấu hình `contextIsolation`, `sandbox`, phải đối chiếu source thực tế.

### 13.2. Tệp HTML standalone là gì?

Ứng dụng xuất tài liệu HTML kèm style, runtime và tài nguyên cần thiết để mở riêng. Một số công cụ nhúng sử dụng iframe; logic reader quản lý chế độ web, chế độ giấy và bản in. `src/components/NoteEditor/utils/htmlWrapper.ts` tạo wrapper; `standaloneReader.ts`, `standalonePublication.ts`, `publicationPlan.ts`, `templateSnapshot.ts` là các điểm đọc mã.

PagePlan là mô hình các mảnh nội dung/trang để hiển thị hoặc in một cách nhất quán. Khi tài liệu có công cụ, app có thể chụp trạng thái hiển thị để tạo bản in. Không đồng nhất số trang với bằng chứng mọi pixel đều đúng; kiểm tra hình học, nội dung, font và trường hợp biên cũng cần thiết.

### 13.3. Ví dụ lỗi thật: canvas HiDPI

Kích thước `canvas.height` là kích thước bitmap tính bằng device pixel; `getBoundingClientRect().height` là chiều cao hiển thị theo CSS pixel. Trên màn hình DPR 2, một canvas hiển thị cao 640 CSS px có thể có bitmap cao khoảng 1280 pixel. Nếu lấy 1280 làm chiều cao iframe theo CSS pixel, canvas lại phình theo iframe; vòng lặp ResizeObserver → iframe height → canvas resize có thể tăng rất mạnh và làm treo.

Mã mới đo theo CSS pixel, dừng vòng phản hồi. Kiểm thử trong phiên phát triển đo iframe ổn định trên DPR 1 và 2. Code mới cũng cho bảng vẽ vector trong standalone dạng web hoạt động; khi vẽ xong thông báo host chuẩn bị lại nội dung in. Nét vẽ trong phiên không tự ghi đè tệp HTML trên đĩa; có thể tải ảnh. Phải nhắc lại: commit sau bài nộp không tự cập nhật bộ cài đã phát hành.

### 13.4. Bảo vệ mã nguồn trong Electron

Electron thường chứa JavaScript/HTML/CSS được đóng gói; minify/obfuscate làm phân tích khó hơn, không biến thành bí mật tuyệt đối. Máy khách phải có mã hoặc tài nguyên để chạy, do đó không hứa “không thể dịch ngược”. Mã TypeScript thường được biên dịch thành JavaScript; JS đã build không nhất thiết khôi phục nguyên văn TS, tên biến, comment và cấu trúc ban đầu, nhưng logic vẫn có thể bị phân tích. Bí mật thực sự và quyết định phân quyền nhạy cảm cần ở backend; có đánh đổi về mạng, chi phí và quyền riêng tư.

## 14. Testing, bằng chứng và cách nói cho chuẩn

### 14.1. Các tầng kiểm thử

- Unit: kiểm tra hàm/lớp cô lập, test double; nhanh nhưng không chứng minh giao tiếp hạ tầng.
- API/integration: kết hợp nhiều module, kiểm tra HTTP/DB/broker tùy cấu hình test.
- End-to-end: đi qua luồng người dùng thực tế; cần nêu rõ backend, browser, DB, broker nào đang chạy thật hay giả lập.
- Regression: tái hiện lỗi cũ và giữ kiểm thử để lỗi không quay lại.
- Stress/load: nhiều dữ liệu/request/concurrency, cần môi trường, workload, số đo và tiêu chí rõ ràng.

### 14.2. Kết quả có thể dẫn

Tài liệu đối chiếu trong bộ nộp ghi backend b38390d, Node 24.21.0, `pnpm test`: 160 bài, 141 đạt, 0 lỗi, 19 bỏ qua. Thiếu Docker/PostgreSQL nên có các test cần hạ tầng không chạy. 44/44 và 91/91 trong báo cáo tổng kết là số lịch sử của lần kiểm trước; không tráo thành kết quả mới. Đừng nói “160 test đều pass” khi 19 skip.

Kiểm thử sửa bảng vẽ sau đó: một test Playwright trên HTML xuất từ mã nguồn, với DPR 1 và 2, kiểm tra chiều cao, vẽ, undo/redo; file Note1 mẫu cũng được thử vẽ và kiểm tra ảnh bản in thay đổi. Điều đó không chứng nhận toàn bộ trình duyệt và toàn bộ chức năng, cũng không thay thế test tích hợp hạ tầng của backend.

### 14.3. Kịch bản cần kiểm tiếp nếu có thời gian

- PostgreSQL thật: tạo/cập nhật template, kiểm tra transaction/outbox commit và rollback; xác nhận schema migration.
- RabbitMQ thật: restart broker/worker, kiểm tra publish confirm, ack, retry, dead queue và giao lại.
- Test duplicate event và nhiều dispatcher/consumer, kiểm tra unique index.
- Hai kết nối PostgreSQL cùng thay đổi/rời owner, kiểm tra bất biến, lock wait/deadlock và rollback.
- Redis thật: hit/miss, failover, xóa cache thất bại, thu hồi quyền và TTL.
- Snapshot/in với bản vẽ mới, đổi chế độ web/giấy, nhiều DPR và trình duyệt; kiểm tra chính sách lưu dữ liệu.

## 15. Hướng dẫn demo 10–12 phút

1. **0:00–1:00** Giới thiệu domain, người dùng, mục tiêu và hai bài toán khó.
2. **1:00–2:00** Chỉ sơ đồ app/API/PostgreSQL/RabbitMQ/Redis. Phân biệt app local-first và backend dịch vụ.
3. **2:00–4:30** Mở `postgres-template.store.ts` và `notification-repository.ts`: transaction, outbox, query `SKIP LOCKED`, `published_at`.
4. **4:30–6:00** Mở `notification-worker.ts` và SQL unique index: ACK, retry, at-least-once, chống trùng.
5. **6:00–8:00** Mở `workspaces.service.ts`: role, transaction, khóa owner, race condition. Nêu rõ cache role TTL và hạn chế thu hồi.
6. **8:00–9:30** Chỉ auth guard và cache: Bearer, session, Argon2id, kiểm tra quyền trước cache.
7. **9:30–10:30** Chỉ cursor/ETag hoặc HTML standalone tùy câu hỏi.
8. **10:30–12:00** Nêu kết quả test, giới hạn và hướng cải thiện. Trả lời câu hỏi.

Nếu demo trực tiếp không sẵn sàng: trình bày bằng source, sơ đồ, báo cáo và bằng chứng đã ghi. Không tuyên bố “demo vừa chạy thành công” khi chỉ cho xem ảnh cũ.

### 15.1. Chuẩn bị tối nay

- Mở sẵn báo cáo và các file nguồn được nêu dưới đây; kiểm tra đường dẫn trên máy thật.
- Xác định môi trường được phép chạy, cổng, Docker và dữ liệu demo; đừng reset DB hoặc lộ token.
- Tập 2 phút không nhìn tài liệu; sau đó tập vẽ luồng outbox và kể kịch bản hai owner.
- Nếu dùng bộ cài nộp beta.6, chỉ demo chức năng đúng bản đó; nếu dùng source mới, nói rõ khác revision.
- Ghi ba điều chưa chắc và trả lời trung thực. Không học vẹt những con số không hiểu.

## 16. Hỏi đáp nhanh — từ cơ bản đến phản biện

### A. Kiến trúc và NestJS

**1. Vì sao chọn domain này?** Vì kết hợp dữ liệu cục bộ và chia sẻ template, tạo bài toán thực về dữ liệu, quyền, thông báo và tương tác giữa các thành phần; nói thêm trải nghiệm cá nhân thật của bạn.

**2. Vì sao dùng NestJS?** Nó cung cấp cấu trúc module, DI, decorator, validation và tích hợp hệ sinh thái Node/TypeScript; đánh đổi là thêm abstraction và cần hiểu vòng đời provider.

**3. DI là gì?** Lớp nhận dependency từ container thay vì tự tạo; dễ thay thế khi test và giảm ghép cứng. Không phải cứ có DI thì thiết kế tự tốt.

**4. Middleware khác guard?** Middleware xử lý sớm theo request pipeline; guard quyết định quyền đi tiếp theo context/metadata Nest. Chi tiết thứ tự còn phụ thuộc cấu hình framework.

**5. Controller có nên query DB trực tiếp?** Có thể về kỹ thuật, nhưng ở đây tách controller/service/store giúp ranh giới và test rõ hơn; không biến quy ước thành luật tuyệt đối.

**6. DTO có tác dụng gì?** Mô tả và kiểm tra cấu trúc dữ liệu vào/ra theo contract; nghiệp vụ và quyền vẫn phải kiểm tra thêm.

**7. Tại sao TypeScript?** Kiểm tra kiểu tĩnh, dễ điều hướng và refactor. Kiểu TS bị xóa khi chạy nên runtime vẫn phải validate dữ liệu không tin cậy.

**8. Vì sao async/await?** Biểu diễn thao tác I/O bất đồng bộ dễ đọc; vẫn cần try/catch, timeout, xử lý concurrency và lifecycle.

### B. Bảo mật và xác thực

**9. Hash khác mã hóa?** Hash mật khẩu là một chiều để verify; mã hóa cần khóa giải mã để khôi phục nội dung. JWT ký không đồng nghĩa mã hóa payload.

**10. Vì sao Argon2id?** Hàm hash mật khẩu có chi phí tính toán/bộ nhớ điều chỉnh được; làm đoán hàng loạt tốn hơn so với hash nhanh. Tham số phải được đánh giá phù hợp môi trường.

**11. Vì sao không lưu refresh token plaintext?** Giảm thiệt hại khi database bị lộ: chỉ lưu hash cho việc đối chiếu. Bảo mật toàn hệ thống vẫn phụ thuộc nhiều lớp.

**12. Rotation để làm gì?** Sau refresh cấp token mới và vô hiệu token trước theo chính sách store; giảm khả năng token cũ tiếp tục được tái sử dụng.

**13. 401 và 403?** 401 là thiếu/không hợp lệ xác thực; 403 là không đủ quyền sau khi xác định identity. Có endpoint dùng 404 để hạn chế lộ sự tồn tại.

**14. Kiểm tra role ở frontend có đủ không?** Không, client có thể gọi HTTP trực tiếp; server phải kiểm tra identity, membership và quyền tài nguyên.

**15. Keycloak/GitHub đã làm chưa?** Chưa, đó là kế hoạch tiếp theo; auth hiện tại không được nhận là Keycloak.

**16. CORS có phải authentication?** Không. CORS là cơ chế trình duyệt kiểm soát truy cập giữa origin; công cụ HTTP ngoài browser vẫn có thể gửi request, nên backend vẫn phải xác thực và phân quyền.

### C. Database và transaction

**17. ACID?** Atomicity: cùng thành công/thất bại; consistency: bảo toàn ràng buộc hợp lệ; isolation: kiểm soát ảnh hưởng giao dịch đồng thời; durability: commit bền vững theo cơ chế DB.

**18. Race condition là gì?** Kết quả phụ thuộc xen kẽ bất ngờ của hai luồng; ví dụ hai owner cùng kiểm tra trước khi tự xóa.

**19. `FOR UPDATE` làm gì?** Khóa các hàng được chọn cho transaction, khiến giao dịch cạnh tranh phải chờ hoặc theo chính sách lock. Phải xác định đúng hàng, thứ tự khóa và isolation.

**20. `SKIP LOCKED` khác chờ?** Bỏ qua hàng đang khóa để worker lấy hàng khác; tăng khả năng xử lý song song nhưng không bảo đảm thứ tự hoàn hảo hay hết starvation trong mọi tình huống.

**21. Optimistic và pessimistic locking?** Optimistic phát hiện xung đột khi ghi, ví dụ ETag; pessimistic chủ động giữ khóa DB trước thao tác, ví dụ owner rows. Mỗi cách có chi phí và use case khác nhau.

**22. Index có mặt trái?** Tốn dung lượng và chi phí cập nhật khi insert/update/delete; phải đo query thật và dữ liệu đại diện.

**23. ORM có tự ngăn SQL injection?** Parameter binding giúp với giá trị; SQL động không an toàn nếu nối string từ input. Cần kiểm tra cụ thể.

**24. Transaction có bao cả RabbitMQ không?** Không mặc định; PostgreSQL transaction chỉ đảm bảo dữ liệu trong DB. Outbox thu hẹp khoảng mất sự kiện bằng cách ghi ý định cùng transaction.

### D. Queue và outbox

**25. Tại sao không gửi thông báo đồng bộ?** Xử lý fanout/email có thể chậm hoặc lỗi; queue tách luồng request khỏi tác vụ nền. Phải chấp nhận eventual consistency và vận hành thêm worker/broker.

**26. Outbox giải quyết gì?** Đảm bảo thay đổi DB và ý định phát sự kiện cùng commit; không tự hứa message chỉ được gửi đúng một lần.

**27. Thời điểm nào bị lặp?** Sau broker đã nhận nhưng trước khi đánh dấu outbox commit; khi khởi động lại có thể phát lại.

**28. Chống trùng bằng gì?** Khóa nghiệp vụ `(recipient_id, template_id, revision)`, unique index và `ON CONFLICT DO NOTHING`, thêm lock theo revision trong consumer.

**29. `ack` sau xử lý để làm gì?** Tránh broker coi message hoàn tất trước khi tác vụ cần thiết thực sự thành công. Có thể vẫn có duplicate nếu crash sau DB commit trước ack.

**30. Retry và dead queue?** Retry cho lỗi tạm thời; dead queue cô lập lỗi không thể xử lý hoặc quá số lần. Cần monitoring và quy trình xử lý lại.

**31. Exactly-once đã bảo đảm chưa?** Không nên khẳng định. Thiết kế chấp nhận giao lại và bảo vệ hiệu ứng thông báo bằng idempotency trong phạm vi khóa nghiệp vụ.

**32. 100 follower/batch nghĩa là 100 INSERT một lệnh?** Không. Code hiện chia vòng lặp nhưng vẫn INSERT từng recipient; cần nói rõ chi phí.

### E. Cache, phân trang và API

**33. Redis có thay PostgreSQL?** Không trong thiết kế này. DB là nguồn dữ liệu bền vững; Redis phục vụ cache/quyền hoặc tác vụ phụ trợ tùy module.

**34. Nếu Redis chết?** Template cache có nhánh bypass để đọc store. Với cache role, cần xem chính xác trường hợp fail/invalidation; không hứa mọi thay đổi quyền tức thời.

**35. Cache stampede?** Nhiều request cùng miss gây nhiều lần tải; code có `pending` map trong process và TTL jitter, nhưng không phải khóa phân tán toàn cluster.

**36. Cursor tại sao có cả id?** Timestamp có thể trùng. ID làm tie-breaker để thứ tự xác định và vị trí tiếp tục không mơ hồ.

**37. Base64 cursor có bảo mật không?** Không; chỉ là biểu diễn. Không đưa bí mật vào cursor và vẫn kiểm tra quyền, format phía server.

**38. Vì sao cần ETag?** Ngăn cập nhật dựa trên revision cũ ghi đè bản sửa mới; client phải xử lý 412/428 theo hợp đồng.

**39. Xóa mềm là gì?** Đánh dấu bản ghi đã xóa thay vì loại vật lý ngay; query phải lọc nhất quán, và dữ liệu vẫn có chính sách lưu/khôi phục/xóa thật.

### F. Frontend, triển khai và phản biện

**40. Local-first có nghĩa gì?** Thiết kế ưu tiên thao tác/dữ liệu cục bộ; không tự chứng minh mã hóa, đồng bộ hay chia sẻ offline đã hoàn chỉnh.

**41. Electron có giấu được JS không?** Có thể đóng gói/làm rối để tăng công phân tích, nhưng không hứa bí mật tuyệt đối trên máy khách.

**42. Tại sao HTML canvas bị lag trên màn hình nét?** Vì nhầm bitmap device pixel với CSS pixel tạo vòng phản hồi tăng chiều cao iframe; đã sửa ở source mới, không tự sửa build cũ.

**43. Bảng standalone có tự lưu file không?** Bản sửa cho vẽ trong phiên, không tự ghi đè HTML; cần tính năng lưu/xuất có thiết kế và được xác nhận riêng.

**44. Tại sao 19 test bị skip?** Lần chạy mô tả thiếu dịch vụ ngoài, vì vậy một số test yêu cầu hạ tầng không được thực thi. Không tính skip thành pass.

**45. Khó nhất và hạn chế lớn nhất?** Chọn một câu chuyện bạn thực sự hiểu. Ví dụ khó nhất là phân tích tính nhất quán khi broker và DB lỗi độc lập; hạn chế là chưa chạy đủ tổ hợp failure/concurrency trên hạ tầng thật.

**46. Nếu triển khai production ngày mai?** Cần kiểm thử hạ tầng thật, quản lý secret, quan sát queue/outbox, backup/khôi phục, bảo mật quyền và test tải; không khẳng định demo hiện tại đã sẵn sàng production.

## 17. Bài tập tự kiểm tra

1. Tự vẽ sơ đồ API → DB/outbox → dispatcher → RabbitMQ → consumer → notifications; đánh dấu 3 vị trí crash và mô tả dữ liệu còn lại.
2. Không nhìn tài liệu, giải thích `FOR UPDATE SKIP LOCKED` và tại sao vẫn có thể publish trùng.
3. Kể xen kẽ request của A và B khi cùng rời workspace; giải thích khóa được giữ đến lúc nào.
4. Nêu sự khác nhau giữa kiểm tra quyền template trước cache và cache role workspace TTL 600 giây.
5. Giải thích trường hợp hai thông báo cùng `created_at`, tại sao cursor có id.
6. Nói chính xác phiên bản app đã nộp, commit backend và ý nghĩa 141 pass/19 skip.
7. Mở file thật và chỉ vị trí auth guard, unique index, notification worker, owner lock, ETag; giải thích mỗi dòng bằng lời của mình.
8. Tự trả lời: chức năng nào trong dự án là kế hoạch, chức năng nào có bằng chứng chạy thật, bằng chứng ấy giới hạn đến đâu?

## 18. Bản đồ mã nguồn để mở nhanh

Đường dẫn tính từ thư mục EruSentia ngoài cùng:

- `erusentia-server/src/main.ts`: bootstrap và khởi động.
- `erusentia-server/src/app.ts`: module, CORS, ValidationPipe, TypeORM, Swagger.
- `erusentia-server/src/auth/auth.controller.ts`, `auth.service.ts`, `auth.guards.ts`, `passwords.ts`: đăng nhập, session/JWT, guard, Argon2id.
- `erusentia-server/src/templates/templates.controller.ts`, `templates.service.ts`: API, ETag, phối hợp store/cache.
- `erusentia-server/src/templates/persistence/postgres-template.store.ts`: transaction và ghi outbox ở đường cập nhật.
- `erusentia-server/src/messaging/notification-repository.ts`, `notification-worker.ts`, `rabbit.ts`: dispatcher, consumer, fanout, retry.
- `erusentia-server/sql/12_template_notifications.sql`: follow, unique idempotency, index feed.
- `erusentia-server/src/notifications/notifications.service.ts`: feed và cursor.
- `erusentia-server/src/workspaces/workspaces.controller.ts`, `workspaces.service.ts`, `sql/13_workspaces_rbac.sql`: workspace, role, lời mời và khóa.
- `erusentia-server/src/cache/template-cache.ts`: cache-aside, stamp và authorization.
- `erusentia-app/src/components/NoteEditor/utils/htmlWrapper.ts`, `standaloneReader.ts`, `standalonePublication.ts`: HTML độc lập, reader, publication.
- `erusentia-app/src/config/defaultTemplates/templates/whiteboard.ts`: model, canvas, công cụ vẽ.
- `trainning-typ-2026/week-6/WEEK6_REPORT.md`: báo cáo kỹ thuật lịch sử, đặc biệt các mục 5, 6, 11 và phụ lục A.
- `deliverables/NguyenTienTuan_TYP_Week6_EruSentia_beta6_Final3146_HTML_20261120/05_Backend/DOI_CHIEU_BAO_CAO.md`: commit, kết quả kiểm thử và giới hạn kiểm chứng của bộ nộp.

## 19. Từ điển thuật ngữ

- **API**: giao diện để chương trình khác gọi chức năng theo contract.
- **Backend**: phần xử lý nghiệp vụ và dữ liệu phía dịch vụ.
- **Bearer token**: token trình bày trong header theo dạng Bearer; ai nắm được có thể sử dụng theo quyền/hiệu lực của nó.
- **Broker**: thành phần trung gian nhận/định tuyến message, ví dụ RabbitMQ.
- **Consumer**: bên nhận và xử lý message.
- **Cursor**: dấu mốc lấy trang tiếp theo theo một thứ tự.
- **DTO**: đối tượng/kiểu mô tả dữ liệu trao đổi và validation.
- **Eventual consistency**: các thành phần có thể chưa đồng bộ ngay, nhưng hướng tới cập nhật sau nếu hệ thống xử lý thành công.
- **Fanout**: từ một sự kiện phân phối tới nhiều người nhận.
- **Guard**: lớp quyết định request có được đi tiếp theo điều kiện.
- **Idempotent**: xử lý lặp cùng đầu vào/khóa nghiệp vụ mà hiệu ứng được định nghĩa không bị nhân lên.
- **Outbox**: bảng ghi ý định phát sự kiện trong cùng transaction với dữ liệu nghiệp vụ.
- **RBAC**: kiểm soát quyền theo vai trò; trong dự án cần phân biệt role hệ thống và membership workspace.
- **Revision**: số/định danh phiên bản nội dung; cần xem từng loại revision, không gộp mọi version làm một.
- **TTL**: thời gian sống của cache/message theo cấu hình; hết TTL không có nghĩa mọi bản sao trên hệ thống đã bị xóa.
- **Worker**: tiến trình/tác vụ nền xử lý công việc ngoài vòng request trực tiếp.

## 20. Cách trả lời khi bị hỏi ngoài phần đã kiểm chứng

Dùng bốn bước: (1) nhắc lại giả định, (2) nói điều source hoặc test thực sự thể hiện, (3) chỉ ra tình huống chưa được chứng minh, (4) đề xuất cách kiểm tra. Ví dụ: “Repository dùng unique index và `ON CONFLICT` để tránh notification trùng theo recipient/template/revision. Em chưa có kết quả xác nhận toàn bộ failure path với broker thật ở môi trường này; em sẽ chạy RabbitMQ/PostgreSQL thật, inject crash trước/sau ACK và kiểm tra số dòng trong DB.”

Điều giảng viên cần thấy là bạn hiểu quan hệ giữa vấn đề, giải pháp, trade-off và bằng chứng — không phải bạn thuộc tất cả tên file.

## 21. Chuyên khảo đọc code theo từng đoạn

Mỗi mục có khái niệm, trạng thái áp dụng, trích dẫn source có số dòng, giải thích và câu hỏi phản biện. Các dòng mã trong một đoạn liền kề được giữ nguyên; comment đánh số thêm ở đầu dòng chỉ để đối chiếu. Link nguồn mở file đúng vị trí bắt đầu; tham khảo tài liệu chuyên biệt để đọc toàn cảnh.

### 21.1 Khởi động backend và cấu hình toàn cục

**Khái niệm.** NestJS module là đơn vị tổ chức provider/controller; dependency injection cấp phụ thuộc. Validation là kiểm tra input; CORS là chính sách trình duyệt, không phải xác thực.

**Tình trạng áp dụng.** Đã áp dụng dynamic module, TypeORM theo cấu hình và ValidationPipe. Không mặc định đồng bộ schema; chưa thể suy ra mọi input nghiệp vụ hợp lệ chỉ từ DTO.

**Nguồn mã:** [erusentia-server/src/app.ts:31](../../erusentia-server/src/app.ts#L31); **tài liệu chuyên biệt:** [erusentia-server/docs/WORKSPACE_DEVELOPMENT.md](../../erusentia-server/docs/WORKSPACE_DEVELOPMENT.md).

```text
0031 |       module: AppModule,
0032 |       controllers: [HealthController],
0033 |       imports: [
0034 |         ...(settings.store === "postgres"
0035 |           ? [
0036 |               TypeOrmModule.forRoot({
0037 |                 type: "postgres",
0038 |                 ...settings.database,
0039 |                 entities: [
0040 |                   ...entities,
0041 |                   RefreshSessionEntity,
0042 |                   AdminAuditLogEntity,
0043 |                 ],
0044 |                 synchronize: false,
0045 |                 migrationsRun: false,
0046 |                 installExtensions: false,
0047 |                 logging: false,
0048 |                 retryAttempts: 1,
0049 |                 extra: { connectionTimeoutMillis: 10000 },
0050 |               }),
0051 |             ]
0052 |           : []),
0053 |         OperationsModule,
0054 |         ServiceControlsModule.register(settings),
0055 |         AuthModule.register(settings),
0056 |         CategoriesModule.register(settings.store),
0057 |         templates,
0058 |         NotificationsModule.register(settings, templates),
0059 |         WorkspacesModule.register(settings),
0060 |         resources,
0061 |         ExtensionsModule,
0062 |         AdminModule.register(settings, [templates, resources]),
0063 |       ],
0064 |     };
0065 |   }
0066 | }
0067 |
0068 | export async function createApplication(
0069 |   settings: AppConfig,
0070 |   logger: false | undefined = undefined,
0071 | ) {
0072 |   const app = await NestFactory.create<NestExpressApplication>(
0073 |     AppModule.register(settings),
0074 |     {
0075 |       logger,
0076 |       abortOnError: false,
0077 |     },
0078 |   );
0079 |   app.use(app.get(ApiOperations).middleware());
0080 |   app.enableCors({
0081 |     origin: (origin, done) =>
0082 |       done(null, !origin || settings.corsOrigins.includes(origin)),
0083 |     methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
0084 |     allowedHeaders: ["Authorization", "Content-Type", "If-Match"],
0085 |     exposedHeaders: [
0086 |       "X-Cache",
0087 |       "WWW-Authenticate",
0088 |       "ETag",
0089 |       "Retry-After",
0090 |       "X-Request-Id",
0091 |     ],
0092 |     credentials: false,
0093 |     maxAge: 600,
0094 |   });
0095 |   app.useBodyParser("json", { limit: "2mb" });
0096 |   if (settings.serviceControls.trustProxyHops)
0097 |     app.set("trust proxy", settings.serviceControls.trustProxyHops);
0098 |   app.useGlobalPipes(
0099 |     new ValidationPipe({
0100 |       transform: true,
0101 |       whitelist: true,
0102 |       forbidNonWhitelisted: true,
0103 |       transformOptions: { enableImplicitConversion: false },
0104 |     }),
0105 |   );
```

**Giải thích theo luồng.** Đọc lần lượt `register(settings)` và danh sách imports để thấy thành phần được chọn theo cấu hình; `synchronize: false` yêu cầu schema được quản lý riêng. `enableCors` so origin với danh sách; `ValidationPipe` transform, whitelist và từ chối trường lạ. `2mb` là giới hạn JSON, không phải giới hạn cho mọi giao thức.

**Câu hỏi và cách trả lời.** Tại sao CORS không phải authorization? Người gọi HTTP không dùng browser không bị browser chặn; server vẫn cần guard và quyền.

### 21.2 Controller, route và injection

**Khái niệm.** Controller ánh xạ HTTP thành lời gọi ứng dụng; decorator cung cấp metadata route; dependency injection cho controller nhận service.

**Tình trạng áp dụng.** Đã áp dụng @Controller, @Get, @Post, DTO và CurrentUser. Đoạn này không tự chứng minh service đã kiểm tra mọi quyền tài nguyên.

**Nguồn mã:** [erusentia-server/src/templates/templates.controller.ts:80](../../erusentia-server/src/templates/templates.controller.ts#L80); **tài liệu chuyên biệt:** [erusentia-server/docs/AUTHENTICATION.md](../../erusentia-server/docs/AUTHENTICATION.md).

```text
0080 | @ApiForbiddenResponse({ type: ApiErrorDto })
0081 | @ApiBadRequestResponse({ type: ApiErrorDto })
0082 | @ApiInternalServerErrorResponse({ type: ApiErrorDto })
0083 | @Controller("templates")
0084 | @RateLimited("write")
0085 | export class TemplatesController {
0086 |   constructor(private readonly service: TemplatesService) {}
0087 |   @Get()
0088 |   @ApiOperation({
0089 |     summary: "List and paginate templates",
0090 |     description:
0091 |       "Use projection=summary for a catalog without HTML. contentFormat/schemaVersion filters apply before count and pagination. Defaults preserve the full week-2 contract.",
0092 |   })
0093 |   @ApiOkResponse({
0094 |     schema: {
0095 |       oneOf: [
0096 |         { $ref: getSchemaPath(TemplatePageDto) },
0097 |         { $ref: getSchemaPath(TemplateSummaryPageDto) },
0098 |       ],
0099 |     },
0100 |   })
0101 |   list(@Query() query: QueryTemplatesDto, @CurrentUser() user: UserIdentity) {
0102 |     return this.service.list(query, user);
0103 |   }
0104 |   @Get(":id")
0105 |   @ApiOperation({ summary: "Read a template" })
0106 |   @ApiParam({ name: "id", format: "uuid" })
0107 |   @ApiOkResponse({
0108 |     type: TemplateResponseDto,
0109 |     headers: {
0110 |       ...etagHeader,
0111 |       "X-Cache": {
0112 |         description:
0113 |           "Server-side projection cache path; authorization is always evaluated first.",
0114 |         schema: {
0115 |           type: "string",
0116 |           enum: [
0117 |             "HIT",
0118 |             "MISS",
0119 |             "COALESCED",
0120 |             "BYPASS_DISABLED",
0121 |             "BYPASS_PRIVATE",
0122 |             "BYPASS_REDIS",
0123 |           ],
0124 |         },
0125 |       },
0126 |     },
0127 |   })
0128 |   @ApiNotFoundResponse({ type: ApiErrorDto })
0129 |   async find(
0130 |     @Param("id", UuidPipe) id: string,
0131 |     @CurrentUser() user: UserIdentity,
0132 |     @Res({ passthrough: true })
0133 |     response: { setHeader(name: string, value: string): void },
0134 |   ) {
0135 |     const result = await this.service.read(id, user);
0136 |     response.setHeader("X-Cache", result.status);
0137 |     response.setHeader("ETag", templateEtag(result.row));
0138 |     return result.row;
0139 |   }
0140 |   @Post()
0141 |   @ApiOperation({ summary: "Create a template" })
0142 |   @ApiCreatedResponse({ type: TemplateResponseDto, headers: etagHeader })
0143 |   @ApiConflictResponse({ type: ApiErrorDto })
0144 |   @ApiPayloadTooLargeResponse({ type: ApiErrorDto })
0145 |   async create(
0146 |     @Body() body: CreateTemplateDto,
0147 |     @CurrentUser() user: UserIdentity,
0148 |     @Res({ passthrough: true }) response: ResponseHeaders,
0149 |   ) {
0150 |     const row = await this.service.create(body, user);
0151 |     response.setHeader("ETag", templateEtag(row));
```

**Giải thích theo luồng.** `constructor` nhận TemplatesService. `list` lấy query và user; `find` parse UUID, gọi `service.read`, đặt header `X-Cache` và `ETag`. `create` chuyển body cùng user sang service và trả ETag. Các `@Api...` mô tả tài liệu, không tự thực thi authorization.

**Câu hỏi và cách trả lời.** Nếu ai đó sửa userId trong JSON? Không lấy danh tính từ payload; guard phải xác thực và service phải kiểm tra quyền.

### 21.3 Argon2id và dummy hash

**Khái niệm.** Password hashing là phép băm một chiều có chủ đích tốn tài nguyên để kiểm tra mật khẩu; khác mã hóa giải mã được. Dummy hash là phép tính giả dùng làm giảm khác biệt thời gian khi tài khoản không tồn tại.

**Tình trạng áp dụng.** Đã áp dụng Argon2id, salt/hash được thư viện xử lý, và dummy verification; không chứng minh toàn hệ thống miễn nhiễm timing attack.

**Nguồn mã:** [erusentia-server/src/auth/passwords.ts:1](../../erusentia-server/src/auth/passwords.ts#L1); **tài liệu chuyên biệt:** [erusentia-server/docs/AUTHENTICATION.md](../../erusentia-server/docs/AUTHENTICATION.md).

```text
0001 | import { Injectable } from "@nestjs/common";
0002 | import { Algorithm, hash, verify } from "@node-rs/argon2";
0003 | import { randomBytes } from "node:crypto";
0004 |
0005 | @Injectable()
0006 | export class Passwords {
0007 |   // A valid dummy hash gives unknown accounts the same password-verification work.
0008 |   private readonly dummy = this.hash(randomBytes(32).toString("hex"));
0009 |
0010 |   hash(password: string): Promise<string> {
0011 |     return hash(password, {
0012 |       algorithm: Algorithm.Argon2id,
0013 |       memoryCost: 19456,
0014 |       timeCost: 2,
0015 |       parallelism: 1,
0016 |       outputLen: 32,
0017 |     });
0018 |   }
0019 |
0020 |   async verify(password: string, encoded?: string): Promise<boolean> {
0021 |     const supported = encoded?.startsWith("$argon2id$");
0022 |     try {
0023 |       const result = await verify(
0024 |         supported ? encoded! : await this.dummy,
0025 |         password,
0026 |       );
0027 |       return !!supported && result;
0028 |     } catch {
0029 |       // Week-1 seed hashes are placeholders, not valid login credentials.
0030 |       await verify(await this.dummy, password);
0031 |       return false;
0032 |     }
0033 |   }
0034 | }
```

**Giải thích theo luồng.** `hash` chọn Argon2id và tham số memory/time/parallelism. `verify` nhận hash đã lưu nếu đúng định dạng; nếu thiếu thì dùng dummy; chỉ trả true khi hash được hỗ trợ và verify thành công. `catch` tiếp tục thực hiện dummy verify rồi trả false.

**Câu hỏi và cách trả lời.** Tại sao SHA-256 nhanh không phù hợp làm password hash? Mật khẩu thường có entropy thấp, hàm hash nhanh khiến đoán hàng loạt rẻ hơn.

### 21.4 Đăng nhập và refresh token

**Khái niệm.** Authentication xác định danh tính. Refresh token là bí mật dùng để đổi token truy cập; hash refresh token được dùng để không lưu bí mật dạng gốc.

**Tình trạng áp dụng.** Đã tạo token ngẫu nhiên 32 byte, session và hash token; không đồng nhất đây với Keycloak hay OAuth.

**Nguồn mã:** [erusentia-server/src/auth/auth.service.ts:19](../../erusentia-server/src/auth/auth.service.ts#L19); **tài liệu chuyên biệt:** [erusentia-server/docs/AUTHENTICATION.md](../../erusentia-server/docs/AUTHENTICATION.md).

```text
0019 | export const tokenHash = (token: string) =>
0020 |   createHash("sha256").update(token).digest("hex");
0021 |
0022 | @Injectable()
0023 | export class AuthService {
0024 |   constructor(
0025 |     @Inject(AUTH_STORE) private readonly store: AuthStore,
0026 |     private readonly passwords: Passwords,
0027 |     private readonly email: AccountEmailService,
0028 |     private readonly jwt: JwtService,
0029 |     @Inject(AUTH_SETTINGS) private readonly settings: AppConfig["auth"],
0030 |   ) {}
0031 |   async register(input: RegisterDto) {
0032 |     const user = await this.store.createUser({
0033 |       email: input.email,
0034 |       passwordHash: await this.passwords.hash(input.password),
0035 |       role: "user",
0036 |     });
0037 |     if (this.email.enabled()) {
0038 |       try {
0039 |         await this.email.sendVerification(user.id);
0040 |       } catch {
0041 |         console.warn("ACCOUNT_EMAIL_INITIAL_REQUEST_FAILED");
0042 |       }
0043 |     }
0044 |     return userIdentity(user);
0045 |   }
0046 |   async login(input: LoginDto) {
0047 |     const user = await this.store.findByEmail(input.email);
0048 |     const verified = await this.passwords.verify(
0049 |       input.password,
0050 |       user?.passwordHash,
0051 |     );
0052 |     if (!verified || !active(user))
0053 |       throw new UnauthorizedException("Invalid email or password");
0054 |     const refreshToken = randomBytes(32).toString("base64url");
0055 |     const now = new Date();
0056 |     const session: RefreshSession = {
0057 |       id: randomUUID(),
0058 |       familyId: randomUUID(),
0059 |       userId: user.id,
0060 |       tokenHash: tokenHash(refreshToken),
0061 |       createdAt: now,
0062 |       expiresAt: new Date(
0063 |         now.getTime() + this.settings.refreshTtlSeconds * 1000,
0064 |       ),
0065 |       usedAt: null,
0066 |       revokedAt: null,
0067 |     };
0068 |     if (
0069 |       !(await this.store.addSessionIfCredentialsMatch(
0070 |         session,
0071 |         user.passwordHash,
0072 |       ))
0073 |     )
0074 |       throw new UnauthorizedException("Invalid email or password");
0075 |     return this.tokens(user, session, refreshToken);
0076 |   }
```

**Giải thích theo luồng.** Đọc `tokenHash` và `login`: tìm email, verify cả trường hợp user thiếu, từ chối nếu sai/không active. Tạo session UUID/familyId, hash refreshToken, timestamps; `addSessionIfCredentialsMatch` kiểm tra điều kiện khi lưu. Chỉ trả token sau khi lưu session thành công.

**Câu hỏi và cách trả lời.** Vì sao hash refresh token dùng SHA-256 còn password dùng Argon2id? Refresh token ngẫu nhiên 32 byte có entropy cao; mật khẩu người dùng có thể dễ đoán và cần hash chậm.

### 21.5 JWT, rotation và kiểm tra session

**Khái niệm.** JWT có chữ ký chứa claim; token rotation thay refresh token sau khi sử dụng. Issuer/audience giới hạn nơi phát hành và nơi sử dụng theo cấu hình.

**Tình trạng áp dụng.** Đã ký access token với sub, sid, tokenUse, jti; verify HS256, issuer, audience và kiểm tra session. Chữ ký JWT không mã hóa payload.

**Nguồn mã:** [erusentia-server/src/auth/auth.service.ts:77](../../erusentia-server/src/auth/auth.service.ts#L77); **tài liệu chuyên biệt:** [erusentia-server/docs/AUTHENTICATION.md](../../erusentia-server/docs/AUTHENTICATION.md).

```text
0077 |   private async tokens(
0078 |     user: UserAccount,
0079 |     session: RefreshSession,
0080 |     refreshToken: string,
0081 |   ) {
0082 |     const accessToken = await this.jwt.signAsync({
0083 |       sub: user.id,
0084 |       sid: session.familyId,
0085 |       tokenUse: "access",
0086 |       jti: randomUUID(),
0087 |     });
0088 |     return {
0089 |       accessToken,
0090 |       refreshToken,
0091 |       tokenType: "Bearer" as const,
0092 |       expiresIn: this.settings.accessTtlSeconds,
0093 |       refreshExpiresAt: session.expiresAt,
0094 |       user: userIdentity(user),
0095 |     };
0096 |   }
0097 |   async refresh(token: string) {
0098 |     const next = randomBytes(32).toString("base64url");
0099 |     const rotated = await this.store.rotateSession(
0100 |       tokenHash(token),
0101 |       tokenHash(next),
0102 |       randomUUID(),
0103 |       new Date(),
0104 |     );
0105 |     if (!rotated)
0106 |       throw new UnauthorizedException("Invalid or expired refresh token");
0107 |     return this.tokens(rotated.user, rotated.session, next);
0108 |   }
0109 |   logout(token: string) {
0110 |     return this.store.revokeSessionFamily(tokenHash(token), new Date());
0111 |   }
0112 |   async authenticate(token: string) {
0113 |     return (await this.authenticateSession(token)).user;
0114 |   }
0115 |   async authenticateSession(token: string) {
0116 |     let payload: {
0117 |       sub?: string;
0118 |       sid?: string;
0119 |       tokenUse?: string;
0120 |       exp?: number;
0121 |     };
0122 |     try {
0123 |       payload = await this.jwt.verifyAsync(token, {
0124 |         algorithms: ["HS256"],
0125 |         issuer: "erusentia-server",
0126 |         audience: "erusentia-api",
0127 |       });
0128 |     } catch {
0129 |       throw new UnauthorizedException("Invalid or expired access token");
0130 |     }
0131 |     if (
0132 |       payload.tokenUse !== "access" ||
0133 |       !payload.sub ||
0134 |       !UUID_PATTERN.test(payload.sub) ||
0135 |       !payload.sid ||
0136 |       !UUID_PATTERN.test(payload.sid) ||
0137 |       !Number.isInteger(payload.exp) ||
0138 |       payload.exp! <= Date.now() / 1000
0139 |     )
0140 |       throw new UnauthorizedException("Invalid or expired access token");
0141 |     const [user, validSession] = await Promise.all([
0142 |       this.store.findById(payload.sub),
0143 |       this.store.isSessionActive(payload.sub, payload.sid, new Date()),
0144 |     ]);
0145 |     if (!active(user) || !validSession)
0146 |       throw new UnauthorizedException("Session is no longer active");
0147 |     return { user: userIdentity(user), sessionId: payload.sid };
0148 |   }
0149 | }
```

**Giải thích theo luồng.** `tokens` phát access/refresh; `refresh` tạo token mới, truyền hash cũ/mới vào store; không tìm thấy phiên hợp lệ thì 401. `authenticateSession` verify JWT, validate claim và expiry, đồng thời kiểm tra user và phiên còn active. Không suy diễn chính sách reuse detection sâu hơn implementation store.

**Câu hỏi và cách trả lời.** Tại sao JWT vẫn cần DB/session? Dự án chọn khả năng kiểm tra session và thu hồi; đổi lại request có thể cần truy vấn trạng thái.

### 21.6 Guard và role hệ thống

**Khái niệm.** Guard là thành phần quyết định request có được tiếp tục; authentication trả identity, authorization so quyền với yêu cầu.

**Tình trạng áp dụng.** Đã phân biệt route public và roles metadata, gắn identity/session vào request. Role hệ thống không đồng nhất membership workspace.

**Nguồn mã:** [erusentia-server/src/auth/auth.guards.ts:13](../../erusentia-server/src/auth/auth.guards.ts#L13); **tài liệu chuyên biệt:** [erusentia-server/docs/AUTHENTICATION.md](../../erusentia-server/docs/AUTHENTICATION.md).

```text
0013 |
0014 | const PUBLIC = Symbol("public");
0015 | const ROLES = Symbol("roles");
0016 | export const Public = () => SetMetadata(PUBLIC, true);
0017 | export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
0018 | export const CurrentUser = createParamDecorator(
0019 |   (_: unknown, context: ExecutionContext): UserIdentity =>
0020 |     context.switchToHttp().getRequest().user,
0021 | );
0022 |
0023 | export const CurrentSession = createParamDecorator(
0024 |   (_: unknown, context: ExecutionContext): string =>
0025 |     context.switchToHttp().getRequest().sessionId,
0026 | );
0027 |
0028 | @Injectable()
0029 | export class AccessTokenGuard implements CanActivate {
0030 |   constructor(
0031 |     private readonly reflector: Reflector,
0032 |     private readonly auth: AuthService,
0033 |   ) {}
0034 |   async canActivate(context: ExecutionContext) {
0035 |     context.switchToHttp().getResponse().setHeader("Cache-Control", "no-store");
0036 |     if (
0037 |       this.reflector.getAllAndOverride<boolean>(PUBLIC, [
0038 |         context.getHandler(),
0039 |         context.getClass(),
0040 |       ])
0041 |     )
0042 |       return true;
0043 |     const request = context.switchToHttp().getRequest();
0044 |     const authorization: unknown = request.headers.authorization;
0045 |     const match =
0046 |       typeof authorization === "string"
0047 |         ? /^Bearer ([^\s]+)$/i.exec(authorization)
0048 |         : null;
0049 |     if (!match) throw new UnauthorizedException("Bearer access token required");
0050 |     const identity = await this.auth.authenticateSession(match[1]);
0051 |     request.user = identity.user;
0052 |     request.sessionId = identity.sessionId;
0053 |     return true;
0054 |   }
0055 | }
0056 |
0057 | @Injectable()
0058 | export class RolesGuard implements CanActivate {
0059 |   constructor(private readonly reflector: Reflector) {}
0060 |   canActivate(context: ExecutionContext) {
0061 |     const roles = this.reflector.getAllAndOverride<Role[]>(ROLES, [
0062 |       context.getHandler(),
0063 |       context.getClass(),
0064 |     ]);
0065 |     if (!roles) return true;
0066 |     const user: UserIdentity | undefined = context
0067 |       .switchToHttp()
0068 |       .getRequest().user;
0069 |     if (!user || !roles.includes(user.role))
0070 |       throw new ForbiddenException("Insufficient role");
0071 |     return true;
0072 |   }
0073 | }
```

**Giải thích theo luồng.** `getAllAndOverride` tìm metadata ở handler/class; nếu public thì bỏ qua guard access. Header phải khớp Bearer; `authenticateSession` kiểm tra token và gắn request. RolesGuard cho qua nếu không khai báo roles, nếu có thì kiểm user.role; vì vậy quyền tài nguyên vẫn phải kiểm ở service.

**Câu hỏi và cách trả lời.** Route không có @Roles có phải public? Không: nếu không có @Public, guard xác thực vẫn có thể yêu cầu Bearer; tùy đăng ký guard thực tế.

### 21.7 Optimistic concurrency bằng ETag

**Khái niệm.** Optimistic concurrency là cho phép nhiều người đọc rồi phát hiện xung đột lúc ghi bằng phiên bản/điều kiện; ETag là nhãn của phiên bản tài nguyên.

**Tình trạng áp dụng.** Đã có header If-Match và contract 412/428; đây không thay thế khóa bi quan cho bài toán owner cuối cùng.

**Nguồn mã:** [erusentia-server/src/templates/templates.controller.ts:154](../../erusentia-server/src/templates/templates.controller.ts#L154); **tài liệu chuyên biệt:** [erusentia-server/docs/CACHE.md](../../erusentia-server/docs/CACHE.md).

```text
0154 |   @Patch(":id")
0155 |   @ApiOperation({
0156 |     summary: "Update a template",
0157 |     description:
0158 |       "Supply at least one field. authorId is immutable; contentJson replaces the entire envelope.",
0159 |   })
0160 |   @ApiParam({ name: "id", format: "uuid" })
0161 |   @ApiOkResponse({ type: TemplateResponseDto, headers: etagHeader })
0162 |   @ApiHeader(matchHeader)
0163 |   @ApiResponse({
0164 |     status: 412,
0165 |     type: ApiErrorDto,
0166 |     description:
0167 |       "Stale revision; keep the draft and reload. Never automatically retry.",
0168 |   })
0169 |   @ApiResponse({
0170 |     status: 428,
0171 |     type: ApiErrorDto,
0172 |     description: "Missing If-Match",
0173 |   })
0174 |   @ApiNotFoundResponse({ type: ApiErrorDto })
0175 |   @ApiConflictResponse({ type: ApiErrorDto })
0176 |   @ApiPayloadTooLargeResponse({ type: ApiErrorDto })
0177 |   async update(
0178 |     @Param("id", UuidPipe) id: string,
0179 |     @Body() body: UpdateTemplateDto,
0180 |     @CurrentUser() user: UserIdentity,
0181 |     @Headers("if-match") match: string | undefined,
0182 |     @Res({ passthrough: true }) response: ResponseHeaders,
0183 |   ) {
0184 |     const row = await this.service.update(id, body, user, match);
0185 |     response.setHeader("ETag", templateEtag(row));
0186 |     return row;
0187 |   }
0188 |   @Delete(":id")
```

**Giải thích theo luồng.** Đọc mô tả `ApiHeader(matchHeader)`: client gửi ETag đã đọc. Controller chuyển match cùng id, body và current user sang service. 412 là revision cũ; 428 là thiếu precondition theo contract, không nên retry mù rồi ghi đè.

**Câu hỏi và cách trả lời.** Một trình duyệt sửa từ bản cũ thì làm gì? Giữ draft, tải revision mới, để người dùng so sánh và quyết định thay đổi.

### 21.8 Transaction ghi template và outbox

**Khái niệm.** Transactional outbox là ghi ý định phát event cùng transaction với dữ liệu nghiệp vụ để tránh dual write mất event.

**Tình trạng áp dụng.** Đã chèn event khi operation update, template public, không hidden và bảng outbox tồn tại. Nếu thiếu bảng code bỏ qua insert; migration đúng là điều kiện vận hành.

**Nguồn mã:** [erusentia-server/src/templates/persistence/postgres-template.store.ts:303](../../erusentia-server/src/templates/persistence/postgres-template.store.ts#L303); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0303 |           ...columns,
0304 |           ...(contentJson === undefined
0305 |             ? {}
0306 |             : { contentJson: () => ":content" }),
0307 |         })
0308 |         .where("id = :id", { id })
0309 |         .andWhere("revision = :revision", { revision });
0310 |       if (operation !== "restore") query.andWhere("deleted_at IS NULL");
0311 |       if (actor.role !== "admin")
0312 |         query.andWhere("author_id = :actorId", { actorId: actor.id });
0313 |       if (contentJson !== undefined)
0314 |         query.setParameter("content", JSON.stringify(contentJson));
0315 |       const result = await query.execute();
0316 |       if (result.affected !== 1)
0317 |         throw new PreconditionFailedException(
0318 |           "Template changed; keep your draft and reload the current revision",
0319 |         );
0320 |       if (retainedBefore)
0321 |         assertRetainedQuota(
0322 |           this.limits,
0323 |           retainedBefore,
0324 |           await this.retainedUsage(hint.author_id, manager),
0325 |         );
0326 |       const updated = (await this.find(id, true, manager))!;
0327 |       if (
0328 |         operation === "update" &&
0329 |         updated.isPublic &&
0330 |         updated.moderationState !== "hidden"
0331 |       ) {
0332 |         const outboxTable = await manager.query(
0333 |           "SELECT to_regclass('public.message_outbox') AS exists",
0334 |         );
0335 |         if (outboxTable[0]?.exists) {
0336 |           await manager.query(
0337 |             `INSERT INTO message_outbox (id, event_type, payload, created_at)
0338 |              VALUES (gen_random_uuid(), 'template.version_published', $1, CURRENT_TIMESTAMP)`,
0339 |             [
0340 |               JSON.stringify({
0341 |                 templateId: updated.id,
0342 |                 revision: updated.revision,
0343 |                 title: updated.title,
0344 |                 version: updated.version,
0345 |                 isPublic: updated.isPublic,
0346 |                 actorId: actor.id,
0347 |                 authorId: updated.authorId,
0348 |                 slug: updated.slug,
0349 |                 occurredAt: new Date().toISOString(),
0350 |               }),
0351 |             ],
0352 |           );
0353 |         }
0354 |       }
0355 |       return updated;
0356 |     };
0357 |     return existingManager
0358 |       ? execute(existingManager)
0359 |       : this.templates.manager.transaction(execute);
0360 |   }
```

**Giải thích theo luồng.** Khối query update dùng `id`, `revision` và actor; nếu `affected !== 1` ném precondition failed. Sau khi lấy bản updated, điều kiện public và moderation quyết định có ghi event. Khi dùng manager transaction, update và insert cùng commit/rollback; broker chưa nằm trong transaction này.

**Câu hỏi và cách trả lời.** Tại sao có thể có bản update mà không có event? Trong implementation này nếu bảng outbox chưa tồn tại, code kiểm tra và không insert; cần migration/config và kiểm thử triển khai.

### 21.9 Dispatcher và SKIP LOCKED

**Khái niệm.** Dispatcher tìm sự kiện chưa publish và chuyển sang broker. Pessimistic row lock ngăn worker cùng giữ hàng; SKIP LOCKED cho phép bỏ qua hàng đã bị giữ.

**Tình trạng áp dụng.** Đã áp dụng transaction, LIMIT, ORDER BY, FOR UPDATE SKIP LOCKED và đánh dấu published_at. Chưa phải chứng minh exactly-once.

**Nguồn mã:** [erusentia-server/src/messaging/notification-repository.ts:8](../../erusentia-server/src/messaging/notification-repository.ts#L8); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0008 | export class NotificationRepository {
0009 |   constructor(readonly pool: Pool) {}
0010 |
0011 |   async dispatch(
0012 |     publish: (event: TemplatePublishedEvent, eventId: string) => Promise<void>,
0013 |     limit = 10,
0014 |   ): Promise<number> {
0015 |     const client = await this.pool.connect();
0016 |     try {
0017 |       await client.query("BEGIN");
0018 |       const rows = await client.query(
0019 |         "SELECT id, payload FROM message_outbox WHERE published_at IS NULL AND event_type=$1 ORDER BY created_at, id LIMIT $2 FOR UPDATE SKIP LOCKED",
0020 |         [TEMPLATE_VERSION_PUBLISHED, limit],
0021 |       );
0022 |       for (const row of rows.rows) {
0023 |         await publish(row.payload, row.id);
0024 |         await client.query(
0025 |           "UPDATE message_outbox SET published_at=CURRENT_TIMESTAMP WHERE id=$1",
0026 |           [row.id],
0027 |         );
0028 |       }
0029 |       await client.query("COMMIT");
0030 |       return rows.rowCount ?? 0;
0031 |     } catch (error) {
0032 |       await client.query("ROLLBACK");
0033 |       throw error;
0034 |     } finally {
0035 |       client.release();
0036 |     }
0037 |   }
```

**Giải thích theo luồng.** `pool.connect` lấy connection; `BEGIN` mở transaction; SELECT hàng pending; vòng lặp await publish trước khi cập nhật published_at. COMMIT khi xong; catch ROLLBACK; finally release. Nếu broker đã nhận nhưng DB chưa commit, có thể gửi lại.

**Câu hỏi và cách trả lời.** Điểm đánh đổi? Transaction giữ khóa DB trong khi chờ broker; nếu broker chậm có thể giữ connection/lock lâu.

### 21.10 Publisher confirm và mandatory

**Khái niệm.** Publisher confirm là xác nhận broker đối với publish trên confirm channel; mandatory yêu cầu thông báo message không định tuyến được.

**Tình trạng áp dụng.** Đã có timeout confirm, xử lý return/close và publish persistent, mandatory; không chứng minh tính sẵn sàng tuyệt đối của hạ tầng.

**Nguồn mã:** [erusentia-server/src/messaging/rabbit.ts:115](../../erusentia-server/src/messaging/rabbit.ts#L115); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0115 |   publish(
0116 |     exchange: string,
0117 |     routingKey: string,
0118 |     body: Buffer,
0119 |     options: amqp.Options.Publish,
0120 |   ) {
0121 |     const correlationId = randomUUID();
0122 |     return new Promise<void>((resolve, reject) => {
0123 |       let returned = false;
0124 |       const onReturn = (message: amqp.Message) => {
0125 |         if (message.properties.correlationId === correlationId) returned = true;
0126 |       };
0127 |       const onClose = () => finish(new Error("BROKER_CHANNEL_CLOSED"));
0128 |       const timer = setTimeout(
0129 |         () => finish(new Error("PUBLISH_CONFIRM_TIMEOUT")),
0130 |         10000,
0131 |       );
0132 |       const finish = (error?: Error | null) => {
0133 |         clearTimeout(timer);
0134 |         this.publisher.removeListener("return", onReturn);
0135 |         this.publisher.removeListener("close", onClose);
0136 |         if (error) reject(error);
0137 |         else if (returned) reject(new Error("UNROUTABLE_MESSAGE"));
0138 |         else resolve();
0139 |       };
0140 |       this.publisher.on("return", onReturn);
0141 |       this.publisher.once("close", onClose);
0142 |       try {
0143 |         this.publisher.publish(
0144 |           exchange,
0145 |           routingKey,
0146 |           body,
0147 |           {
0148 |             ...options,
0149 |             correlationId,
0150 |             persistent: true,
0151 |             mandatory: true,
0152 |             contentType: "application/json",
0153 |           },
0154 |           (error) => finish(error),
0155 |         );
0156 |       } catch {
0157 |         finish(new Error("PUBLISH_FAILED"));
0158 |       }
0159 |     });
0160 |   }
0161 |   async close() {
```

**Giải thích theo luồng.** Tạo correlationId và listener `return`; `finish` dọn timer/listener, reject nếu timeout, channel đóng hoặc unroutable. `publish` đặt persistent/mandatory và callback confirm. Xem cả cấu hình exchange/queue và vận hành broker để đánh giá durability thực tế.

**Câu hỏi và cách trả lời.** Persistent message có đảm bảo không bao giờ mất? Không thể chỉ kết luận từ một cờ: queue, broker, confirm và lỗi thực tế đều ảnh hưởng.

### 21.11 Consumer, ACK và retry

**Khái niệm.** ACK xác nhận xử lý cho broker; retry thử lại lỗi tạm thời; dead queue nhận thông điệp không xử lý tiếp được.

**Tình trạng áp dụng.** Đã dùng noAck false, parse, deliver, ack sau xử lý; initial và tối đa hai retry theo điều kiện hiện tại.

**Nguồn mã:** [erusentia-server/src/messaging/notification-worker.ts:34](../../erusentia-server/src/messaging/notification-worker.ts#L34); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0034 |   async startConsumer() {
0035 |     const { consumerTag } = await this.rabbit.consumer.consume(
0036 |       this.rabbit.names.notificationWork,
0037 |       (message) => {
0038 |         if (!message) return;
0039 |         const task = this.handle(message).catch(async () => {
0040 |           await this.rabbit.close();
0041 |         });
0042 |         this.inFlight.add(task);
0043 |         void task.finally(() => this.inFlight.delete(task));
0044 |       },
0045 |       { noAck: false },
0046 |     );
0047 |     this.tag = consumerTag;
0048 |   }
0049 |
0050 |   private async handle(message: ConsumeMessage) {
0051 |     let permanent = false;
0052 |     try {
0053 |       let event: TemplatePublishedEvent;
0054 |       try {
0055 |         event = parseTemplatePublishedEvent(message.content);
0056 |       } catch {
0057 |         permanent = true;
0058 |         throw new PermanentNotificationError("INVALID_EVENT");
0059 |       }
0060 |
0061 |       await this.repository.deliver(
0062 |         event,
0063 |         message.properties.messageId || "unknown",
0064 |         this.redis,
0065 |       );
0066 |       this.rabbit.consumer.ack(message);
0067 |       return;
0068 |     } catch (error) {
0069 |       permanent ||= error instanceof PermanentNotificationError;
0070 |       const raw = message.properties.headers?.["x-attempt"];
0071 |       const attempt =
0072 |         typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw <= 3
0073 |           ? raw
0074 |           : 0;
0075 |       const dead = permanent || attempt >= 2;
0076 |
0077 |       await this.rabbit.publish(
0078 |         "",
0079 |         dead
0080 |           ? this.rabbit.names.notificationDead
0081 |           : this.rabbit.names.notificationRetry,
0082 |         message.content,
0083 |         {
0084 |           messageId: message.properties.messageId,
0085 |           correlationId: message.properties.correlationId,
0086 |           type: message.properties.type,
0087 |           headers: {
0088 |             ...message.properties.headers,
0089 |             "x-attempt": attempt + 1,
0090 |             "x-exception-message":
0091 |               error instanceof Error ? error.message : "Unknown error",
0092 |           },
0093 |         },
0094 |       );
0095 |       this.rabbit.consumer.ack(message);
0096 |     }
0097 |   }
```

**Giải thích theo luồng.** `startConsumer` theo dõi promise đang chạy; `handle` parse, gọi deliver rồi ack. Sai format bị coi permanent. Lỗi khác lấy header attempt, chọn retry/dead, publish bản thay thế rồi ack bản cũ. Nếu publish lại thất bại, outer catch đóng kết nối.

**Câu hỏi và cách trả lời.** Crash sau DB commit trước ACK thì sao? Message có thể được giao lại, cần insert idempotent.

### 21.12 Khóa nghiệp vụ và chống thông báo trùng

**Khái niệm.** Idempotency là xử lý lặp mà hiệu ứng được định nghĩa không nhân đôi; khóa nghiệp vụ chọn chính xác phạm vi chống trùng.

**Tình trạng áp dụng.** Đã dùng advisory lock theo template/revision, kiểm tra visibility, ON CONFLICT cho recipient/template/revision, invalidate Redis sau commit.

**Nguồn mã:** [erusentia-server/src/messaging/notification-repository.ts:39](../../erusentia-server/src/messaging/notification-repository.ts#L39); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0039 |   async deliver(
0040 |     event: TemplatePublishedEvent,
0041 |     eventId: string,
0042 |     redis?: ReturnType<typeof createClient>,
0043 |   ): Promise<{ recipients: number; inserted: number }> {
0044 |     const client = await this.pool.connect();
0045 |     try {
0046 |       await client.query("BEGIN");
0047 |
0048 |       // Serialize concurrent deliveries for the exact template revision
0049 |       const lockKey = `${event.templateId}:${event.revision}`;
0050 |       await client.query(
0051 |         "SELECT pg_advisory_xact_lock(hashtextextended($1, 5))",
0052 |         [lockKey],
0053 |       );
0054 |
0055 |       // Verify that the template still exists and is public
0056 |       const templateCheck = await client.query(
0057 |         "SELECT is_public, moderation_state FROM templates WHERE id=$1 AND deleted_at IS NULL",
0058 |         [event.templateId],
0059 |       );
0060 |       if (
0061 |         !templateCheck.rowCount ||
0062 |         !templateCheck.rows[0].is_public ||
0063 |         templateCheck.rows[0].moderation_state === "hidden"
0064 |       ) {
0065 |         await client.query("COMMIT");
0066 |         return { recipients: 0, inserted: 0 };
0067 |       }
0068 |
0069 |       // Query followers of this template
0070 |       const followersResult = await client.query<{ user_id: string }>(
0071 |         "SELECT user_id FROM template_follows WHERE template_id=$1",
0072 |         [event.templateId],
0073 |       );
0074 |       const followers = followersResult.rows.map((r) => r.user_id);
0075 |
0076 |       if (followers.length === 0) {
0077 |         await client.query("COMMIT");
0078 |         return { recipients: 0, inserted: 0 };
0079 |       }
0080 |
0081 |       let totalInserted = 0;
0082 |       const invalidateRecipients = new Set<string>();
0083 |       const title = `Mẫu "${event.title}" vừa phát hành phiên bản mới ${event.version}`;
0084 |       const payloadJson = JSON.stringify({
0085 |         templateId: event.templateId,
0086 |         revision: event.revision,
0087 |         version: event.version,
0088 |         slug: event.slug,
0089 |         occurredAt: event.occurredAt,
0090 |       });
0091 |
0092 |       // Insert notifications in batches of 100 with ON CONFLICT DO NOTHING
0093 |       const batchSize = 100;
0094 |       for (let i = 0; i < followers.length; i += batchSize) {
0095 |         const batch = followers.slice(i, i + batchSize);
0096 |         for (const recipientId of batch) {
0097 |           const res = await client.query(
0098 |             `INSERT INTO notifications (
0099 |               recipient_id, actor_id, type, title, payload,
0100 |               template_id, revision, event_id, is_read, created_at
0101 |             )
0102 |             VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, FALSE, CURRENT_TIMESTAMP)
0103 |             ON CONFLICT (recipient_id, template_id, revision)
0104 |             WHERE template_id IS NOT NULL AND revision IS NOT NULL
0105 |             DO NOTHING
0106 |             RETURNING recipient_id`,
0107 |             [
0108 |               recipientId,
0109 |               event.actorId,
0110 |               "template.version_published",
0111 |               title,
0112 |               payloadJson,
0113 |               event.templateId,
0114 |               event.revision,
0115 |               eventId,
0116 |             ],
0117 |           );
0118 |           if (res.rowCount && res.rowCount > 0) {
0119 |             totalInserted += res.rowCount;
0120 |             invalidateRecipients.add(recipientId);
0121 |           }
0122 |         }
0123 |       }
0124 |
0125 |       await client.query("COMMIT");
0126 |       // Redis is a cache: only invalidate after durable database delivery.
0127 |       if (redis?.isOpen) {
0128 |         await Promise.all([...invalidateRecipients].map(id => redis.del(`eru:unread_count:${id}`).catch(() => {})));
0129 |       }
```

**Giải thích theo luồng.** BEGIN; `pg_advisory_xact_lock` tuần tự cùng khóa; kiểm tra public/not hidden; lấy follower. Vòng batch size 100 nhưng vẫn INSERT riêng từng người. `ON CONFLICT ... DO NOTHING` dựa vào unique index; COMMIT trước xóa cache. Xóa Redis thất bại bị bỏ qua: số chưa đọc có thể tạm cũ.

**Câu hỏi và cách trả lời.** Vì sao cần unique index dù có lock? DB bảo vệ bất biến trước nhiều đường ghi; lock một mình phụ thuộc mọi writer cùng tuân thủ quy ước.

### 21.13 DDL, khóa chính và index

**Khái niệm.** DDL tạo cấu trúc database. Primary key ghép chống quan hệ trùng; partial unique index chỉ ràng buộc các hàng thỏa điều kiện.

**Tình trạng áp dụng.** Đã có PK follow, index lookup, partial unique recipient/template/revision và index feed; không phải toàn bộ schema dự án.

**Nguồn mã:** [erusentia-server/sql/12_template_notifications.sql:1](../../erusentia-server/sql/12_template_notifications.sql#L1); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0001 | -- Week 6: Template follows and asynchronous in-app notifications
0002 | CREATE TABLE IF NOT EXISTS template_follows (
0003 |   user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
0004 |   template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
0005 |   created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
0006 |   PRIMARY KEY (user_id, template_id)
0007 | );
0008 |
0009 | CREATE INDEX IF NOT EXISTS idx_template_follows_template ON template_follows(template_id, created_at);
0010 | CREATE INDEX IF NOT EXISTS idx_template_follows_user ON template_follows(user_id, created_at DESC);
0011 |
0012 | -- Extend existing notifications table from 01_schema.sql
0013 | ALTER TABLE notifications
0014 |   ADD COLUMN IF NOT EXISTS template_id uuid NULL REFERENCES templates(id) ON DELETE CASCADE,
0015 |   ADD COLUMN IF NOT EXISTS revision integer NULL CHECK (revision > 0),
0016 |   ADD COLUMN IF NOT EXISTS event_id uuid NULL REFERENCES message_outbox(id) ON DELETE CASCADE,
0017 |   ADD COLUMN IF NOT EXISTS read_at timestamptz NULL;
0018 |
0019 | -- Unique constraint for template revision idempotency per recipient
0020 | CREATE UNIQUE INDEX IF NOT EXISTS uq_notifications_recipient_template_revision
0021 |   ON notifications (recipient_id, template_id, revision)
0022 |   WHERE template_id IS NOT NULL AND revision IS NOT NULL;
0023 |
0024 | -- Composite index for high-performance cursor pagination
0025 | CREATE INDEX IF NOT EXISTS idx_notifications_feed
```

**Giải thích theo luồng.** Theo từng khối: PK `(user_id, template_id)`; index theo template phục vụ tìm follower; ALTER TABLE bổ sung template_id/revision/event_id/read_at; unique index có WHERE loại hàng NULL; index feed theo recipient và thứ tự created_at/id giảm dần.

**Câu hỏi và cách trả lời.** Index này có chắc được query planner dùng? Cần EXPLAIN trên dữ liệu và thống kê thực tế, không khẳng định chỉ từ định nghĩa.

### 21.14 Cursor pagination trong notification feed

**Khái niệm.** Cursor pagination lấy tiếp từ mốc của trang trước, ở đây mốc ghép created_at và id theo thứ tự giảm dần.

**Tình trạng áp dụng.** Đã lọc recipient, dùng limit + 1 để biết còn trang và tie-breaker id; base64 cursor không phải mã hóa bí mật.

**Nguồn mã:** [erusentia-server/src/notifications/notifications.service.ts:95](../../erusentia-server/src/notifications/notifications.service.ts#L95); **tài liệu chuyên biệt:** [erusentia-server/docs/MESSAGE_QUEUE.md](../../erusentia-server/docs/MESSAGE_QUEUE.md).

```text
0095 |   async getFeed(
0096 |     user: UserIdentity,
0097 |     query: NotificationFeedQueryDto,
0098 |   ): Promise<NotificationFeedDto> {
0099 |     if (!this.db) {
0100 |       return { items: [], nextCursor: null, unreadCount: 0 };
0101 |     }
0102 |
0103 |     const limit = query.limit ?? 20;
0104 |     const fetchLimit = limit + 1;
0105 |
0106 |     let rows: NotificationRow[] = [];
0107 |
0108 |     if (query.cursor) {
0109 |       const { createdAt, id } = decodeCursor(query.cursor);
0110 |       rows = await this.db.query<NotificationRow[]>(
0111 |         `SELECT id, recipient_id, actor_id, type, title, payload, template_id, revision, is_read, created_at, read_at
0112 |          FROM notifications
0113 |          WHERE recipient_id = $1
0114 |            AND (created_at < $2 OR (created_at = $2 AND id < $3))
0115 |          ORDER BY created_at DESC, id DESC
0116 |          LIMIT $4`,
0117 |         [user.id, createdAt, id, fetchLimit],
0118 |       );
0119 |     } else {
0120 |       rows = await this.db.query<NotificationRow[]>(
0121 |         `SELECT id, recipient_id, actor_id, type, title, payload, template_id, revision, is_read, created_at, read_at
0122 |          FROM notifications
0123 |          WHERE recipient_id = $1
0124 |          ORDER BY created_at DESC, id DESC
0125 |          LIMIT $2`,
0126 |         [user.id, fetchLimit],
0127 |       );
0128 |     }
0129 |
0130 |     let nextCursor: string | null = null;
0131 |     if (rows.length > limit) {
0132 |       const hasMoreRows = rows.slice(0, limit);
0133 |       const lastItem = hasMoreRows[hasMoreRows.length - 1];
0134 |       nextCursor = encodeCursor(lastItem.created_at, lastItem.id);
0135 |       rows = hasMoreRows;
0136 |     }
0137 |
0138 |     const items: NotificationItemDto[] = rows.map((r) => ({
0139 |       id: r.id,
0140 |       recipientId: r.recipient_id,
0141 |       actorId: r.actor_id,
0142 |       type: r.type,
0143 |       title: r.title,
0144 |       payload: r.payload,
0145 |       templateId: r.template_id,
0146 |       revision: r.revision,
0147 |       isRead: r.is_read,
0148 |       createdAt: r.created_at.toISOString(),
0149 |       readAt: r.read_at ? r.read_at.toISOString() : null,
0150 |     }));
```

**Giải thích theo luồng.** Nếu có cursor, điều kiện `created_at < $2 OR (created_at = $2 AND id < $3)` khớp ORDER BY DESC. `limit + 1` giúp biết còn dữ liệu; giữ limit hàng, lấy hàng cuối encode cursor. Không có DB trả danh sách rỗng trong nhánh hiện tại.

**Câu hỏi và cách trả lời.** Dữ liệu mới thêm đầu feed có tự xuất hiện ở trang sau không? Không nhất thiết: cursor đi tiếp từ mốc cũ, không phải snapshot toàn cục.

### 21.15 Cache template và quyền đọc

**Khái niệm.** Cache-aside là ứng dụng kiểm tra cache, miss thì đọc nguồn chính và có thể ghi cache. TTL là thời gian sống.

**Tình trạng áp dụng.** Đã check stamp/visibility ở DB trước khi dùng cache public, bypass private và fallback khi Redis unavailable. Không khẳng định mọi cache dự án có chính sách giống nhau.

**Nguồn mã:** [erusentia-server/src/cache/template-cache.ts:65](../../erusentia-server/src/cache/template-cache.ts#L65); **tài liệu chuyên biệt:** [erusentia-server/docs/CACHE.md](../../erusentia-server/docs/CACHE.md).

```text
0065 |   key(id: string, revision: string) {
0066 |     return `${this.settings.namespace}:template:v1:${id}:${revision}`;
0067 |   }
0068 |   async stamp(id: string): Promise<CacheStamp | null> {
0069 |     if (!this.settings.enabled) return null;
0070 |     const rows = await this.database!.query(
0071 |       'SELECT cache_revision AS revision, author_id AS "authorId", is_public AS "isPublic" FROM templates WHERE id=$1 AND deleted_at IS NULL',
0072 |       [id],
0073 |     );
0074 |     return rows[0] ?? null;
0075 |   }
0076 |   async invalidate(id: string, stamp: CacheStamp | null) {
0077 |     if (!stamp || !this.client.isReady) return;
0078 |     try {
0079 |       await this.client
0080 |         .withAbortSignal(AbortSignal.timeout(200))
0081 |         .del(this.key(id, stamp.revision));
0082 |     } catch {}
0083 |   }
0084 |   private visible(row: TemplateRecord | null, viewer: UserIdentity) {
0085 |     if (!row || !canRead(row, viewer))
0086 |       throw new NotFoundException("Template not found");
0087 |     return row;
0088 |   }
0089 |   async read(
0090 |     id: string,
0091 |     viewer: UserIdentity,
0092 |     load: () => Promise<TemplateRecord | null>,
0093 |   ): Promise<{ row: TemplateRecord; status: CacheStatus }> {
0094 |     if (!this.settings.enabled)
0095 |       return {
0096 |         row: this.visible(await load(), viewer),
0097 |         status: "BYPASS_DISABLED",
0098 |       };
0099 |     // Always consult current DB visibility/revision before using a public cache entry.
0100 |     const stamp = await this.stamp(id);
0101 |     if (!stamp || !canRead(stamp, viewer))
0102 |       throw new NotFoundException("Template not found");
0103 |     if (!stamp.isPublic)
0104 |       return {
0105 |         row: this.visible(await load(), viewer),
0106 |         status: "BYPASS_PRIVATE",
0107 |       };
0108 |     if (!this.client.isReady)
0109 |       return {
0110 |         row: this.visible(await load(), viewer),
0111 |         status: "BYPASS_REDIS",
0112 |       };
0113 |     const key = this.key(id, stamp.revision);
0114 |     try {
0115 |       const raw = await this.client
0116 |         .withAbortSignal(AbortSignal.timeout(200))
0117 |         .get(key);
0118 |       if (raw) {
0119 |         try {
0120 |           return { row: decodeRecord(raw, id, stamp), status: "HIT" };
0121 |         } catch {
0122 |           await this.client.withAbortSignal(AbortSignal.timeout(200)).del(key);
0123 |         }
0124 |       }
0125 |     } catch {
0126 |       return {
0127 |         row: this.visible(await load(), viewer),
0128 |         status: "BYPASS_REDIS",
0129 |       };
0130 |     }
0131 |     const existing = this.pending.get(key);
0132 |     if (existing)
0133 |       return { row: this.visible(await existing, viewer), status: "COALESCED" };
0134 |     const task = (async () => {
0135 |       const row = await load();
0136 |       // A write may have happened between the stamp and the full fetch. Recheck before filling.
0137 |       const after = await this.stamp(id);
```

**Giải thích theo luồng.** `key` gồm namespace/id/revision. `stamp` đọc trạng thái ở DB; `canRead` kiểm tra public/chủ/admin. Chỉ sau đó Redis GET; decode lỗi thì xóa cache. Map `pending` gom request đồng thời trong một process; không phải distributed lock.

**Câu hỏi và cách trả lời.** Sao cache mà vẫn query DB? Đổi chi phí một truy vấn stamp để tăng an toàn visibility/revision; đo workload để đánh giá lợi ích.

### 21.16 TTL jitter và kết nối Redis

**Khái niệm.** Jitter là nhiễu có kiểm soát để nhiều key không đồng loạt hết hạn; cache stampede là nhiều yêu cầu cùng load lại khi miss.

**Tình trạng áp dụng.** Đã thêm jitter vào TTL và giới hạn chờ/kết nối cache; pending map là phạm vi process.

**Nguồn mã:** [erusentia-server/src/cache/template-cache.ts:29](../../erusentia-server/src/cache/template-cache.ts#L29); **tài liệu chuyên biệt:** [erusentia-server/docs/CACHE.md](../../erusentia-server/docs/CACHE.md).

```text
0029 | export function canRead(
0030 |   row: { authorId: string; isPublic: boolean },
0031 |   viewer: UserIdentity,
0032 | ) {
0033 |   return row.isPublic || row.authorId === viewer.id || viewer.role === "admin";
0034 | }
0035 | export function cacheTtl(base: number, random = Math.random()) {
0036 |   return base + Math.floor(base * 0.2 * random);
0037 | }
0038 |
0039 | @Injectable()
0040 | export class TemplateCache implements OnModuleInit, OnModuleDestroy {
0041 |   readonly client: ReturnType<typeof createClient>;
0042 |   private readonly pending = new Map<string, Promise<TemplateRecord | null>>();
0043 |   constructor(
0044 |     @Inject(CACHE_SETTINGS) readonly settings: AppConfig["cache"],
0045 |     @Optional() private readonly database?: DataSource,
0046 |   ) {
0047 |     this.client = createClient({
0048 |       url: settings.url,
0049 |       disableOfflineQueue: true,
0050 |       commandsQueueMaxLength: 100,
0051 |       socket: {
0052 |         connectTimeout: 250,
0053 |         reconnectStrategy: (retries) => Math.min(100 + retries * 100, 1000),
0054 |       },
0055 |     });
0056 |     this.client.on("error", () => {}); // Fail open without logging a Redis URL/credential.
0057 |   }
0058 |   async onModuleInit() {
0059 |     if (this.settings.enabled)
0060 |       await Promise.race([this.client.connect().catch(() => {}), delay(300)]);
0061 |   }
0062 |   onModuleDestroy() {
0063 |     if (this.client.isOpen) this.client.destroy();
0064 |   }
```

**Giải thích theo luồng.** `canRead` chỉ cho public, chủ hoặc admin. `cacheTtl` cộng từ 0 đến dưới 20% base với random chuẩn. `disableOfflineQueue` và connect timeout hạn chế tích lũy yêu cầu; catch bỏ qua lỗi để có thể fallback, không phải bỏ qua authorization.

**Câu hỏi và cách trả lời.** Tại sao không dùng cùng một TTL chính xác cho mọi key? Hết hạn đồng loạt có thể tạo đỉnh tải nguồn dữ liệu.

### 21.17 Role workspace và cache 600 giây

**Khái niệm.** RBAC gán quyền theo role; role cache lưu kết quả quyết định quyền để giảm query nhưng có nguy cơ stale.

**Tình trạng áp dụng.** Đã có owner/editor/viewer, cache Redis EX 600 và invalidate; lỗi invalidate bị bỏ qua nên không đảm bảo thu hồi tức thì trong mọi lỗi.

**Nguồn mã:** [erusentia-server/src/workspaces/workspaces.service.ts:82](../../erusentia-server/src/workspaces/workspaces.service.ts#L82); **tài liệu chuyên biệt:** [erusentia-server/docs/WORKSPACE_DEVELOPMENT.md](../../erusentia-server/docs/WORKSPACE_DEVELOPMENT.md).

```text
0082 |   private permCacheKey(workspaceId: string, userId: string): string {
0083 |     return `eru:ws_perm:${workspaceId}:${userId}`;
0084 |   }
0085 |
0086 |   private async getCachedRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
0087 |     if (this.redis?.isOpen) {
0088 |       const cached = await this.redis.get(this.permCacheKey(workspaceId, userId)).catch(() => null);
0089 |       if (cached === "owner" || cached === "editor" || cached === "viewer") {
0090 |         return cached;
0091 |       }
0092 |     }
0093 |     return null;
0094 |   }
0095 |
0096 |   private async setCachedRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<void> {
0097 |     if (this.redis?.isOpen) {
0098 |       await this.redis.set(this.permCacheKey(workspaceId, userId), role, { EX: 600 }).catch(() => {});
0099 |     }
0100 |   }
0101 |
0102 |   private async invalidateCachedRole(workspaceId: string, userId: string): Promise<void> {
0103 |     if (this.redis?.isOpen) {
0104 |       await this.redis.del(this.permCacheKey(workspaceId, userId)).catch(() => {});
0105 |     }
0106 |   }
0107 |
0108 |   async resolveRole(workspaceId: string, user: UserIdentity): Promise<WorkspaceRole> {
0109 |     if (!this.db) throw new NotFoundException("Workspace not found");
0110 |
0111 |     const cached = await this.getCachedRole(workspaceId, user.id);
0112 |     if (cached) return cached;
0113 |
0114 |     const res = await this.db.query<MemberRow[]>(
0115 |       "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
0116 |       [workspaceId, user.id],
0117 |     );
0118 |     if (!res.length) {
0119 |       throw new ForbiddenException("You are not a member of this workspace");
0120 |     }
0121 |
0122 |     const role = res[0].role;
0123 |     await this.setCachedRole(workspaceId, user.id, role);
0124 |     return role;
0125 |   }
0126 |
0127 |   async requireRole(workspaceId: string, user: UserIdentity, allowed: WorkspaceRole[]): Promise<WorkspaceRole> {
0128 |     const role = await this.resolveRole(workspaceId, user);
0129 |     if (!allowed.includes(role)) {
0130 |       throw new ForbiddenException(
0131 |         `Action requires one of roles [${allowed.join(", ")}], but you have role [${role}]`,
0132 |       );
0133 |     }
```

**Giải thích theo luồng.** `getCachedRole` chỉ chấp nhận ba giá trị hợp lệ. `setCachedRole` đặt TTL 600 giây. `resolveRole` trả cache hit trước DB; khi miss query membership, không có thì Forbidden. `requireRole` so danh sách được phép.

**Câu hỏi và cách trả lời.** Tại sao stale role là rủi ro bảo mật? Một user vừa mất quyền vẫn có thể được coi có role cũ nếu cache chưa được xóa thành công.

### 21.18 Khóa owner cuối cùng

**Khái niệm.** Race condition xảy ra khi kết quả phụ thuộc vào thứ tự xen kẽ; lock hàng được giữ trong transaction bảo vệ bất biến.

**Tình trạng áp dụng.** Đã khóa các hàng owner và target, từ chối hạ owner cuối. Chưa kết luận đã chứng minh mọi lịch chạy hoặc không deadlock.

**Nguồn mã:** [erusentia-server/src/workspaces/workspaces.service.ts:305](../../erusentia-server/src/workspaces/workspaces.service.ts#L305); **tài liệu chuyên biệt:** [erusentia-server/docs/WORKSPACE_DEVELOPMENT.md](../../erusentia-server/docs/WORKSPACE_DEVELOPMENT.md).

```text
0305 |   async updateMemberRole(
0306 |     workspaceId: string,
0307 |     targetUserId: string,
0308 |     input: UpdateMemberRoleDto,
0309 |     actor: UserIdentity,
0310 |   ): Promise<void> {
0311 |     await this.requireRole(workspaceId, actor, ["owner"]);
0312 |     if (!this.db) return;
0313 |
0314 |     await this.db.transaction(async (manager) => {
0315 |       // PESSIMISTIC LOCK: Lock all owner rows to serialize concurrent requests
0316 |       const owners = await manager.query<{ user_id: string }[]>(
0317 |         "SELECT user_id FROM workspace_members WHERE workspace_id = $1 AND role = 'owner' FOR UPDATE",
0318 |         [workspaceId],
0319 |       );
0320 |
0321 |       const target = await manager.query<MemberRow[]>(
0322 |         "SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 FOR UPDATE",
0323 |         [workspaceId, targetUserId],
0324 |       );
0325 |       if (!target.length) throw new NotFoundException("Member not found in this workspace");
0326 |
0327 |       const currentRole = target[0].role;
0328 |
0329 |       // CONCURRENCY CHOKING POINT: Prevent demoting the last owner
0330 |       if (currentRole === "owner" && input.role !== "owner") {
0331 |         if (owners.length <= 1) {
0332 |           throw new ConflictException(
0333 |             "Cannot demote the last remaining owner of the workspace. Promote another member to owner first.",
0334 |           );
0335 |         }
0336 |       }
0337 |
0338 |       await manager.query(
0339 |         "UPDATE workspace_members SET role = $3, updated_at = CURRENT_TIMESTAMP WHERE workspace_id = $1 AND user_id = $2",
0340 |         [workspaceId, targetUserId, input.role],
0341 |       );
0342 |
0343 |       await manager.query(
0344 |         `INSERT INTO workspace_audit_logs (workspace_id, actor_id, target_id, action, details)
0345 |          VALUES ($1, $2, $3, 'role.changed', $4::jsonb)`,
0346 |         [workspaceId, actor.id, targetUserId, JSON.stringify({ oldRole: currentRole, newRole: input.role })],
0347 |       );
0348 |
0349 |       await this.invalidateCachedRole(workspaceId, targetUserId);
0350 |     });
0351 |   }
```

**Giải thích theo luồng.** `requireRole` trước transaction; SELECT owner FOR UPDATE; SELECT target FOR UPDATE; nếu target là owner, role mới không owner và owner count <=1 thì Conflict. Sau đó UPDATE và ghi audit. Lưu ý invalidate cache nằm trong callback transaction; cache/thời điểm commit và request cạnh tranh cần kiểm tra thêm.

**Câu hỏi và cách trả lời.** Điều gì nếu hai người đồng thời đổi quyền? Cần kiểm thử hai connection, thứ tự lock, rollback và cả stale cache; không chỉ dựa vào test tuần tự.

### 21.19 Lời mời workspace

**Khái niệm.** Invitation là luồng trạng thái: được tạo, còn hạn, đúng người, chưa dùng và được chấp nhận.

**Tình trạng áp dụng.** Đã có email, role, token, expiration, lock lời mời; không khẳng định tất cả chính sách chia sẻ tài nguyên được hoàn thiện.

**Nguồn mã:** [erusentia-server/src/workspaces/workspaces.service.ts:405](../../erusentia-server/src/workspaces/workspaces.service.ts#L405); **tài liệu chuyên biệt:** [erusentia-server/docs/WORKSPACE_DEVELOPMENT.md](../../erusentia-server/docs/WORKSPACE_DEVELOPMENT.md).

```text
0405 |   async createInvite(workspaceId: string, input: InviteMemberDto, actor: UserIdentity) {
0406 |     await this.requireRole(workspaceId, actor, ["owner"]);
0407 |     if (!this.db) throw new BadRequestException("Database not available");
0408 |
0409 |     const token = randomBytes(24).toString("hex");
0410 |     const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
0411 |
0412 |     await this.db.query(
0413 |       `INSERT INTO workspace_invites (workspace_id, invited_by, email, role, token, expires_at)
0414 |        VALUES ($1, $2, $3, $4, $5, $6)`,
0415 |       [workspaceId, actor.id, input.email, input.role, token, expiresAt],
0416 |     );
0417 |
0418 |     return { token, email: input.email, role: input.role, expiresAt: expiresAt.toISOString() };
0419 |   }
0420 |
0421 |   async acceptInvite(token: string, user: UserIdentity) {
0422 |     if (!this.db) throw new BadRequestException("Database not available");
0423 |
0424 |     return this.db.transaction(async (manager) => {
0425 |       const invites = await manager.query<
0426 |         { id: string; workspace_id: string; email: string; role: WorkspaceRole; expires_at: Date; accepted_at: Date | null }[]
0427 |       >(
0428 |         "SELECT i.id, i.workspace_id, i.email, i.role, i.expires_at, i.accepted_at FROM workspace_invites i INNER JOIN workspaces w ON w.id = i.workspace_id WHERE i.token = $1 AND w.deleted_at IS NULL FOR UPDATE OF i",
0429 |         [token],
0430 |       );
0431 |       if (!invites.length) throw new NotFoundException("Invalid or nonexistent invitation token");
0432 |
0433 |       const invite = invites[0];
0434 |       if (invite.accepted_at) throw new ConflictException("Invitation has already been used");
0435 |       if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
0436 |         throw new ForbiddenException("Invitation belongs to another email address");
0437 |       }
0438 |       if (new Date() > invite.expires_at) throw new BadRequestException("Invitation token has expired");
0439 |
0440 |       // An invitation must never downgrade an existing member, especially the last owner.
0441 |       await manager.query(
0442 |         `INSERT INTO workspace_members (workspace_id, user_id, role)
0443 |          VALUES ($1, $2, $3)
0444 |          ON CONFLICT (workspace_id, user_id) DO NOTHING`,
0445 |         [invite.workspace_id, user.id, invite.role],
0446 |       );
0447 |
0448 |       await manager.query(
0449 |         "UPDATE workspace_invites SET accepted_at = CURRENT_TIMESTAMP, accepted_by = $2 WHERE id = $1",
0450 |         [invite.id, user.id],
0451 |       );
0452 |
0453 |       await this.invalidateCachedRole(invite.workspace_id, user.id);
0454 |       return { success: true, workspaceId: invite.workspace_id, role: invite.role };
0455 |     });
0456 |   }
0457 |
0458 |   // -------------------------------------------------------------
0459 |   // RESOURCE SHARING
```

**Giải thích theo luồng.** `createInvite` yêu cầu owner và ghi invitation; `acceptInvite` transaction + `FOR UPDATE OF i`; kiểm tra tồn tại, đã dùng, email và hạn trước khi cập nhật membership/trạng thái. Đọc hết hàm để nắm cách xử lý người đã là thành viên.

**Câu hỏi và cách trả lời.** Tại sao cần lock invitation? Hai request chấp nhận cùng token có thể cạnh tranh; lock giúp serialize kiểm tra và cập nhật cùng hàng.

### 21.20 Electron và ranh giới tiến trình

**Khái niệm.** Electron main process tạo cửa sổ và quản lý khả năng desktop; renderer hiển thị giao diện; preload làm cầu nối chọn lọc.

**Tình trạng áp dụng.** Trong cửa sổ chính, nodeIntegration false, contextIsolation true nhưng sandbox false theo comment source; không nói sandbox đã bật.

**Nguồn mã:** [erusentia-app/electron/main.js:130](../../erusentia-app/electron/main.js#L130); **tài liệu chuyên biệt:** [erusentia-app/docs/KEYCLOAK_ACCESS_PLAN.md](../../erusentia-app/docs/KEYCLOAK_ACCESS_PLAN.md).

```text
0130 |     path.join(process.resourcesPath, 'build/icon.png'),
0131 |   ];
0132 |   for (const iconPath of possibleIcons) {
0133 |     if (fsSync.existsSync(iconPath)) return iconPath;
0134 |   }
0135 |   return undefined;
0136 | }
0137 |
0138 | function createWindow(options = {}) {
0139 |   const win = new BrowserWindow({
0140 |     width: options.width || 1200,
0141 |     height: options.height || 800,
0142 |     x: options.x,
0143 |     y: options.y,
0144 |     backgroundColor: '#1e1e1e',
0145 |     icon: resolveAppIcon(),
0146 |     webPreferences: {
0147 |       nodeIntegration: false,
0148 |       contextIsolation: true,
0149 |       sandbox: false, // Allow preload script to require Node.js modules like 'path'
0150 |       preload: path.join(__dirname, 'preload.cjs'),
0151 |     },
0152 |     titleBarStyle: 'hidden', // Hides the title bar but keeps macOS traffic lights
0153 |   });
0154 |
0155 |   const hubContents = win.webContents;
0156 |   hubWindows.add(hubContents);
0157 |   win.on('closed', () => hubWindows.delete(hubContents));
0158 |
0159 |   if (isDev) {
0160 |     const targetUrl = new URL(devServerUrl.href);
```

**Giải thích theo luồng.** `webPreferences` thể hiện các cờ cụ thể. `nodeIntegration: false` không cho renderer dùng Node trực tiếp theo cấu hình; contextIsolation tách context preload; `sandbox: false` là giới hạn bảo vệ bổ sung, không thể quảng cáo renderer hoàn toàn sandboxed. Kiểm tra preload/IPC thực tế để đánh giá quyền.

**Câu hỏi và cách trả lời.** contextIsolation có nghĩa an toàn tuyệt đối? Không: API preload quá rộng, nội dung không tin cậy hoặc IPC thiếu kiểm tra vẫn có thể gây nguy cơ.

### 21.21 Standalone canvas và lỗi HiDPI

**Khái niệm.** DPR là tỷ số device pixel/CSS pixel. Bitmap canvas và kích thước CSS là hai đại lượng khác nhau.

**Tình trạng áp dụng.** Đã sửa ở app commit 44fec1ec: đo canvas theo bounding rectangle, cho whiteboard vector author mode trong iframe và thông báo thay đổi. Bộ cài đã nộp chưa tự chứa commit sau.

**Nguồn mã:** [erusentia-app/src/components/NoteEditor/utils/htmlWrapper.ts:2094](../../erusentia-app/src/components/NoteEditor/utils/htmlWrapper.ts#L2094); **tài liệu chuyên biệt:** [erusentia-app/docs/STANDALONE_PAPER_PARITY.md](../../erusentia-app/docs/STANDALONE_PAPER_PARITY.md).

```text
2094 |       var frameId = 'eru_frame_' + idx + '_' + Math.random().toString(36).substring(2, 7);
2095 |
2096 |       var srcDoc = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + documentFonts + '</style><style>' +
2097 |         (${templateShellCss.toString()})(tokens, { fontFamily: ${JSON.stringify(TEMPLATE_SHELL_FONT_FAMILY)}, lineHeight: '${TEMPLATE_SHELL_LINE_HEIGHT}' }) +
2098 |         'html, body { overflow: hidden; }' +
2099 |         '#eru-root { display: flow-root; margin: 0; padding: 0; }' +
2100 |         ${JSON.stringify(templateControlBaselineCss)} +
2101 |         '</style></head><body><div id="eru-root">' + rawHtml + '</div>' + '<' + 'script data-eru-frame-bridge="true">' +
2102 |         // A vector whiteboard is an interactive surface in standalone web
2103 |         // view. Other embedded tools keep their existing view-mode policy.
2104 |         '(' + installTemplateInteractionMode.toString() + ')(document,document.querySelector("#eru-root > .eru-whiteboard-widget[data-eru-state]") ? "author" : "view");' +
2105 |         'var lastSentH = 0;' +
2106 |         'function syncH() {' +
2107 |         '  var root = document.getElementById("eru-root");' +
2108 |         '  if (!root) return;' +
2109 |         '  var maxChild = 0;' +
2110 |         '  var ch = root.children;' +
2111 |         '  for (var i = 0; i < ch.length; i++) {' +
2112 |         '    var el = ch[i];' +
2113 |         '    var r = el.getBoundingClientRect();' +
2114 |         '    var cs = window.getComputedStyle(el);' +
2115 |         '    var mb = parseFloat(cs.marginBottom) || 0;' +
2116 |         '    var mt = parseFloat(cs.marginTop) || 0;' +
2117 |         '    var total = r.height + mt + mb;' +
2118 |         '    if (total > maxChild) maxChild = total;' +
2119 |         '    var sh = (el.scrollHeight || 0) + mt + mb;' +
2120 |         '    if (sh > maxChild) maxChild = sh;' +
2121 |         '  }' +
2122 |         '  var canvas = root.querySelector("canvas");' +
2123 |         // Canvas bitmap dimensions are device pixels, not CSS pixels. Feeding
2124 |         // them back into the iframe height grows HiDPI canvases indefinitely.
2125 |         '  var canvasH = canvas ? canvas.getBoundingClientRect().height : 0;' +
2126 |         '  var h = Math.max(root.scrollHeight, root.offsetHeight, root.getBoundingClientRect().height, maxChild, canvasH);' +
2127 |         '  if (h > 10 && Math.abs(h - lastSentH) > 3) {' +
2128 |         '    lastSentH = h;' +
2129 |         '    window.parent.postMessage({ type: "eru:iframe-height", frameId: "' + frameId + '", height: Math.ceil(h) }, "*");' +
2130 |         '  }' +
2131 |         '}' +
2132 |         'window.addEventListener("load", syncH);' +
2133 |         'setTimeout(syncH, 50);' +
2134 |         'setTimeout(syncH, 300);' +
2135 |         'document.addEventListener("pointermove", function(e) { parent.postMessage({type:"eru:presentation-pointer",x:e.clientX,y:e.clientY},"*"); },true);' +
2136 |         // Commit handlers persist the vector state asynchronously. Notify the
2137 |         // publication host afterwards so paper/PDF captures the latest marks.
2138 |         'function notifyWhiteboard(e) { if (e.target.closest && e.target.closest(".eru-whiteboard-widget[data-eru-state]")) setTimeout(function() { parent.postMessage({type:"eru:whiteboard-changed"},"*"); }, 0); }' +
2139 |         'document.addEventListener("pointerup", notifyWhiteboard);' +
2140 |         'document.addEventListener("click", notifyWhiteboard);' +
2141 |         'document.addEventListener("keyup", notifyWhiteboard);' +
2142 |         'document.addEventListener("keydown", function(e) { if (!e.target.closest("input,textarea,select,[contenteditable=true]") && ["Escape","ArrowRight","ArrowLeft","PageDown","PageUp"," "].includes(e.key)) parent.postMessage({type:"eru:presentation-key",key:e.key},"*"); });' +
2143 |         'if (window.ResizeObserver) {' +
2144 |         '  var ro = new ResizeObserver(syncH);' +
2145 |         '  var rEl = document.getElementById("eru-root");' +
2146 |         '  if (rEl) ro.observe(rEl);' +
2147 |         '}' +
2148 |         'if (document.fonts && document.fonts.ready) {' +
```

**Giải thích theo luồng.** `srcDoc` dựng iframe; chỉ whiteboard vector trực tiếp được chọn author, còn lại view. `syncH` dùng getBoundingClientRect().height thay bitmap height, tránh phản hồi DPR. `notifyWhiteboard` gửi message sau các tương tác để publication cập nhật. Nét vẽ trong phiên không tự ghi file HTML.

**Câu hỏi và cách trả lời.** Vì sao height bitmap 1280 không được gán thành 1280 CSS px ở DPR 2? Vì đó là 640 CSS px; lẫn đơn vị có thể tạo vòng phình vô hạn.

### 21.22 Chụp và chuẩn bị publication

**Khái niệm.** Snapshot là bản chụp trạng thái để xuất/in; revision guard ngăn kết quả bất đồng bộ cũ ghi đè kết quả mới.

**Tình trạng áp dụng.** Đã có queue, revision, chờ fonts/frames, capture public content và cập nhật bản in; không suy ra mọi hành động trên mọi template đều được thông báo đầy đủ.

**Nguồn mã:** [erusentia-app/src/components/NoteEditor/utils/standalonePublication.ts:239](../../erusentia-app/src/components/NoteEditor/utils/standalonePublication.ts#L239); **tài liệu chuyên biệt:** [erusentia-app/docs/STANDALONE_PAPER_PARITY.md](../../erusentia-app/docs/STANDALONE_PAPER_PARITY.md).

```text
0239 |       check()
0240 |       try { await Promise.race([doc.fonts.ready, replaced]) }
0241 |       finally { observer.disconnect(); child.removeEventListener('load', loaded) }
0242 |       try { if (!child.isConnected || child.contentDocument === doc) return } catch { return }
0243 |     }
0244 |   }
0245 |   let queued = false
0246 |   const queue = () => {
0247 |     if (printing || printMedia.matches) return
0248 |     contentDirty = true
0249 |     revision++
0250 |     if (document.documentElement.dataset.eruReaderLayout === 'preparing') return
0251 |     if (queued) return
0252 |     queued = true
0253 |     // A trusted DOM event can checkpoint microtasks between its listeners.
0254 |     // Capture in the next task, after target handlers have changed public state.
0255 |     setTimeout(async () => {
0256 |       queued = false
0257 |       const request = revision
0258 |       if (printing || printMedia.matches || !ready) { queued = false; return }
0259 |       await document.fonts.ready
0260 |       await Promise.all([...document.querySelectorAll<HTMLIFrameElement>('.embedded-template iframe')].map(waitForLiveFrameFonts))
0261 |       if (request !== revision || printing || printMedia.matches || document.documentElement.dataset.eruReaderLayout === 'preparing') return
0262 |       // While presenting, the document is regrouped into slides: a capture now would record that order and, marked clean, be
0263 |       // reused after the presentation ends (an answer given in a slide then broke print with PUB_CONTENT_ORDER). Leave the
0264 |       // content dirty; the reader asks for a plan again when the presentation restores the document.
0265 |       if (document.documentElement.hasAttribute('data-eru-presenting')) return
0266 |       currentContent = publicContent()
0267 |       contentDirty = false
0268 |       await update(request)
0269 |     }, 0)
0270 |   }
0271 |   const onContentInput = (event: Event) => {
0272 |     if (event.target instanceof Element && event.target.closest('.eru-reader-ui')) return
0273 |     queue()
0274 |   }
0275 |   document.addEventListener('input', onContentInput, true)
0276 |   document.addEventListener('change', onContentInput, true)
0277 |   ;(window as Window & { eruRequestPublicationPlan?: () => Promise<PublicationPlan | null> }).eruRequestPublicationPlan = async () => {
0278 |     await frameReady
0279 |     if (printing || printMedia.matches) return null
0280 |     await document.fonts.ready
0281 |     await Promise.all([...document.querySelectorAll<HTMLIFrameElement>('.embedded-template iframe')].map(waitForLiveFrameFonts))
0282 |     const request = ++revision
0283 |     if (document.documentElement.hasAttribute('data-eru-presenting')) return null
0284 |     if (contentDirty || !currentContent) {
0285 |       currentContent = publicContent()
0286 |       contentDirty = false
0287 |     }
0288 |     await update(request)
0289 |     if (request === revision && host.getAttribute('data-eru-publication-ready') === 'error') {
0290 |       throw new Error(host.getAttribute('data-eru-publication-error') || 'PUB_PLAN_LAYOUT: Publication could not be prepared')
0291 |     }
0292 |     if (request !== revision || host.getAttribute('data-eru-publication-ready') !== 'true') return null
0293 |     return (frame.contentWindow as Window & { eruPublicationPlan?: PublicationPlan })?.eruPublicationPlan || null
0294 |   }
0295 |   document.addEventListener('click', event => {
0296 |     const target = event.target
0297 |     if (!(target instanceof Element) || target.closest('.eru-reader-ui,.no-print')) return
0298 |     // Authored HTML may update public content from any click handler, not just
0299 |     // a registered template. Preserve that contract while excluding reader UI.
0300 |     queue()
0301 |   }, true)
0302 |   document.addEventListener('eru:reader-content-resized', queue)
0303 |   document.addEventListener('eru:reader-layout-start', () => { if (!printing && !printMedia.matches) { revision++; host.setAttribute('data-eru-publication-ready', 'preparing') } })
0304 |   window.addEventListener('message', event => {
0305 |     // Presentation navigation/pointer telemetry does not change public content.
0306 |     // A pointer stream must never rebuild an entire multi-page publication.
0307 |     if (event.data?.type === 'eru:presentation-pointer' || event.data?.type === 'eru:presentation-key') return
```

**Giải thích theo luồng.** `queue` tăng revision, đánh dirty và hẹn task. Chờ font và frame; nếu revision thay đổi hoặc đang chuẩn bị thì dừng. `eruRequestPublicationPlan` chờ frame, capture nếu dirty, update và xác minh revision/ready trước khi trả plan. Message từ iframe hợp lệ kích hoạt queue trừ telemetry trình chiếu.

**Câu hỏi và cách trả lời.** Tại sao cần revision guard? Hai tính toán async có thể hoàn thành ngược thứ tự; kết quả cũ không nên thay trạng thái mới.

## 22. Quy tắc sử dụng tài liệu chuyên biệt

Khi gặp một thuật ngữ, tra bản đồ ở đầu tài liệu rồi đọc chương giải thích và chuyên khảo có source. Các file `docs/AUTHENTICATION.md`, `docs/CACHE.md`, `docs/MESSAGE_QUEUE.md` và `docs/WORKSPACE_DEVELOPMENT.md` là tài liệu theo chủ đề trong repo; chúng có thể ghi nhận mốc hoặc cấu hình khác, nên ưu tiên đối chiếu commit, mã và báo cáo bàn giao khi có khác biệt. Tài liệu này không cam kết giải thích từng dòng của toàn bộ mọi repository; các đoạn được chọn tập trung vào đường vấn đáp quan trọng nhất và giữ nguyên số dòng để người đọc tự mở rộng.

## 23. Hướng dẫn chạy từng thành phần và thực hành vấn đáp

### 23.1. Trước tiên: em đang chạy bộ nào?

Các hướng dẫn dưới đây dựa trên **project stack** trong `erusentia-server/docker/compose.project.yml` và launcher của repo. Trên máy Ubuntu của bạn, thư mục ngoài cùng là:

```bash
cd /home/tuans-ubuntu/Projects/Personal/EruSentia
```

Nếu giải nén source backend ở nơi khác, `cd` vào đúng thư mục đó và bỏ phần `erusentia-server/` tương ứng. Cần Node.js 24, pnpm 12.11.2, Docker Engine/Compose v2 và dịch vụ Docker đang chạy. Kiểm tra phiên bản và kết nối:

```bash
node --version
pnpm --version
docker --version
docker compose version
docker info
```

Nếu máy chưa có dependency và đã chuẩn bị Node/pnpm, từ thư mục ngoài cùng chạy `pnpm setup:all`; lệnh tải/cài dependency cho ba repo theo lockfile, có thể mất thời gian và cần mạng. `pnpm stack:config` cho biết địa chỉ theo cấu hình mà không in secret. Những cổng dưới đây là mặc định; launcher hoặc file cấu hình local có thể đã đổi. Không đưa file `.env` hoặc token thật lên màn hình chia sẻ hay vào tài liệu nộp.

**Đặc biệt:** repo còn có các file Compose dành cho bài tuần 1/4/5 với cổng khác. Không trộn lệnh project stack dưới đây với cổng của stack cũ.

### 23.2. Chạy nhanh toàn bộ hoặc chỉ một nhóm

Từ thư mục ngoài cùng, mỗi lệnh là một lựa chọn, không cần chạy tất cả:

```bash
pnpm start                 # Server Docker + app desktop Electron + web Admin
pnpm start:web             # Server Docker + app web + web Admin
pnpm start:server          # Chỉ backend stack Docker
pnpm start:server-admin    # Server + web Admin
pnpm start:app-server:web  # Server + app web
pnpm start:app:web         # Chỉ app web; không tự mở backend
pnpm start:admin           # Chỉ Admin; không tự mở backend
pnpm stack:config          # Đọc cấu hình địa chỉ của stack hiện tại
pnpm stack:status          # Xem trạng thái container
pnpm stack:logs            # Xem log; Ctrl+C để thoát màn hình log
pnpm stop                  # Dừng backend Docker, giữ volume dữ liệu
```

`pnpm start` cần môi trường đồ họa để mở Electron. Dừng frontend chạy ở terminal bằng Ctrl+C; `pnpm stop` dừng backend Docker, không xóa dữ liệu và không tự đóng frontend được chạy riêng ở terminal khác. Lần khởi động đầu có thể phải tải image, build, chạy migration/seed; phải chờ health check, không kết luận đã sẵn sàng khi vừa hiện container.

### 23.3. Bảng địa chỉ để mở nhanh

| Thành phần | Mặc định project stack / cách dùng |
| --- | --- |
| App web | `http://127.0.0.1:5173` khi chạy Vite trực tiếp; launcher có thể chọn cổng khác, đọc output thực tế |
| Web Admin | `http://127.0.0.1:5183`; đọc cổng launcher nếu đã đổi |
| API health | `http://127.0.0.1:3001/health` |
| Swagger UI | `http://127.0.0.1:3001/docs` |
| OpenAPI JSON | `http://127.0.0.1:3001/docs-json` |
| Redis | `127.0.0.1:6380` từ host; trong Docker network là `redis:6379` |
| PostgreSQL | `127.0.0.1:5433`, database `eru_project_docker`, user `eru`; trong Docker là `postgres:5432` |
| RabbitMQ management | `http://127.0.0.1:15673`; AMQP từ host là `127.0.0.1:5673` |
| Mailpit | `http://127.0.0.1:8026`; SMTP từ host `127.0.0.1:1026` |

Các cổng host trong Compose bind vào `127.0.0.1`; địa chỉ `redis:6379` là tên service trong mạng Docker, không tự có nghĩa là tên miền dùng từ trình duyệt host. `pnpm stack:config` hiển thị cấu hình chính; dùng thêm `docker ps` để xem cổng host đã publish của Redis, RabbitMQ và Mailpit.

### 23.4. Khởi động riêng Redis, PostgreSQL, RabbitMQ, API và worker

Từ repo backend:

```bash
cd /home/tuans-ubuntu/Projects/Personal/EruSentia/erusentia-server
pnpm stack:up redis
pnpm stack:up postgres
pnpm stack:up rabbitmq mailpit
pnpm stack:up api
pnpm stack:up worker
pnpm stack:status
```

- `redis` riêng: mở cache, **không tự mở API**.
- `postgres` riêng: mở database, **không tự mở API**. Khi chạy API/worker, launcher chuẩn bị PostgreSQL và chạy bước setup/migration/seed trước.
- `rabbitmq mailpit`: mở broker và hộp thư local; chưa tự chứng minh đã có worker xử lý message.
- `api`: launcher build image backend và kéo các dependency cần thiết. `worker`: phụ thuộc API và hạ tầng; không phải chỉ có một container worker độc lập.
- Không chạy `pnpm stack:seed` tùy tiện vào database khác: lệnh project này thực hiện setup/migration/seed cho cấu hình stack đã chọn; nên đọc config và hiểu dữ liệu đang dùng.

Theo dõi từng dịch vụ hoặc dừng một nhóm:

```bash
pnpm stack:logs api
pnpm stack:logs worker
pnpm stack:stop api worker
pnpm stack:down
```

`logs` chạy liên tục: Ctrl+C chỉ thoát xem log. `stack:stop api worker` dừng hai service đó; khi cần dừng database hãy dừng API/worker trước. `stack:down` dừng stack và giữ named volume; không dùng thêm tùy chọn xóa volume khi chưa có chủ đích xử lý dữ liệu.

### 23.5. Vào Redis và giải thích với giảng viên

1. Trong `erusentia-server`, chạy `pnpm stack:up redis`, sau đó `pnpm stack:status`.
2. Nếu Ubuntu có sẵn `redis-cli`, chạy:

```bash
redis-cli -h 127.0.0.1 -p 6380 ping
redis-cli -h 127.0.0.1 -p 6380
```

Lệnh đầu nên trả `PONG`; lệnh thứ hai mở Redis CLI. Trong CLI có thể xem nhẹ nhàng:

```text
PING
INFO server
SCAN 0 MATCH eru_project:* COUNT 20
QUIT
```

`SCAN` trả một cursor và một nhóm key; cursor khác `0` thì dùng số cursor mới để tiếp tục. Không đảm bảo lần đầu thấy key, vì có thể chưa có thao tác cache hoặc namespace/cấu hình khác. Không dùng `KEYS *` trên dữ liệu lớn; không dùng `FLUSHDB`/`FLUSHALL` khi demo vì sẽ xóa cache. Không đọc hoặc chụp key có dữ liệu nhạy cảm.

Nếu máy **không có redis-cli**, xem tên container rồi vào CLI có sẵn trong container:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker exec -it TEN_CONTAINER_REDIS redis-cli ping
docker exec -it TEN_CONTAINER_REDIS redis-cli
```

Thay `TEN_CONTAINER_REDIS` bằng tên thật từ danh sách; không gõ nguyên chữ đó. Khi giảng viên hỏi, giải thích Redis project stack là cache, API vẫn cần PostgreSQL và authorization; tắt Redis không có nghĩa mất dữ liệu chính đã commit trong PostgreSQL. Không thử dừng Redis giữa demo nếu chưa chuẩn bị tình huống khôi phục và không ảnh hưởng người khác.

### 23.6. Vào PostgreSQL bằng CLI hoặc giao diện

Khởi động `pnpm stack:up postgres` trong backend và kiểm tra trạng thái. Nếu máy có `psql`:

```bash
psql -h 127.0.0.1 -p 5433 -U eru -d eru_project_docker
```

Nhập mật khẩu local khi được hỏi. Thông tin dev mặc định trong `erusentia-server/docs/LOCAL_DEVELOPMENT.md`; mật khẩu thực tế có thể đã được đặt riêng và volume cũ không tự đổi mật khẩu khi sửa file cấu hình. Trong `psql`:

```sql
\conninfo
\dt
\d templates
\d workspace_members
SELECT count(*) AS so_template FROM templates;
SELECT count(*) AS su_kien_dang_cho FROM message_outbox WHERE published_at IS NULL;
\q
```

`\dt` chỉ có dữ liệu schema sau khi migration/setup đã chạy; nếu chỉ vừa mở PostgreSQL mới, chạy API theo launcher hoặc kiểm tra hướng dẫn migration trước. `su_kien_dang_cho = 0` có thể là hoàn toàn bình thường khi không có event mới hoặc worker đã xử lý; không chứng minh không có chức năng outbox.

Nếu host chưa có `psql`, dùng container:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker exec -it TEN_CONTAINER_POSTGRES psql -U eru -d eru_project_docker
```

Thay bằng tên container PostgreSQL thật. Với DBeaver/pgAdmin, tạo kết nối PostgreSQL: host `127.0.0.1`, port hiện tại thường `5433`, database `eru_project_docker`, user `eru`, mật khẩu local; bấm **Test Connection** rồi mở schema/table. Không nhầm PostgreSQL port 5432 bên trong container với host port 5433. Chỉ đọc dữ liệu demo, không trình chiếu password hash/token hash.

### 23.7. Mở RabbitMQ Management và Mailpit

Trong backend, chạy `pnpm stack:up rabbitmq mailpit` rồi mở:

- RabbitMQ: `http://127.0.0.1:15673` → đăng nhập bằng user/mật khẩu local cấu hình thực tế. Mặc định dev được mô tả trong `docs/LOCAL_DEVELOPMENT.md`; nếu đổi mật khẩu, dùng thông tin của môi trường đó. Vào **Queues and Streams** để xem queue, số message ready/unacked, consumers. Queue có thể chưa xuất hiện cho đến khi API/worker khởi tạo topology.
- Mailpit: `http://127.0.0.1:8026` → xem email local. Mailpit là hộp thư thử nghiệm, không tự gửi mail ra Internet.

Để thử luồng đăng ký và welcome mail: mở API **và worker**, đăng ký tài khoản demo mới bằng Swagger hoặc App, xem log worker và Mailpit. Tài khoản seed không tự tạo welcome mail. Email xác minh/đặt lại mật khẩu có đường gửi riêng; không đồng nhất mọi email xuất hiện trong Mailpit với bằng chứng đã đi qua RabbitMQ. Dùng địa chỉ và dữ liệu demo riêng, không công bố thông tin thật.

### 23.8. Test Swagger từng bước: đăng nhập và đọc API

1. Chạy `pnpm stack:up api` trong backend hoặc `pnpm start:server` tại thư mục ngoài cùng. Mở `http://127.0.0.1:3001/docs`; nếu không vào được, xem `pnpm stack:config`, `pnpm stack:status`, `pnpm stack:logs api`.
2. Mở nhóm **Authentication** → `POST /auth/login` → **Try it out**. Điền tài khoản demo local, ví dụ:

```json
{
  "email": "user@erusentia.test",
  "password": "EruSentiaDemo!2026"
}
```

3. Bấm **Execute**. Nếu đăng nhập thành công, response có `accessToken` và `refreshToken`. Mật khẩu trên chỉ là mật khẩu seed **ban đầu**; nếu bạn đã đổi, seed không đặt lại.
4. Sao chép giá trị `accessToken` → bấm **Authorize** ở đầu Swagger → dán **chỉ token**, không thêm chữ `Bearer ` → bấm **Authorize** rồi đóng hộp thoại.
5. Mở `GET /auth/me` → **Try it out** → **Execute**. Kết quả cho identity của phiên. Tiếp tục mở `GET /templates` và `GET /workspaces` để xem danh sách theo quyền.
6. Access token có thời hạn theo cấu hình; nếu nhận 401 do hết hạn hoặc phiên bị thu hồi, đăng nhập lại và thay token. Không dán token vào báo cáo hoặc gửi trong chat.

**Tại sao bấm Authorize?** Swagger sẽ thêm header Bearer vào request cần xác thực. Swagger chỉ giúp gửi request và xem contract; server vẫn là nơi kiểm tra token và quyền.

### 23.9. Test Workspace, role và phân quyền trên Swagger

Dùng database demo, không làm thay đổi workspace thật:

1. Đăng nhập `user@erusentia.test` và Authorize như trên.
2. Mở **Workspaces → POST /workspaces** → **Try it out**, nhập ví dụ:

```json
{
  "name": "Demo van dap",
  "slug": "demo-van-dap-2026",
  "description": "Workspace de thu API"
}
```

3. **Execute**. Nếu slug đã tồn tại thì đổi sang slug chữ thường khác, gồm chữ/số và dấu `-`. Copy `id` từ response.
4. `GET /workspaces/{id}` và `GET /workspaces/{id}/members`: nhập ID workspace vừa tạo, Execute. Giải thích người tạo là owner và membership có role.
5. `POST /workspaces/{id}/invites`: nhập ID, body ví dụ `{"email":"creator@erusentia.test","role":"editor"}`. Response chứa token mời: chỉ dùng demo, không chiếu token thật ra ngoài.
6. Đăng nhập bằng user được mời, thay accessToken ở **Authorize**, gọi `POST /workspaces/invites/{token}/accept`. Gọi lại `GET /workspaces/{id}/members` hoặc danh sách workspace để đối chiếu.
7. Muốn minh họa 403, dùng người dùng không phải owner thử thao tác chỉ owner được phép trên **workspace demo**. Muốn minh họa last owner, chuẩn bị tình huống có kiểm soát và giải thích Conflict; đừng xóa/hạ quyền tài khoản hoặc workspace thật.

Giao diện Swagger mô tả schema và status trên từng endpoint; điều kiện phiên/email/hạn lời mời cần thỏa thực tế. Không giả định UI demo đã có mọi nút quản lý workspace mà API hỗ trợ.

### 23.10. Test Template, ETag và cache qua Swagger

1. Với token hợp lệ, vào **Templates → GET /templates** → Execute, chọn một template **demo** mà tài khoản có quyền đọc; copy `id`.
2. Vào `GET /templates/{id}` → điền id → Execute. Xem **Response headers**, chú ý `ETag` và `X-Cache`. Gọi lại và quan sát có thể HIT/MISS/BYPASS; kết quả phụ thuộc cache bật, trạng thái public, Redis và thao tác trước đó. Template private có thể bypass.
3. Để thử cập nhật, chỉ dùng template demo do tài khoản sở hữu. Lấy ETag mới nhất từ GET, vào `PATCH /templates/{id}`, điền `If-Match` đúng nguyên giá trị header, sửa body theo Swagger, ví dụ thay `description`.
4. Sau một cập nhật thành công, gửi lại revision/ETag cũ trên cùng template demo. Nếu contract xung đột được thỏa, kỳ vọng 412; thiếu header theo contract có thể nhận 428. Gọi GET lấy revision hiện tại trước khi demo tiếp.
5. Không xóa template, không chỉnh dữ liệu người khác hoặc publish tài liệu thật trong buổi demo. Public write còn có yêu cầu license/attribution/xác nhận theo contract — xem Swagger thay vì tự bỏ qua.

Giải thích: `ETag`/`If-Match` giúp phát hiện cập nhật dựa trên bản cũ; `X-Cache` cho biết nhánh cache. Cache không thay cho kiểm tra quyền.

### 23.11. Test notifications và outbox

Để xem feed: sau Authorize, mở **Notifications → GET /notifications** → Execute. Nếu có `nextCursor`, copy giá trị vào request tiếp theo để thử pagination; `GET /notifications/unread-count` xem số chưa đọc. Feed rỗng khi chưa có sự kiện là bình thường.

Để trình bày luồng event thật cần chuẩn bị ít nhất hai tài khoản demo, template public demo, một follower, API, worker, PostgreSQL, Redis và RabbitMQ. Dùng Swagger tìm endpoint follow theo nhóm API hiện có, sau đó cập nhật template public bằng ETag hợp lệ, quan sát outbox, log worker, queue và feed của follower. Template private hoặc bị ẩn, thiếu migration, worker chưa chạy hay không có follower có thể khiến không có notification. Không khẳng định “hệ thống lỗi” chỉ vì feed trống; kiểm tra từng điều kiện. Việc nhìn thấy một notification chưa đủ chứng minh retry/DLQ/concurrency trong mọi failure case.

### 23.12. Kiểm tra bằng giao diện App và Admin

- Từ thư mục ngoài cùng, chạy `pnpm start:web`; mở URL App và Admin mà launcher in ra. Chờ API healthy.
- App: dùng nút tài khoản để đăng nhập user demo; thử danh mục template, mở/chèn mẫu theo tính năng có trên phiên bản đang chạy. Dữ liệu lưu cục bộ và dữ liệu server là hai phạm vi khác nhau.
- Admin: mở URL Admin, đăng nhập `admin@erusentia.test` với mật khẩu demo local hiện tại; thực hiện thao tác chỉ đọc như xem danh sách nếu có dữ liệu/quyền. Không khẳng định một màn hình cụ thể tồn tại trên mọi phiên bản chỉ vì endpoint backend có sẵn.
- HTML standalone: mở file HTML trong browser, chọn **Dạng web** để dùng công cụ; nếu dùng bản mã mới cho phép vẽ, nhớ nét vẽ trong phiên không tự ghi ngược file. Bộ cài bài nộp beta.6 có thể chưa có sửa đổi được commit sau lúc đóng gói.

### 23.13. Các lệnh test tự động và cách diễn giải

Trong `erusentia-server`:

```bash
pnpm test                 # Build + suite test; xem pass/fail/skip thực tế
pnpm test:auth            # Suite auth theo script package.json
pnpm test:notifications   # Suite notifications/worker theo script package.json
pnpm test:workspaces      # Suite workspace theo script package.json
pnpm test:queue           # Integration queue theo script package.json
pnpm test:cache           # Integration cache theo script package.json
pnpm test:week6           # Kiểm tra week 6 theo script trong repo
```

Đọc output để biết ca nào cần PostgreSQL/RabbitMQ/Redis thật và ca nào skip; chỉ chạy suite có hạ tầng phù hợp và data test được phép sử dụng. Không mặc định `pnpm test` tương đương test đầy đủ mọi stack. Kết quả 141 đạt/19 skip được ghi từ lần chạy Node 24 trước đó, không đại diện cho lần chạy mới nếu chưa chạy lại. Tránh `pnpm db:reset` và `pnpm db:fresh` trên dữ liệu cần giữ: các script đó có bước reset.

### 23.14. Sự cố thường gặp

- **`pnpm: command not found` hoặc sai Node:** kiểm tra công cụ/version trong terminal Ubuntu; theo README dự án cần Node 24 và pnpm 12.11.2.
- **Không kết nối Docker:** `docker info` để đọc lỗi; khởi động dịch vụ Docker và kiểm tra quyền tài khoản theo thiết lập máy.
- **Cổng đã bị chiếm:** `pnpm stack:config` xem cổng stack; kiểm tra tiến trình/container đang chiếm trước khi đổi cổng, không tự kill tiến trình khác.
- **Swagger không mở:** API chưa healthy, cổng đã đổi hoặc chạy nhầm repo; xem status/log API.
- **Redis `connection refused`:** container Redis chưa chạy, sai host port, hoặc gõ tên `redis` từ host. Xem `stack:status`, `stack:config` và cổng publish trong `docker ps`.
- **Login 401:** kiểm email/mật khẩu demo hiện tại, tài khoản và phiên; mật khẩu ban đầu không tự khôi phục nếu đã đổi.
- **403:** tài khoản đã đăng nhập nhưng không có role/quyền tài nguyên; kiểm tra account đang Authorize và membership.
- **412/428:** kiểm tra ETag/If-Match. Đừng tự động thay ETag rồi ghi đè bản mới của người khác.
- **Database trống/chưa có bảng:** PostgreSQL mới mở chưa chạy setup/migration hoặc đang nối nhầm database; xem config trước khi chạy setup.
- **Notification trống:** kiểm tra template public, follower, event, worker/queue và tài khoản đang xem, theo từng bước ở 23.11.

Nguồn để đọc chi tiết: [Hướng dẫn phát triển local](../../erusentia-server/docs/LOCAL_DEVELOPMENT.md), [hướng dẫn workspace](../../erusentia-server/docs/WORKSPACE_DEVELOPMENT.md), [API auth](../../erusentia-server/src/auth/auth.controller.ts), [workspace controller](../../erusentia-server/src/workspaces/workspaces.controller.ts), [notification controller](../../erusentia-server/src/notifications/notifications.controller.ts) và [project Compose](../../erusentia-server/docker/compose.project.yml).
