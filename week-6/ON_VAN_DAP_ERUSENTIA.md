# CẨM NANG VẤN ĐÁP DỰ ÁN ERUSENTIA — TUẦN 6

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
