# Mã nguồn dự án — Tuần 6

Trang này ghi **mốc commit đối chiếu cho báo cáo tuần 6 — Project thực hành tổng hợp**. Dùng khi muốn xem, đối chiếu hoặc chạy lại đúng bản mã nguồn đã nghiệm thu.

Mã nguồn được phân tách theo hai repository chính: **EruSentia-Server** (Backend API, Queue, Cache) và **EruSentia** (App Frontend, Desktop & Web).

---

## 1. Mốc commit chốt nguồn Tuần 6

- **Ngày chốt nguồn:** 10/11/2026.
- **EruSentia-Server Commit:** [`f67e1dbf211a734a39f9448c3950f7b1d4b3026e`](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/f67e1dbf211a734a39f9448c3950f7b1d4b3026e)  
  *Nhánh:* `feat/typ-week6-advanced-features`
- **EruSentia-App Commit:** [`20e5e8f52687627a8d7412386dfcbea19e93b4ec`](https://github.com/Tunhoclaptrinh/EruSentia/tree/20e5e8f52687627a8d7412386dfcbea19e93b4ec)  
  *Nhánh:* `feat/typ-week6-advanced-features`

---

## 2. Các phần mã nguồn trọng tâm cần đọc

### Phía Backend (`EruSentia-Server`)
- [Transactional Outbox & Notifications Engine](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/feat/typ-week6-advanced-features/src/notifications): Logic theo dõi template, tạo outbox event khi có cập nhật, worker fanout và cursor pagination.
- [Workspaces Multi-tenancy RBAC](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/feat/typ-week6-advanced-features/src/workspaces): Quản lý không gian làm việc, phân quyền Owner/Editor/Viewer, bảo vệ Last-Owner.
- [Resource Gateway & Relay Service](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/feat/typ-week6-advanced-features/src/resources): Proxy relay, SSRF protection, DNS pinning, document ACLs và quota nguyên tử.
- [Migration SQL 13 & 14](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/feat/typ-week6-advanced-features/sql): `sql/13_workspaces_rbac.sql` và `sql/14_resource_gateway.sql`.
- [Bộ test kiểm chứng Tuần 6](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/feat/typ-week6-advanced-features/test): `test/resources.test.cjs`, `test/notification-cache-safety.test.cjs`, `test/workspace-invite-safety.test.cjs`, `test/api-tools-docs.test.cjs`.

### Phía Frontend (`EruSentia-App`)
- [Resource Gateway Runtime](https://github.com/Tunhoclaptrinh/EruSentia/tree/feat/typ-week6-advanced-features/shared/resources): Transport bridge, postMessage nonce verification, hosted relay adapter.
- [Interactive Templates API Console & Notification Feed](https://github.com/Tunhoclaptrinh/EruSentia/tree/feat/typ-week6-advanced-features/src/config/defaultTemplates/templates/api): 2 template tích hợp trong App và Standalone HTML.
- [Resource Gateway Market Extension](https://github.com/Tunhoclaptrinh/EruSentia/tree/feat/typ-week6-advanced-features/src/components/Sidebar/panels/MarketPanel/components/ResourceGatewayExtension): Giao diện quản lý gateway trong MarketPanel.
- [Kiểm thử tự động App & Gateway](https://github.com/Tunhoclaptrinh/EruSentia/tree/feat/typ-week6-advanced-features/test): `test/resource-gateway.test.mjs`, `test/hub-week6.test.mjs`.

---

## 3. Hướng dẫn chạy lại đúng phiên bản

### 3.1. Clone và khởi động Server

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia-Server.git
cd EruSentia-Server
git checkout f67e1dbf211a734a39f9448c3950f7b1d4b3026e

pnpm install --frozen-lockfile
pnpm build

# Chạy bộ test Tuần 6 độc lập (tự tạo DB tạm và dọn sạch)
pnpm test:week6

# Chạy test đơn vị Resources & Safety
pnpm test:resources
node --test test/notification-cache-safety.test.cjs test/workspace-invite-safety.test.cjs
```

### 3.2. Clone và khởi động App

```bash
git clone https://github.com/Tunhoclaptrinh/EruSentia.git
cd EruSentia
git checkout 20e5e8f52687627a8d7412386dfcbea19e93b4ec

pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:session
pnpm build:vite
```

---

[Báo cáo Tuần 6](WEEK6_REPORT.md) · [Kế hoạch Project](PROJECT_PLAN.md) · [Ảnh minh chứng](screenshots/).
