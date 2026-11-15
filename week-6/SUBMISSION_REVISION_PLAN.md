# Kế hoạch hiệu đính và hoàn thiện hồ sơ nộp TYP 2026

**Học viên:** Nguyễn Tiến Tuấn  
**Ngày rà soát:** 12/11/2026 · Asia/Bangkok  
**Trạng thái:** Đã rà soát và lập kế hoạch; chưa thực hiện các hạng mục hiệu đính bên dưới.

## 1. Yêu cầu và hướng biên tập

Theo thông báo được cung cấp, đầu ra bắt buộc là **một file Word tối đa 3 trang**, tóm tắt kiến thức đã học, cách ứng dụng vào project và những chức năng khó. Người nhận: `trinhquanglam2k4@gmail.com`. Theo cập nhật của học viên, hạn nộp được hoãn đến **12/11/2026**; chưa có giờ nộp mới trong thông tin được cung cấp.

Bản Word cần đọc độc lập và thể hiện được quá trình học, lựa chọn giải pháp và khả năng giải thích. HTML là tài liệu minh họa bổ trợ, có thể giữ chi tiết kỹ thuật và các công cụ tương tác. Nội dung tổng kết dùng văn phong trang trọng, thuật ngữ nhất quán và các kết luận có phạm vi rõ ràng.

Không lấy việc hoàn thiện toàn bộ sản phẩm làm điều kiện nộp báo cáo. Ưu tiên hoàn thành nội dung, file Word và tính nhất quán của tài nguyên trong ngày; các hạng mục vận hành chưa nghiệm thu được ghi ngắn gọn trong phần giới hạn.

## 2. Kết quả rà soát hiện trạng

| Mức độ | Phát hiện | Hành động đề xuất |
|---|---|---|
| Bắt buộc | Chưa tìm thấy file `.docx`/`.doc` trong các tài nguyên dự án đã liệt kê. | Tạo bản tổng kết Word riêng để nộp. |
| Bắt buộc | `WEEK6_REPORT.md` có 498 dòng, gần 8.000 từ theo cách đếm khoảng trắng; PDF hiện tại có 36 trang. | Viết lại bản tóm tắt theo yêu cầu 3 trang; giữ báo cáo dài làm tài liệu kỹ thuật. |
| Bắt buộc | Báo cáo dài tập trung mô tả hệ thống; phần kết quả học tập cá nhân, bài học rút ra và phần việc kế thừa chưa nổi bật. | Đặt “đã học gì → áp dụng ở đâu → giải quyết vấn đề gì → rút ra điều gì” làm trục nội dung. Phân biệt nền tảng App có sẵn và phần backend/tích hợp thực hiện trong đợt training theo bằng chứng. |
| Bắt buộc | `docs/LEARNING_TRACKER.md` ghi tuần 6 “Đã hoàn thành”, trong khi chương 15 báo cáo còn nêu các bước nghiệm thu. | Đổi thành mô tả triển khai và phạm vi kiểm chứng cụ thể, thống nhất với bản Word. |
| Bắt buộc | `pdf-checks.json` cũ ghi 34 trang và SHA HTML `67197e…`; PDF hiện tại là 36 trang, HTML hiện tại có SHA `d47bf9…`. Bản HTML trong thư mục evidence cũ cũng khác bản HTML đang nộp. | Giữ bằng chứng lịch sử với nhãn ngày/phiên bản. Dẫn bản PDF mới tới bộ publication ngày 12/11, đồng thời tạo manifest mới cho gói nộp. Không sửa số trang trong bằng chứng cũ để tạo cảm giác đã kiểm lại. |
| Bắt buộc | Tiêu đề báo cáo vẫn ghi cập nhật 11/11, trong khi nội dung đã có đợt engine 3.6.0 và bản xuất ngày 12/11. | Cập nhật ngày biên tập/nộp; giữ nguyên ngày thực sự của từng lượt kiểm chứng. Chuyển ngày hardcode trong generator thành metadata dùng chung. |
| Nên sửa | Mở đầu mang tính khẩu hiệu; có các cách diễn đạt như “một bản cập nhật không chỉ…”, “backend biết ai đang đọc gì”, “cửa thoát mọi origin”. | Viết theo bài toán, cơ chế, kết quả và giới hạn; giảm câu quảng bá và cách nói hội thoại. |
| Nên sửa | Ảnh overview ngày 10/11 thể hiện cấu trúc/API Console cũ; bản báo cáo mới có 16 chương và hai template riêng. | Chọn ảnh đúng bản xuất cuối; ảnh lịch sử phải có chú thích ngày và mục đích đối chứng. |
| Bổ trợ | Review publication mới vẫn ghi nhận caption ảnh tách giữa trang 25–26 và nhiều khoảng trắng cuối trang 36. | Ghi nhận trong tài liệu kỹ thuật; chỉ sửa bố cục nếu nhanh và không cần thay engine. Không để việc này chặn bản Word. |

Các điểm đã kiểm tra có kết quả tốt:

- 72 tài liệu Markdown của repo training, loại trừ dependency và thư mục Git: 330 đích liên kết nội bộ được kiểm tra, không thiếu file. Phép kiểm này chưa xác thực heading anchor hoặc khả năng truy cập liên kết ngoài.
- 83 hash nguồn App và 10 hash nguồn server trong `SOURCE_SNAPSHOT.json` đều khớp bytes hiện tại. Hai repo vẫn có thay đổi chưa commit; commit nền chưa đại diện toàn bộ bản bàn giao.
- HTML tại repo training và `erusentia-server/docs/WEEK_6_TECHNICAL_REPORT.html` giống nhau về bytes.
- PDF hiện tại khớp SHA-256 ghi trong `visual-review-2026-11-12.json`, có 36 trang. Review này ghi rõ còn finding.
- Log đã lưu ghi nhận backend 44/44 và session 91/91. Đây là kết quả lịch sử, không phải lượt chạy mới trong lần rà soát này. Bộ backend có PostgreSQL tạm và dùng publisher/Redis kiểm thử ở một số ca; chưa thay thế chuỗi broker/cache thật.

Phạm vi rà soát gồm báo cáo tuần 1–6, lộ trình/tiến độ, nguồn nội dung tuần 6, generator, snapshot, log và JSON kiểm chứng liên quan, một số đường mã Outbox/workspace, PDF và ảnh minh họa. Đã xem trực tiếp trang đầu PDF hiện tại và ảnh overview desktop cũ; nhận xét các trang PDF khác dựa trên review đã lưu. Chưa chạy lại hệ thống, duyệt tương tác HTML hiện tại hay kiểm tra quyền truy cập repo từ tài khoản người nhận.

## 3. Đề cương bản Word tối đa 3 trang

**Tên đề xuất:** “Báo cáo tổng kết quá trình đào tạo Backend và ứng dụng vào dự án EruSentia”.

**Tên file đề xuất:** `NguyenTienTuan_BaoCaoTongKet_TYP2026.docx`.

Không dùng trang bìa riêng hoặc mục lục. Họ tên, tên chương trình, dự án và ngày báo cáo nằm gọn ở đầu trang 1. Mục tiêu khoảng 1.000–1.200 từ theo cách đếm khoảng trắng; số trang sau khi render là tiêu chí quyết định.

| Trang dự kiến | Nội dung | Yêu cầu biên tập |
|---|---|---|
| 1 | Thông tin học viên; mục tiêu đào tạo; giới thiệu bài toán EruSentia; kiến thức tuần 1–5 và ứng dụng. | Giới thiệu ngắn; một bảng 5 hàng nối kiến thức với ví dụ cụ thể. Nêu rõ lựa chọn TypeScript/NestJS để vận dụng OOP/DI, không nhận là đã triển khai Java/Spring. |
| 2 | Hai chức năng khó: thông báo bất đồng bộ và quản lý thành viên workspace. | Mỗi chức năng trình bày vấn đề, giải pháp, lý do lựa chọn, ca kiểm chứng và bài học. Chỉ dùng sơ đồ nếu còn đủ không gian đọc. |
| 3 | Kết quả đạt được; giới hạn hiện tại; tự đánh giá và hướng cải thiện; liên kết tài liệu bổ trợ. | Chọn kết quả liên quan trực tiếp đến backend. Phần tự đánh giá nói rõ điều hiểu sâu hơn và điều cần tiếp tục luyện; không tự gán mức thành thạo. |

### Nội dung kiến thức cần giữ

| Nhóm kiến thức | Minh họa trong project | Điều cần thể hiện là đã hiểu |
|---|---|---|
| Database, OOP, DI | Ràng buộc dữ liệu, transaction, index; phân lớp controller/service/repository. | Transaction bảo vệ tính nhất quán; index có chi phí ghi; DI tách phụ thuộc và hỗ trợ kiểm thử. |
| REST API, ORM, phân trang | NestJS/TypeORM, DTO, xử lý lỗi, feed có cursor ghép. | Validation khác authorization; cursor cần thứ tự xác định; ORM không thay thế hiểu SQL. |
| Authentication/Authorization | JWT, Argon2id, refresh rotation, ownership và role. | Xác thực danh tính khác kiểm tra quyền; role hệ thống khác role workspace. |
| Message Queue | Outbox, dispatcher, RabbitMQ, worker và ràng buộc chống trùng. | DB và MQ có thể lỗi độc lập; message có thể giao lại; ACK không đồng nghĩa xử lý nghiệp vụ đúng một lần. |
| Redis/cache | Cache-aside, TTL, invalidation sau commit, fallback DB. | Cache cần chính sách làm mới; cache quyền cũ là giới hạn cần kiểm chứng; không dùng cache làm nguồn dữ liệu duy nhất. |

### Hai chức năng khó

1. **Thông báo khi phát hành phiên bản template:** giải thích dual write; lưu revision/sự kiện cùng transaction; dispatcher chuyển sự kiện; worker tạo thông báo với unique constraint chống trùng; invalidate số chưa đọc sau commit. Nêu một ca phát lại cùng revision và một ca rollback. Không mô tả toàn bộ RabbitMQ/Redis thật đã nghiệm thu nếu chưa có trace phù hợp.
2. **Quản lý thành viên workspace:** giải thích owner/editor/viewer; lời mời gắn email; transaction/khóa hàng để bảo vệ owner cuối cùng. Nêu ca email không khớp, lời mời viewer không hạ quyền owner và owner duy nhất không được rời. Phân biệt ca kiểm tra tuần tự hiện có với kiểm thử cạnh tranh nhiều connection còn mở. Không mô tả workspace là đồng biên tập thời gian thực hoặc chia sẻ tài nguyên đã hoàn chỉnh.

Resource Gateway, HTML standalone và API Explorer chỉ cần một đoạn ngắn về tích hợp và minh họa. Các chi tiết quota, relay, IPC, engine và in ấn để trong tài liệu kỹ thuật bổ trợ.

### Quy cách hình thức

- Khổ A4, lề khoảng 2 cm; Times New Roman 12 pt hoặc font tương đương có tiếng Việt đầy đủ; giãn dòng 1,15; khoảng cách đoạn 4–6 pt. Đây là lựa chọn biên tập đề xuất, không phải quy định bổ sung của chương trình.
- Tiêu đề 15–16 pt, heading 12–13 pt; màu chủ yếu đen; đánh số trang ở footer. Không dùng emoji, quote trang trí hoặc các card dashboard trong Word.
- Giải nghĩa thuật ngữ Anh ở lần xuất hiện đầu; dùng nhất quán “kiểm thử”, “phân quyền”, “bộ nhớ đệm”, “phiên bản”. Tránh nhồi tên công nghệ và mã nguồn dài.
- Nếu tràn 3 trang, rút nội dung phụ/lặp trước. Kiểm tra từng trang sau khi render, không chỉ dựa vào cấu hình font hoặc số từ.

## 4. Kế hoạch chỉnh sửa theo thứ tự

| Bước | Công việc và file liên quan | Điều kiện hoàn tất |
|---|---|---|
| 1 · Bắt buộc | Viết bản nguồn tóm tắt riêng tại `submission/REPORT_SUMMARY.md` theo đề cương trên. Đối chiếu với báo cáo tuần 1–5, `docs/week-6/report.md` và log backend. | Đủ kiến thức, ứng dụng, chức năng khó, kết quả, giới hạn và bài học cá nhân; không nhận phần có sẵn là công việc mới. |
| 2 · Bắt buộc | Tạo DOCX bằng thư viện `docx` đã có trong App hoặc công cụ có sẵn; xuất PDF kiểm tra bằng LibreOffice. | DOCX hợp lệ; bản render tối đa 3 trang; không vỡ bảng, cắt chữ, heading đứng lẻ hoặc thiếu dấu tiếng Việt. PDF kiểm tra có cùng nội dung với Word. |
| 3 · Bắt buộc | Hiệu đính `erusentia-app/docs/week-6/report.md`; đồng bộ metadata ngày trong `scripts/generate-native-eru-report.mjs`, `scripts/week6/content.mjs`, các mô tả sinh tự động có liên quan. | Nội dung formal và cùng phạm vi với Word. Sửa ở nguồn rồi sinh đầu ra; tránh chỉ sửa `WEEK6_REPORT.md` vì generator sẽ ghi đè. |
| 4 · Bắt buộc | Cập nhật phần bài nộp trong `week-6/README.md` và hàng tuần 6 của `docs/LEARNING_TRACKER.md`. | Chỉ rõ Word là báo cáo tổng kết; HTML/PDF dài là tài liệu bổ trợ; trạng thái không vượt quá bằng chứng. Giữ nguyên đề gốc và các mốc lịch sử. |
| 5 · Bắt buộc | Lập `submission/README.md` và manifest mô tả file cuối, ngày, engine nếu có, SHA-256 và bằng chứng phù hợp. Phân biệt rõ gói evidence 34 trang cũ với gói publication 36 trang mới. | Người đọc xác định được bản nào là cuối. Nếu sinh lại HTML/PDF, mọi bằng chứng dùng để mô tả bản mới phải được kiểm lại hoặc ghi rõ là kết quả lịch sử. |
| 6 · Bổ trợ | Sinh lại HTML bằng renderer có sẵn; ưu tiên chế độ đọc liên tục. Chọn 2–3 ảnh hiện tại, kiểm tra sơ đồ/nhãn, mục lục, desktop/mobile, theme và khối API. | Đọc được nội dung khi không có backend; thao tác gọi API có chỉ dẫn; ảnh minh họa đúng phiên bản và không mang dữ liệu phiên thật. |
| 7 · Chốt hồ sơ | Kiểm tra liên kết người nhận truy cập được; chuẩn bị file và nội dung email. | Word nằm ở đầu danh sách; tài liệu bổ trợ có mục đích rõ; không có bản nháp lẫn trong gói cuối. |

**Ưu tiên nếu thời gian hạn chế:** hoàn thành bước 1–2, sau đó thống nhất các phát biểu ở bước 3–5 và chốt email. Các cải tiến hình thức HTML và PDF kỹ thuật dài có thể giữ ở trạng thái đã ghi nhận. Không thêm tính năng backend, thay kiến trúc, triển khai cloud hoặc sửa engine chỉ để hoàn thiện hình thức báo cáo.

Các repo đang có nhiều thay đổi chưa commit. Giữ nguyên thay đổi hiện tại và các gói ví dụ/vault cũ; không reset, ghi đè gói lưu trữ, commit hoặc publish trong lượt lập kế hoạch. Nếu bước triển khai sau sửa engine thì áp dụng `erusentia-app/AGENTS.md` và quy trình versioning liên quan.

## 5. Phương án trình bày HTML bổ trợ

Giữ khả năng minh họa của bản hiện có, thêm phần tóm tắt ngắn ở đầu để người xem đi theo thứ tự: **kiến thức đã học → hai bài toán khó → minh chứng → chi tiết kỹ thuật**. Có thể giữ 16 chương trong phần tra cứu; không cần thiết kế lại toàn bộ giao diện.

- Sơ đồ kiến trúc và sequence Outbox giúp giải thích cơ chế; ma trận RBAC giúp đối chiếu quyền.
- API Explorer và Hộp thông báo minh họa phản hồi thật khi có backend; nội dung báo cáo vẫn phải đọc được khi mất kết nối.
- Ghép cặp lý thuyết, ma trận lựa chọn gateway và checklist demo đặt ở phần phụ trợ, không chen vào mạch tổng kết kết quả học tập.
- Checklist chưa đánh dấu cần ghi rõ là công cụ tự kiểm khi demo, tránh bị hiểu thành tiến độ project bằng 0%.
- Ảnh cũ dùng cho lịch sử đối chứng; ảnh giới thiệu bản nộp phải chụp từ bản cuối.

## 6. Kiểm tra và đóng gói

### Kiểm tra bắt buộc cho bản nộp

- [ ] Word tối đa 3 trang, có họ tên, ngày 12/11/2026 và tên dự án thống nhất.
- [ ] Có câu trả lời trực tiếp cho ba yêu cầu: học được gì, áp dụng thế nào, chức năng nào khó và vì sao.
- [ ] Đã đọc lại chính tả, cách xưng hô và thuật ngữ; không có placeholder, dấu sửa hoặc comment biên tập.
- [ ] Mọi kết quả kiểm thử có ngày và phạm vi; không cộng các suite giao nhau, không đổi kết quả cũ thành lượt kiểm mới.
- [ ] Hai chức năng khó có ít nhất một minh chứng đúng phạm vi; giới hạn chưa kiểm chứng được trình bày ngắn và chính xác.
- [ ] Word/PDF kiểm tra được xem đủ từng trang; liên kết bổ trợ không phụ thuộc đường dẫn tuyệt đối trên máy cá nhân.
- [ ] HTML và PDF bổ trợ, nếu giao, có hash/manifest đúng bản cuối và không dẫn nhầm evidence cũ.
- [ ] Link source/tài liệu dùng trong email có quyền truy cập phù hợp; repo App đang được tài liệu mô tả là private, không dùng làm liên kết duy nhất để người nhận xem project.

### Kiểm tra kỹ thuật theo thay đổi thực tế

Chỉ biên tập tài liệu không cần chạy lại toàn bộ backend. Đối chiếu log đã lưu và ghi đúng ngày. Nếu cần chứng minh lại nghiệp vụ hoặc có thay đổi mã backend, chạy `pnpm test:week6` với PostgreSQL và database tạm theo runner.

Sau khi sinh lại HTML, chạy bộ tài liệu `playwright.week6-docs.config.ts` để kiểm tra đọc/xuất; nếu thay phần API hoặc mô tả kết quả live mới, chạy bộ `playwright.week6-report.config.ts` với fixture tương ứng. Cần xem kết quả skip/flaky/fail và phạm vi, không chỉ số pass. Chỉ mở rộng kiểm tra publication/samples khi thay runtime hoặc đóng gói lại các bộ đó.

### Hồ sơ dự kiến

```text
submission/
├── NguyenTienTuan_BaoCaoTongKet_TYP2026.docx   # File bắt buộc gửi
├── NguyenTienTuan_BaoCaoTongKet_TYP2026.pdf    # Đối chiếu trình bày, tùy chọn gửi
├── REPORT_SUMMARY.md                          # Nguồn nội dung
├── README.md                                 # Cách mở tài liệu và link bổ trợ
├── manifest.json                             # Bản cuối, hash và bằng chứng
└── EMAIL_DRAFT.txt                            # Nội dung email để người gửi dùng
```

Email nên đính kèm Word; HTML kỹ thuật và mã nguồn cung cấp bằng liên kết đã kiểm tra quyền truy cập. Không cần đính kèm toàn bộ repo, node_modules, vault, log và ảnh lịch sử. Nếu HTML chưa có nơi truy cập phù hợp, có thể gửi riêng bản HTML cuối hoặc gói bổ trợ gọn đã kiểm tra; đây không phải lý do trì hoãn file Word.

**Tiêu đề email dự kiến:** `[TYP 2026] Báo cáo tổng kết đào tạo Backend – Nguyễn Tiến Tuấn`.

**Nội dung dự kiến:**

> Kính gửi anh Lâm,
>
> Em là Nguyễn Tiến Tuấn, học viên chương trình đào tạo Backend TYP 2026. Em gửi anh báo cáo tổng kết quá trình học tập và ứng dụng kiến thức vào dự án EruSentia.
>
> Báo cáo đính kèm trình bày các kiến thức đã học, cách vận dụng vào dự án, hai bài toán kỹ thuật trọng tâm và kết quả thực hiện. Tài liệu minh họa và mã nguồn được dẫn trong báo cáo.
>
> Em cảm ơn anh đã hướng dẫn và hỗ trợ trong thời gian đào tạo.
>
> Trân trọng,  
> Nguyễn Tiến Tuấn

Đây là kế hoạch hiệu đính và bản nháp nội dung gửi. Chưa tạo Word, chưa chỉnh báo cáo hiện có, chưa tải tài nguyên lên dịch vụ ngoài và chưa gửi email.
