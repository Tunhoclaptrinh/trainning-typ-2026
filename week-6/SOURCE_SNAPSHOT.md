# Mốc nguồn báo cáo tuần 6

Cập nhật 16/11/2026. Bản HTML, Markdown và example được tạo bằng mã trong working tree hiện tại.

| Repo | Nhánh | Commit nền | Có thay đổi chưa commit |
|---|---|---|---|
| app | `release/1.1.0-beta.3-week6` | `2203b5fff300da34ad62fc0c4ce53973a3264bcd` | Có |
| server | `perf/document-runtime` | `58a46d7ad971dffaaaa9febeaf61634a1de255db` | Có |

Commit nền không đại diện toàn bộ bytes của đầu ra khi working tree còn thay đổi. [SOURCE_SNAPSHOT.json](SOURCE_SNAPSHOT.json) ghi SHA-256 các tệp trọng tâm; không coi checkout riêng commit nền là đã có các thay đổi chưa commit. Không tạo commit hoặc publish tự động khi sinh tài liệu.

Nguồn nội dung: repo app `docs/week-6/report.md`, `scripts/week6/`, `scripts/showcase/`. Sinh lại với `pnpm docs:week6`; xuất bộ mới bằng `pnpm samples:export --output <thư-mục-mới>`. Gói cũ và vault đã sửa được giữ. Các tệp tuần 6 cập nhật trong dev-samples có bản sao trước đó tại report-backups cục bộ.

[Báo cáo Markdown](WEEK6_REPORT.md) · [Báo cáo HTML](WEEK6_REPORT.html) · [PDF cùng revision](WEEK6_REPORT.pdf) · [Receipt HTML/PDF](PUBLICATION_VERIFICATION.json) · [Kế hoạch ban đầu](PROJECT_PLAN.md)
