# Chỉ mục bối cảnh vấn đáp — TYP, EruSentia Server và Admin

Cập nhật 20/11/2026. Mục đích: giúp tìm đúng tài liệu và mã khi hỏi vấn đáp; không thay thế việc mở source hoặc kiểm chứng khi trả lời câu hỏi cụ thể. Không coi mọi tài liệu lịch sử là trạng thái hiện tại.

## 1. Bối cảnh chung

- Workspace có ba repo độc lập `erusentia-app`, `erusentia-server`, `erusentia-admin`, cùng repo tài liệu `trainning-typ-2026`. Launcher ngoài cùng điều phối cả stack; các repo có Git và dependency riêng.
- TYP gồm 6 tuần: 1 Database + OOP; 2 Framework/REST/ORM; 3 Authentication/Authorization; 4 Message Queue; 5 Caching/Redis; 6 Project tổng hợp. [Đề gốc](../README.md), [theo dõi học tập](LEARNING_TRACKER.md).
- Server quan sát tại `b38390d`; Admin tại `7976725`; App có commit `44fec1ec`, engine 3.15.0. Đây là mốc quan sát, không đảm bảo repo không đổi sau ngày ghi.
- Backend trong bộ nộp là archive commit `b38390d`; bộ nộp app beta.6 và báo cáo engine 3.14.6 có trước sửa whiteboard 3.15.0. [Đối chiếu bộ nộp](../../deliverables/NguyenTienTuan_TYP_Week6_EruSentia_beta6_Final3146_HTML_20261120/05_Backend/DOI_CHIEU_BAO_CAO.md).
- Kết quả backend b38390d ghi nhận tại ngày 20/11: Node 24, 160 bài: 141 pass, 0 fail, 19 skip; không đại diện việc đã chạy đủ PostgreSQL/RabbitMQ/Redis thật. Kết quả cũ trong báo cáo phải giữ đúng mốc và phạm vi.
- Keycloak, GitHub login, phê duyệt truy cập là kế hoạch/nghiên cứu, không trình bày thành tính năng đang triển khai.

## 2. Bản đồ TYP theo tuần

Mỗi tuần có đề `README.md`, báo cáo, mục lục `docs/00_GUIDE_INDEX.md` và `SOURCE_SNAPSHOT.md`; đọc snapshot trước khi đồng nhất code hiện tại với kết quả lịch sử.

| Tuần | Trọng tâm cần nhớ | Tài liệu bắt đầu |
|---|---|---|
| 1 | SQL/DDL/DML, joins, index, OFFSET/cursor, transaction/ACID, pessimistic/optimistic lock, OOP, DI | [Mục lục tuần 1](../week-1/docs/00_GUIDE_INDEX.md), [báo cáo](../week-1/WEEK1_REPORT.md) |
| 2 | NestJS module/controller/service, REST, DTO/validation, TypeORM, repository, API pagination, lỗi HTTP, Postman | [Mục lục tuần 2](../week-2/docs/00_GUIDE_INDEX.md), [báo cáo](../week-2/WEEK2_REPORT.md) |
| 3 | Authn/authz, JWT, Argon2id, guard/ownership, refresh rotation, session, Swagger | [Mục lục tuần 3](../week-3/docs/00_GUIDE_INDEX.md), [báo cáo](../week-3/WEEK3_REPORT.md) |
| 4 | RabbitMQ, topic exchange, queue, transactional outbox, confirm/ack, retry/DLQ, idempotency, giới hạn SMTP | [Mục lục tuần 4](../week-4/docs/00_GUIDE_INDEX.md), [bài 03 topology](../week-4/docs/03_rabbitmq_architecture.md), [bài 07 thực hành](../week-4/docs/07_demo_and_evidence.md) |
| 5 | Redis, cache-aside, TTL, invalidation, stampede, private bypass, kiểm thử HIT/MISS | [Mục lục tuần 5](../week-5/docs/00_GUIDE_INDEX.md), [bài 07 thực hành](../week-5/docs/07_swagger_demo.md) |
| 6 | Project tổng hợp, notification/outbox, workspace/RBAC, gateway, API, demo và giới hạn kiểm chứng | [Đề tuần 6](../week-6/README.md), [báo cáo kỹ thuật](../week-6/WEEK6_REPORT.md) |

Cẩm nang vấn đáp tổng hợp: [Markdown](../week-6/CAM_NANG_VAN_DAP_CHUYEN_SAU_ERUSENTIA.md) và [Word](../week-6/CAM_NANG_VAN_DAP_CHUYEN_SAU_ERUSENTIA.docx). Chương 23 có lệnh chạy riêng và hướng dẫn Swagger/Redis/PostgreSQL/RabbitMQ. [ERD và class diagram](../week-6/SO_DO_DU_LIEU/README.md) là phạm vi trọng tâm, không phải toàn bộ schema.

## 3. Server — các đường lần theo source

- Bootstrap/config: `erusentia-server/src/main.ts`, `src/app.ts`, `src/config.ts`; NestJS, TypeORM, PostgreSQL, DTO/ValidationPipe, CORS, Swagger.
- Auth: `src/auth/auth.service.ts`, `auth.guards.ts`, `passwords.ts`, `auth-store.ts`, persistence; Argon2id, access JWT, refresh rotation và session kiểm tra phía server.
- Template API và bảo vệ cập nhật: `src/templates/templates.controller.ts`, `templates.service.ts`, `template-revisions.ts`, `persistence/postgres-template.store.ts`; ETag/If-Match, 412/428, ownership.
- Queue và welcome: `src/messaging/rabbit.ts`, `welcome-repository.ts`, `welcome-worker.ts`; transaction/outbox, publisher confirm, ack, retry/DLQ, SMTP có cửa sổ có thể gửi trùng.
- Notification: `src/messaging/notification-repository.ts`, `notification-worker.ts`, `src/notifications/notifications.service.ts`, `sql/12_template_notifications.sql`; unique index theo recipient/template/revision, cursor created_at/id, Redis unread count.
- Workspace: `src/workspaces/workspaces.controller.ts`, `workspaces.service.ts`, `sql/13_workspaces_rbac.sql`; owner/editor/viewer, invitation và last-owner lock. Cache role TTL 600 giây, lỗi invalidate bị bỏ qua: không bảo đảm thu hồi quyền tức thời trong mọi sự cố. Chưa nhận test tuần tự là chứng minh mọi interleaving/deadlock.
- Cache: `src/cache/template-cache.ts`; stamp ở DB, kiểm quyền, public cache theo revision, bypass private/Redis lỗi, pending map theo process và TTL jitter.
- Phần khác: `src/resources`, `src/admin`, `src/moderation`, `src/community-documents`, `src/service-controls`; đọc tài liệu chức năng trước khi khẳng định phạm vi.
- Tài liệu chuyên sâu: [auth](../../erusentia-server/docs/AUTHENTICATION.md), [queue](../../erusentia-server/docs/MESSAGE_QUEUE.md), [cache](../../erusentia-server/docs/CACHE.md), [local development](../../erusentia-server/docs/LOCAL_DEVELOPMENT.md), [workspace launcher](../../erusentia-server/docs/WORKSPACE_LAUNCHER.md).

## 4. Admin — cấu trúc, luồng và giới hạn

- Admin là SPA React/TypeScript độc lập, Ant Design và TanStack Query; giao tiếp API backend, không trực tiếp quản lý file local trên máy người dùng. [README](../../erusentia-admin/README.md), [mức bao phủ](../../erusentia-admin/docs/ADMIN_COVERAGE_REVIEW.md), [kiểm chứng theo mốc](../../erusentia-admin/docs/VERIFICATION.md).
- `src/api/adminClient.ts`: API base mặc định `/api`, đọc/lưu session trong `sessionStorage` (nếu không khả dụng giữ trong memory), thêm Bearer, timeout, xử lý 401 và generation guard. Không mô tả sessionStorage là chống XSS hay bảo mật tuyệt đối. Theo README, tự refresh access token chưa được coi là hoàn thành.
- `src/auth/AdminAuthContext.tsx`: login gọi `/auth/login`, yêu cầu user role admin cho UI, lưu token; logout xóa state/cache và gọi revoke session. Kiểm tra role ở UI không thay thế guard/authorization server.
- `src/layout/navConfig.ts` và `src/features`: dashboard, accounts, templates, documents, document-reports, categories, moderation, queues, audit, resources. Những mục có navigation không tự chứng minh backend/UI hỗ trợ mọi tác vụ.
- Theo tài liệu bao phủ: có các luồng tài khoản, template, categories, community documents/reports, protected resources, plan/quota, audit và một số thông tin vận hành. Template curated là huy hiệu chất lượng, không mặc định hàng chờ duyệt bắt buộc; luồng duyệt bắt buộc đang nói về community documents.
- Chưa coi Keycloak/OIDC/MFA, quản trị workspace trong portal, telemetry Redis/RabbitMQ và DLQ redrive thực là hoàn thành. Khi trả lời khả năng cụ thể, đọc lại `ADMIN_COVERAGE_REVIEW.md` và code tương ứng.
- Dev local: `pnpm start:server-admin` tại workspace hoặc `pnpm dev` trong repo Admin khi backend đã chạy; thường Admin `127.0.0.1:5183`, API `127.0.0.1:3001`. Vite proxy `/api` tới API; production cần proxy/origin và CORS tương ứng. Cổng có thể thay đổi theo launcher.

## 5. Quy tắc trả lời

1. Xác định câu hỏi thuộc tuần nào, phiên bản lịch sử nào và repo nào.
2. Bắt đầu từ khái niệm dễ hiểu → ví dụ dự án → file/hàm → đánh đổi → bằng chứng/giới hạn.
3. Nếu hỏi triển khai hiện tại, mở source và đối chiếu Git status thay vì chỉ dựa vào tài liệu cũ. Phân biệt local stack, ảnh chụp lịch sử, bộ nộp và bản cập nhật sau nộp.
4. Không bịa kết quả chạy, hiệu năng, chức năng hoặc phần việc cá nhân. Khi không chắc, nói rõ và mở đúng file/kiểm thử để xác nhận.
5. Không lộ token, mật khẩu cá nhân, secret, dữ liệu private. Cấu hình demo và tài khoản local được mô tả trong tài liệu dự án, không dùng cho production.
