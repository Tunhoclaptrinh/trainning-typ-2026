# Bộ prompt NotebookLM cho TYP 2026

Mở `../NOTEBOOKLM_PROMPTS.html` bằng trình duyệt hoặc mở file trong từng tuần.
Các file độc lập có bộ chọn 6 tuần, 44 bài và 5 định dạng cho mỗi bài.
Mỗi prompt đã điền sẵn bài, nguồn, trọng tâm, mục tiêu học và giới hạn hiện thực.

- Tuần 1: 8 bài Database/OOP/DI.
- Tuần 2: 9 bài NestJS/REST/ORM/Postman.
- Tuần 3–5: mỗi tuần 8 bài auth, queue và cache.
- Tuần 6: 3 tài liệu thật (kế hoạch lịch sử, báo cáo project, báo cáo final), không tạo tên docs 01–08 không tồn tại.

`lessons.py` giữ nội dung biên tập, đường dẫn và snapshot. `runtime.js` giữ 5 hướng
dẫn theo định dạng, nguyên tắc nguồn và tương tác. `template.html`, `base.css`,
`icons.js` giữ cấu trúc tài liệu một cột với bộ chọn nằm ngang và SVG Ant Design
được tái sử dụng từ bản gốc. Đây là file tài liệu tương tác, không phải tuyên bố
một engine hoặc tính năng mới đã được cài vào ứng dụng EruSentia.

Sinh lại từ repo TYP:

```bash
python3 docs/notebooklm/generate.py
```

Xem đầu ra trong thư mục khác trước khi thay file:

```bash
python3 docs/notebooklm/generate.py --output /tmp/notebooklm-preview
```

Lệnh chỉ tạo/cập nhật 6 file HTML tuần, bản tương thích `docs/NOTEBOOKLM_PROMPTS_WEEK1.html`
và trang chung `docs/NOTEBOOKLM_PROMPTS.html`. Không sửa bài đọc, báo cáo, code App/server
hoặc commit/tag lịch sử. Hai bản tuần 1 luôn có cùng nội dung.

Bản biên tập 14/11/2026 dựa trên bài đọc, báo cáo và SOURCE_SNAPSHOT của từng tuần.
Đường dẫn server tuần 1–5 được đối chiếu bằng Git object tại SHA đã ghim; tuần 6
giữ cảnh báo working tree và trỏ người đọc về snapshot để chọn đúng tệp/hash.
Không coi kiểm tra đường dẫn là chạy lại benchmark hoặc xác nhận mọi tuyên bố kỹ thuật.

Hướng dẫn sử dụng đối chiếu Google Help: Video Overview 16454555, Slide Deck
16757456, Audio Overview 16212820, Mind Maps 16212283 và Quizzes 16958963.
Link trực tiếp nằm trong mỗi HTML. Video/slide/audio/quiz hướng tới Studio;
prompt mindmap tạo cây Markdown qua Chat và phân biệt với Mind Map tích hợp.
Không cam kết thời lượng video 15 phút, tự crawl GitHub hoặc tự kiểm chứng internet.
