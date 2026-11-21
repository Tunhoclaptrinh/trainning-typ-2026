# ERD và class diagram cơ sở dữ liệu — EruSentia tuần 6

Các sơ đồ đối chiếu source `erusentia-server` commit `b38390d`, tại thời điểm 20/11/2026. Đây là **phạm vi trọng tâm để vấn đáp tuần 6**, không phải sơ đồ đầy đủ mọi bảng, cột, migration hay module.

## Mở sơ đồ

- [ERD dạng ảnh SVG](ERD_Week6.svg): các bảng chính và những khóa ngoại trọng tâm.
- [Class diagram dạng ảnh SVG](CLASS_Entities.svg): các entity TypeORM thực sự được khai báo.
- [Mã Mermaid ERD](ERD_Week6.mmd) và [mã Mermaid class diagram](CLASS_Entities.mmd): có thể mở bằng trình hỗ trợ Mermaid để chỉnh sửa.
- [Trang xem hai sơ đồ](XEM_SO_DO.html): mở bằng trình duyệt, hỗ trợ in.

## 1. Cách đọc ERD

`PK` là khóa chính; `FK` là khóa ngoại; `UK` là ràng buộc duy nhất; `?` là cột có thể NULL. Ảnh ERD đánh dấu mũi tên từ bảng **chứa khóa ngoại** đến bảng được tham chiếu; do sơ đồ tổng quan cần dễ nhìn, ảnh chỉ vẽ các quan hệ chính. File Mermaid mô tả thêm các khóa ngoại actor/người thao tác trong phạm vi các bảng đã chọn. Các trường liệt kê là đại diện, không phải danh sách cột đầy đủ.

- `users` — `profiles`: profile có `user_id` NOT NULL và UNIQUE, nên mỗi profile thuộc một user, mỗi user có tối đa một profile; một user không bắt buộc có profile.
- `users` — `templates`: một user có thể tạo nhiều template; `templates.author_id` tham chiếu user. `categories` — `templates`: một category có thể có nhiều template.
- `users` — `workspaces`: `workspaces.owner_id` tham chiếu user. Đây là trường owner gốc trên bảng workspace; role thành viên được quản lý riêng qua `workspace_members`.
- `workspace_members`: bảng nối user và workspace, khóa chính ghép `(workspace_id, user_id)`, cùng `role` owner/editor/viewer. Quan hệ nhiều-nhiều được biểu diễn thành hai quan hệ 1-n.
- `workspace_invites`: thuộc workspace, có người mời `invited_by`, email nhận lời mời, role và người chấp nhận `accepted_by` có thể NULL. Invite không đồng nghĩa membership đã được tạo.
- `workspace_resources`: bảng nối workspace với template, khóa chính ghép `(workspace_id, template_id)`; có `added_by`, permission. Có liên kết trong DB không chứng minh mọi luồng cấp quyền template private đã được tích hợp đầy đủ.
- `template_follows`: bảng nối user theo dõi và template, khóa chính ghép `(user_id, template_id)` chống follow trùng.
- `template_revisions`: khóa chính ghép `(template_id, revision)` lưu snapshot và operation. `actor_id` có thể NULL; revision khác version hiển thị.
- `message_outbox`: lưu loại event và payload JSONB. `notifications.event_id` có thể tham chiếu hàng outbox. Bản thân payload có template ID theo quy ước event, **không phải một FK `message_outbox.template_id`**.
- `notifications`: mỗi thông báo có một recipient; actor, template và event có thể NULL. Unique index bộ ba `(recipient_id, template_id, revision)` là **partial unique index** chỉ áp dụng khi template_id và revision khác NULL; không phải khóa chính hay unique cho tất cả các thông báo.
- `auth_refresh_sessions`: một user có thể có nhiều session; `token_hash` là dữ liệu nhạy cảm, không đưa vào demo thật.

Mũi tên FK trong SVG không thể hiện đủ bội số hoặc NULL. Hãy dùng bội số trong Mermaid và đọc điều kiện `NOT NULL`/`UNIQUE` trong SQL khi cần chứng minh. `ON DELETE` được quyết định bởi migration thực tế; ví dụ migration retention thay FK của `template_revisions`, vì vậy không áp mặc định một hành vi xóa cho mọi phiên bản schema.

## 2. Cách đọc class diagram

Class diagram này là góc nhìn **TypeORM persistence entity**, không phải sơ đồ tất cả class backend hay bảng database:

- `AuthorEntity` ánh xạ bảng `users`; đây là tên class trong code, không có nghĩa mọi user đều có vai trò creator.
- `TemplateEntity` ánh xạ `templates` và có `@ManyToOne` tới `AuthorEntity` và `CategoryEntity`; hai entity phía kia có `@OneToMany` tương ứng.
- `RefreshSessionEntity` ánh xạ `auth_refresh_sessions`, có `@ManyToOne` tới `AuthorEntity` qua `user_id`.
- `AdminAuditLogEntity` ánh xạ `admin_audit_logs`. `actor_id` có FK ở SQL, nhưng entity chỉ có trường `actorId`, không khai báo decorator quan hệ ORM tới `AuthorEntity`; vì vậy SVG không vẽ quan hệ ORM này.
- Workspace, notification và nhiều bảng khác có SQL/service tương ứng; không tự tạo class TypeORM trong sơ đồ khi mã không khai báo entity đó. Thuộc tính trong hình được chọn lọc, không đầy đủ.

Class diagram không phải sơ đồ trình tự hay ERD: nó mô tả class/thuộc tính và association ở mức ứng dụng; ERD mô tả bảng, khóa và ràng buộc dữ liệu. Entity TypeORM có thể không khai báo mọi FK hay cột được định nghĩa trong toàn bộ SQL.

## 3. Nguồn đối chiếu

- [Schema cơ sở](../../../erusentia-server/sql/01_schema.sql)
- [Session authentication](../../../erusentia-server/sql/05_auth_sessions.sql)
- [Outbox](../../../erusentia-server/sql/06_message_queue.sql)
- [Revision](../../../erusentia-server/sql/08_template_revisions.sql) và [migration retained resources](../../../erusentia-server/sql/12_retained_resources.sql)
- [Follows và notifications](../../../erusentia-server/sql/12_template_notifications.sql)
- [Workspace/RBAC](../../../erusentia-server/sql/13_workspaces_rbac.sql)
- [Các entity users/category/template](../../../erusentia-server/src/templates/persistence/entities.ts)
- [RefreshSessionEntity](../../../erusentia-server/src/auth/persistence/refresh-session.entity.ts)
- [AdminAuditLogEntity](../../../erusentia-server/src/admin/persistence/admin-audit-log.entity.ts)

## 4. Kịch bản giải thích 60 giây

“Ở giữa ERD là users, templates và workspaces. User có thể tạo nhiều template và tham gia nhiều workspace thông qua workspace_members; khóa ghép ngăn trùng membership và role xác định quyền trong workspace. Người dùng theo dõi template qua template_follows. Khi template công khai cập nhật, backend ghi sự kiện vào outbox, sau đó xử lý để tạo notification; unique index trên người nhận, template và revision hỗ trợ chống trùng. Ở class diagram, AuthorEntity, TemplateEntity, CategoryEntity và RefreshSessionEntity là các class TypeORM có quan hệ được khai báo. Các bảng workspace và notifications có SQL/service riêng nên không tự nhận tất cả là entity TypeORM.”
