# Project: Thực hành tổng hợp

---

## Mô tả

Xây dựng một Backend Project dựa trên kiến thức đã học trong 5 tuần. Tự chọn domain (bán hàng, đặt vé, quản lý khóa học,...).

## Yêu cầu

- Project cần có 1–2 chức năng có độ khó cao để áp dụng kiến thức Backend
- Khuyến khích tích hợp các kiến thức: Database, ORM, Authentication, Message Queue, Redis, Pagination

### Gợi ý chức năng áp dụng kiến thức

| Chức năng | Kiến thức áp dụng |
|-----------|-------------------|
| Đăng ký + Đăng nhập | JWT, Password Hashing, Refresh Token, Role-based Authorization |
| CRUD + danh sách | REST API, ORM, Pagination, Index |
| Đặt hàng / Đặt vé | Transaction, Locking (xử lý concurrent) |
| Gửi email/notification sau khi đặt | Message Queue (async processing) |
| Xem thông tin sản phẩm | Caching Redis, TTL, Cache Invalidation |

## Output

- Source code chạy được
- Trình bày kiến trúc, các chức năng chính và những vấn đề kỹ thuật đã xử lý dưới dạng 1 báo cáo


## Bài nộp EruSentia · cập nhật 11/11/2026

[Báo cáo tổng kết Word](final/NguyenTienTuan_BaoCaoTongKet_TYP2026_Final.docx) · [PDF tổng kết](final/NguyenTienTuan_BaoCaoTongKet_TYP2026_Final.pdf) · [Hướng dẫn nộp và kiểm tra trước khi gửi](SUBMISSION_GUIDE.md).

[Báo cáo Markdown](WEEK6_REPORT.md) · [Bản HTML tương tác](WEEK6_REPORT.html) · [PDF để đọc/in](WEEK6_REPORT.pdf) · [Mốc nguồn và SHA-256](SOURCE_SNAPSHOT.md).

Báo cáo có 16 chương và phụ lục: kiến trúc, mô hình dữ liệu, Transactional Outbox, idempotency, workspace/RBAC, Resource Gateway, API, UI/UX, kiểm chứng và kịch bản demo 12–15 phút. Bốn sơ đồ được lưu trong `assets/`; bản HTML chứa sẵn tài nguyên để đọc độc lập. Công cụ API cần một backend đang chạy và phiên kiểm thử riêng.

`PROJECT_PLAN.md` là kế hoạch lịch sử ngày 04/11, giữ để đối chiếu dự kiến ban đầu. Trạng thái hiện tại và giới hạn nghiệm thu nằm trong báo cáo và bảng kết quả có nguồn; không coi kế hoạch cũ là danh sách công việc hiện còn nguyên.
