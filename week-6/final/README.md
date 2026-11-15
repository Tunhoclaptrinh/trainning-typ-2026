# Báo cáo final · Nguyễn Tiến Tuấn · TYP 2026

Ngày báo cáo: **12/11/2026**.

- [Bản Word để nộp](NguyenTienTuan_BaoCaoTongKet_TYP2026_Final.docx).
- [Bản PDF để xem bố cục](NguyenTienTuan_BaoCaoTongKet_TYP2026_Final.pdf).
- [Nguồn nội dung](REPORT_FINAL.md).
- [Thông tin kiểm tra và SHA-256](manifest.json).

Bản final có **3 trang A4** trong PDF xuất trực tiếp từ Word bằng LibreOffice. Font Times New Roman, nội dung chính 12 pt, bảng 11,5 pt, lề 2 cm. Đã ngắt trang theo nội dung: kiến thức và ứng dụng; hai chức năng khó; kết quả, giới hạn và tự đánh giá.

Báo cáo dài ở thư mục cha được giữ nguyên. [HTML kỹ thuật](../WEEK6_REPORT.html) là tài liệu minh họa bổ trợ; các số liệu kiểm thử trong bản final được ghi theo log đã lưu, không được mô tả là kết quả chạy lại ngày nộp.

Gửi file Word ở trên. PDF có thể gửi kèm để người nhận đối chiếu trình bày. Các file Markdown, script và manifest dùng để lưu nguồn và tái tạo báo cáo, không cần đính kèm email.

Để sinh lại Word, chạy `node build-report.cjs` trong thư mục này với Node.js và dependency `docx` đã cài trong repo App cùng workspace. Sau đó chuyển chính file Word vừa tạo sang PDF bằng LibreOffice và kiểm tra lại số trang. Thư mục này không sửa hoặc sinh lại báo cáo cũ.
