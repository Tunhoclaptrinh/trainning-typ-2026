# BÁO CÁO TỔNG KẾT ĐÀO TẠO BACKEND
## Ứng dụng kiến thức vào dự án EruSentia

**Học viên:** Nguyễn Tiến Tuấn  
**Chương trình:** Backend Training TYP 2026  
**Ngày báo cáo:** 12/11/2026

### 1. Mục tiêu và phạm vi thực hiện

Trong quá trình đào tạo, tôi đã học và thực hành các nhóm kiến thức về cơ sở dữ liệu, lập trình hướng đối tượng, xây dựng API, xác thực và phân quyền, hàng đợi thông điệp và bộ nhớ đệm. Dự án EruSentia được sử dụng để kết nối những nội dung này vào một bài toán xuyên suốt: quản lý và chia sẻ mẫu tài liệu (template), kiểm soát quyền truy cập và thông báo khi có phiên bản mới.

Dự án kế thừa nền tảng ứng dụng ghi chú EruSentia đã có. Trọng tâm áp dụng kiến thức backend là dịch vụ Sentia Hub sử dụng TypeScript, NestJS, TypeORM và PostgreSQL, kết hợp RabbitMQ và Redis. Ứng dụng và tài liệu HTML độc lập đóng vai trò giao diện minh họa, giúp quan sát request, dữ liệu và kết quả xử lý.

### 2. Kiến thức đã học và cách ứng dụng

| Nhóm kiến thức | Ứng dụng trong dự án và nhận thức rút ra |
|---|---|
| **Cơ sở dữ liệu, OOP và DI** | Thiết kế quan hệ giữa người dùng, template, phiên bản, thông báo và thành viên workspace; sử dụng khóa ngoại, ràng buộc duy nhất, chỉ mục và transaction. Áp dụng OOP và Dependency Injection qua các lớp controller, service và repository. Tôi hiểu rõ hơn việc bảo vệ tính nhất quán ở cơ sở dữ liệu và tách phụ thuộc để thuận tiện kiểm thử. |
| **REST API, ORM và phân trang** | Xây dựng API bằng NestJS và ánh xạ dữ liệu qua TypeORM; sử dụng DTO để kiểm tra đầu vào, chuẩn hóa lỗi và mô tả API bằng OpenAPI/Swagger. Danh sách thông báo dùng cursor ghép thời điểm tạo và ID để xác định thứ tự. Qua đó, tôi nhận thấy sử dụng ORM vẫn cần hiểu SQL, truy vấn và đặc điểm của từng cách phân trang. |
| **Xác thực và phân quyền** | Áp dụng Argon2id để băm mật khẩu, JWT cho access token, refresh-token rotation và kiểm tra ownership. Phân biệt vai trò hệ thống với vai trò owner/editor/viewer của workspace. Tôi hiểu rằng xác thực danh tính và kiểm tra quyền là hai bước khác nhau; việc ẩn nút trên giao diện không thay thế kiểm tra ở backend. |
| **Message Queue** | Sử dụng RabbitMQ, Transactional Outbox và worker để tách việc ghi dữ liệu khỏi xử lý thông báo; thực hành acknowledge, retry và dead-letter queue. Tôi hiểu rằng thông điệp có thể được giao lại, nên consumer cần cơ chế chống tạo kết quả nghiệp vụ trùng, thay vì giả định mỗi thông điệp chỉ đến một lần. |
| **Caching và Redis** | Áp dụng cache-aside, TTL, invalidation và phương án đọc lại PostgreSQL khi cache không khả dụng; sử dụng cache cho dữ liệu template public và số thông báo chưa đọc. Tôi hiểu rằng cache giúp giảm xử lý lặp nhưng cần chính sách làm mới rõ ràng, đặc biệt với dữ liệu liên quan đến quyền truy cập. |

<!-- pagebreak -->

### 3. Hai chức năng có độ khó cao

#### 3.1. Thông báo bất đồng bộ khi phát hành phiên bản template

**Bài toán:** Khi tác giả cập nhật template, nội dung mới phải được lưu nhất quán và người theo dõi cần nhận thông báo tương ứng. Nếu ghi PostgreSQL và gửi RabbitMQ bằng hai thao tác độc lập, tiến trình có thể dừng sau khi lưu dữ liệu nhưng trước khi gửi sự kiện; trường hợp ngược lại có thể tạo thông báo cho thay đổi chưa được lưu thành công.

**Giải pháp:** Nội dung, bản lưu phiên bản và sự kiện Outbox được ghi trong cùng một transaction. Dispatcher đọc sự kiện đang chờ và chuyển tới RabbitMQ; worker xử lý việc tạo thông báo cho người theo dõi. Cách này giúp giữ sự kiện trong cơ sở dữ liệu để tiếp tục xử lý khi hạ tầng phục hồi, đồng thời tách công việc hậu kỳ khỏi request cập nhật.

Do dispatcher hoặc worker có thể xử lý lại, cơ sở dữ liệu đặt ràng buộc duy nhất theo người nhận, template và revision. Thao tác tạo thông báo dùng cơ chế bỏ qua bản ghi trùng; cache số chưa đọc được vô hiệu hóa sau khi transaction ghi thông báo đã commit. Feed dùng cursor ghép để giữ thứ tự xác định khi nhiều thông báo có cùng thời điểm tạo.

**Kiểm chứng và bài học:** Các ca kiểm thử ghi nhận việc phát lại cùng revision không tạo thông báo trùng; cache chỉ thay đổi sau commit và không thay đổi khi rollback. Điểm tôi hiểu rõ hơn là Outbox xử lý tính nhất quán giữa dữ liệu và sự kiện, còn idempotency xử lý hậu quả của việc giao lại; hai cơ chế bổ sung cho nhau. Xác nhận của broker chưa chứng minh toàn bộ nghiệp vụ đã hoàn tất.

#### 3.2. Quản lý thành viên, lời mời và vai trò trong workspace

**Bài toán:** Workspace có ba vai trò owner, editor và viewer. Việc mời thành viên phải đúng người nhận, đúng quyền và không làm workspace mất owner cuối cùng. Một kiểm tra đơn giản như đếm owner rồi mới cập nhật có thể không còn đúng khi nhiều yêu cầu xảy ra đồng thời.

**Giải pháp:** Backend kiểm tra vai trò của người gọi và giới hạn hành động theo quyền. Lời mời được gắn với email, vai trò và thời hạn; khi chấp nhận, backend kiểm tra tài khoản nhận, trạng thái lời mời và membership hiện có. Lời mời viewer không được hạ quyền một owner đã tồn tại. Khi thay đổi vai trò hoặc xóa thành viên, service dùng transaction và khóa hàng liên quan bằng `SELECT ... FOR UPDATE` để bảo vệ quy tắc owner cuối cùng.

**Kiểm chứng và bài học:** Các ca đã kiểm tra gồm từ chối email nhận không khớp, giữ nguyên owner khi nhận lời mời viewer và chặn owner duy nhất rời nhóm hoặc bị hạ quyền. Qua chức năng này, tôi nhận thấy cần xác định rõ quy tắc nghiệp vụ phải luôn đúng, phạm vi transaction và các hàng cần khóa. Các ca tuần tự hiện có chưa thay thế kiểm thử đồng thời bằng nhiều kết nối; đây là nội dung cần tiếp tục xác minh.

<!-- pagebreak -->

### 4. Kết quả thực hiện và phạm vi kiểm chứng

Dự án đã có backend quản lý template và phiên bản, tài khoản và quyền truy cập; chức năng theo dõi, feed thông báo, quản lý thành viên và lời mời workspace. API Explorer và Hộp thông báo hỗ trợ minh họa thao tác với API. Resource Gateway là phần tích hợp bổ sung để tài liệu HTML độc lập truy cập API hoặc tài nguyên theo chính sách kết nối và quyền của backend.

Theo log và bằng chứng đã lưu cho mốc báo cáo ngày 11/11/2026, bộ kiểm thử backend tuần 6 ghi nhận **44/44 ca đạt**, sử dụng PostgreSQL trong cơ sở dữ liệu tạm; một số ca dùng publisher và Redis thay thế trong môi trường kiểm thử. Bộ session/bridge/transport của ứng dụng ghi nhận **91/91 ca đạt**. Hai kết quả được trình bày theo phạm vi riêng, không quy đổi thành tỷ lệ hoàn thiện sản phẩm.

Các tình huống tiêu biểu đã kiểm tra gồm giao lại thông báo, phân trang khi trùng thời điểm tạo, xác nhận lời mời đúng email, bảo vệ owner cuối cùng và kiểm tra quyền truy cập tài nguyên. Tài liệu HTML, sơ đồ và ảnh thao tác được giữ làm phần minh họa bổ trợ cho báo cáo tổng kết.

### 5. Giới hạn hiện tại và hướng cải thiện

**Luồng bất đồng bộ:** Cần kiểm chứng bổ sung chuỗi phát hành → RabbitMQ → worker → Redis → giao diện bằng đầy đủ dịch vụ thật, gồm khởi động lại, xử lý lỗi và giao lại thông điệp. Kiểm thử repository hoặc publisher thay thế chưa đủ để kết luận về toàn bộ luồng vận hành.

**Phân quyền workspace:** Cần hoàn thiện kiểm tra quyền tài nguyên xuyên suốt các endpoint và kiểm thử nhiều kết nối cùng thay đổi owner. Cache vai trò hiện có TTL 600 giây; lỗi invalidation có thể giữ quyền cũ. Hướng cải thiện là kiểm tra PostgreSQL ở thao tác nhạy cảm hoặc bổ sung cơ chế phiên bản quyền có thể kiểm chứng. Workspace hiện chưa được coi là chức năng đồng biên tập thời gian thực.

**Hiệu năng và vận hành:** Cần đo tải với dữ liệu và điều kiện xác định, bổ sung theo dõi log/metrics, đánh giá giới hạn xử lý thông báo và kiểm tra phục hồi. Các kết quả kiểm thử cục bộ hiện có chưa chứng minh khả năng vận hành ở quy mô lớn.

### 6. Tự đánh giá sau quá trình đào tạo

Qua quá trình thực hành, tôi hiểu rõ hơn mối liên hệ giữa transaction, hàng đợi, cache và phân quyền. Một chức năng backend cần được đánh giá cả ở tình huống thành công lẫn khi request lặp, tiến trình dừng, cache cũ hoặc quyền thay đổi. Việc lựa chọn giải pháp cần bắt đầu từ vấn đề cụ thể và có ca kiểm chứng tương ứng.

Nội dung cần tiếp tục rèn luyện là phân tích truy vấn, thiết kế kiểm thử đồng thời và chẩn đoán lỗi xuyên nhiều thành phần. Trong các bước tiếp theo, tôi ưu tiên kiểm chứng đầy đủ hai chức năng trọng tâm, làm rõ các đánh đổi kỹ thuật và hoàn thiện khả năng giải thích luồng dữ liệu từ request đến kết quả nghiệp vụ.

**Tài liệu bổ trợ:** Báo cáo kỹ thuật chi tiết và sơ đồ trong `WEEK6_REPORT.html`; mã nguồn backend tại `github.com/Tunhoclaptrinh/EruSentia-Server`; các mốc nguồn và bằng chứng trong `SOURCE_SNAPSHOT.md` và hồ sơ tuần 6.
