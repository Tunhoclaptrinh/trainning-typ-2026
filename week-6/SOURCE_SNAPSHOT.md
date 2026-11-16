# Mốc nguồn báo cáo tuần 6

Cập nhật 16/11/2026. Bản HTML, Markdown và example được tạo bằng mã trong working tree hiện tại.

| Repo | Nhánh | Commit nền | Có thay đổi chưa commit |
|---|---|---|---|
| app | `feat/template-library-preview-authoring` | `1a31763ca92f180fc78e96f12fc043ac31844c34` | Có |
| server | `main` | `5e81d8ba1e089c9a6a7ef0c453392508b3047da0` | Có |

Commit nền không đại diện toàn bộ bytes của đầu ra khi working tree còn thay đổi. [SOURCE_SNAPSHOT.json](SOURCE_SNAPSHOT.json) ghi SHA-256 các tệp trọng tâm; không coi checkout riêng commit nền là đã có các thay đổi chưa commit. Không tạo commit hoặc publish tự động khi sinh tài liệu.

Nguồn nội dung: repo app `docs/week-6/report.md`, `scripts/week6/`, `scripts/showcase/`. Sinh lại với `pnpm docs:week6`; xuất bộ mới bằng `pnpm samples:export --output <thư-mục-mới>`. Gói cũ và vault đã sửa được giữ. Lượt này dùng --no-dev-vault: không cập nhật dev-samples; mở bản sao vault mới để kiểm runtime mới. Các HTML server/training bị thay có backup tại report-backups cục bộ.

[Báo cáo Markdown](WEEK6_REPORT.md) · [Báo cáo HTML](WEEK6_REPORT.html) · [PDF cùng revision](WEEK6_REPORT.pdf) · [Receipt HTML/PDF](PUBLICATION_VERIFICATION.json) · [Kế hoạch ban đầu](PROJECT_PLAN.md)
