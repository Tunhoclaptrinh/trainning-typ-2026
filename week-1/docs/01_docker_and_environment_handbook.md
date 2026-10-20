# 🐳 SỔ TAY KỸ THUẬT TUẦN 1: DOCKER & MÔI TRƯỜNG DATABASE THỰC CHIẾN

> Đối chiếu thực hành: [Docker Compose](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/b851e1576ae48fe62efcec10dd2d912e011a6220/docker/docker-compose.dev.yml), [Biến môi trường mẫu](https://github.com/Tunhoclaptrinh/EruSentia-Server/blob/b851e1576ae48fe62efcec10dd2d912e011a6220/.env.example). Các lệnh shell trong bài chạy từ thư mục gốc repo `EruSentia-Server` sau khi setup theo [README backend](https://github.com/Tunhoclaptrinh/EruSentia-Server/tree/b851e1576ae48fe62efcec10dd2d912e011a6220).
> Ghi chép các kiến thức "ngầm", bài học thực tế và thông số kết nối quan trọng cần nhớ trong Tuần 1.

---

## 📌 1. BẢNG TRA CỨU NHANH THÔNG SỐ KẾT NỐI (CHEATSHEET)

Mỗi khi cần mở giao diện quản trị Database hoặc kết nối code, hãy mở bảng này:

| Thông số | Giá trị | Giải thích |
|---|---|---|
| **URL Giao diện Web** | `http://localhost:8080` | Mở bằng trình duyệt Chrome/Edge (Adminer GUI) |
| **System** | `PostgreSQL` | Chọn trong dropdown của Adminer (mặc định hay là MySQL) |
| **Server** *(Khi dùng Adminer)* | `postgres` | **Tên service** trong Docker network nội bộ (xem mục 3) |
| **Server** *(Khi dùng code Node/DBeaver)* | `localhost` hoặc `127.0.0.1` | Vì truy cập từ ngoài máy tính của bạn vào |
| **Port** | `5432` | Cổng mặc định của PostgreSQL |
| **Username** | `postgres` | Tài khoản superuser mặc định |
| **Password** | `postgres_dev_password` | Mật khẩu dev đang ghi trong Compose; `.env.example` phải khớp cấu hình này |
| **Database Name** | `sentia_hub_db` | Tên cơ sở dữ liệu của dự án |

---

## 🧠 2. BÀI HỌC KINH NGHIỆM: ẢO HÓA (VIRTUALIZATION) & WSL 2

Ví dụ sự cố môi trường Windows khi dùng Docker Desktop với WSL 2 backend:

```
[Phần cứng CPU]              ➔ [Hệ điều hành Windows]         ➔ [Ứng dụng Docker]
Intel VT-x / AMD-V              WSL 2 Subsystem                  Docker Desktop
(Bật trong BIOS Mainboard)      (Lệnh: wsl --install)            (Chạy mượt mà)
```

- **Sự cố vừa gặp:** Task Manager báo `Virtualization: Enabled` (phần cứng đã sẵn sàng), nhưng Docker vẫn báo `Virtualization support not detected`.
- **Bản chất nguyên nhân:** Với Linux containers và WSL 2 backend, Docker Desktop sử dụng môi trường Linux do WSL 2 cung cấp. CPU bật ảo hóa chưa đủ; cần kiểm tra cài đặt WSL và các Windows features liên quan. Docker Desktop còn có Hyper-V backend; không thể kết luận mọi lỗi ảo hóa đều do thiếu WSL.
- **Câu lệnh thần thánh để sửa:**
  ```powershell
  wsl --install --no-distribution
  ```
  *(Cờ `--no-distribution` giúp cài nhân WSL 2 nhẹ nhất có thể mà không bị ép tải bản Ubuntu 1GB về máy).*

---

## 🔌 3. BÍ MẬT CONTAINER NETWORKING: TẠI SAO LẠI LÀ `postgres` MÀ KHÔNG PHẢI `localhost`?

Khi đăng nhập trên Adminer (`http://localhost:8080`), nhiều bạn hay gõ Server là `localhost` và bị báo lỗi **Connection Refused**. Tại sao?

```
┌──────────────────────── MÁY TÍNH CỦA BẠN (HOST) ────────────────────────┐
│                                                                          │
│  Trình duyệt Chrome (gõ http://localhost:8080)                           │
│                                │                                         │
│                      ┌─────────┴─────────────────────────┐               │
│                      │ DOCKER BRIDGE NETWORK NỘI BỘ      │               │
│                      │                                   │               │
│                      │   [Container Adminer]             │               │
│                      │          │                        │               │
│                      │          │ (gọi tên "postgres")   │               │
│                      │          ▼                        │               │
│                      │   [Container PostgreSQL]          │               │
│                      │   (Service name: postgres)        │               │
│                      └───────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────────────┘
```

1. **Từ máy bạn (Host) gọi vào:** Bạn gõ `localhost:8080` (trình duyệt) hoặc kết nối Node.js `localhost:5432` vì cổng đã được **Map (chuyển tiếp)** ra ngoài máy tính.
2. **Từ Adminer gọi sang PostgreSQL:** Cả 2 container nằm chung một **mạng riêng Docker**. Trong mạng riêng này, `localhost` của Adminer chính là... bản thân cái Adminer! Muốn nói chuyện với PostgreSQL, Adminer phải gọi theo **tên Service** được đặt trong file docker-compose: chính là chữ **`postgres`**!

---

## ✨ 4. "PHÉP MÀU" TỰ ĐỘNG CHẠY SQL (`/docker-entrypoint-initdb.d/`)

Hãy nhìn lại 2 dòng này trong file cấu hình `docker-compose.dev.yml`:

```yaml
volumes:
  - ../sql/01_schema.sql:/docker-entrypoint-initdb.d/01_schema.sql:ro
  - ../sql/02_indexes.sql:/docker-entrypoint-initdb.d/02_indexes.sql:ro
```

- **Nguyên lý hoạt động:** Image chính thức của PostgreSQL được lập trình sẵn một quy tắc: *Mỗi khi container được khởi tạo lần đầu tiên với volume trống, nó sẽ tự động xử lý các file init được hỗ trợ (như `.sql`, `.sh`) trong `/docker-entrypoint-initdb.d/` theo thứ tự tên file.*
- **Lợi ích:** Bạn không cần phải mở giao diện lên rồi paste từng dòng lệnh SQL bằng tay. Chỉ cần `docker compose -f docker/docker-compose.dev.yml up -d`, toàn bộ 9 bảng nghiệp vụ và các Index đã được tạo sẵn trong nháy mắt!

---

## ⚠️ 5. XỬ LÝ SỰ CỐ: XUNG ĐỘT CỔNG (PORT COLLISION)

- **Hiện tượng:** Khi chạy `docker compose up`, terminal báo lỗi:  
  `Bind for 0.0.0.0:8080 failed: port is already allocated`.
- **Nguyên nhân:** Cổng `8080` (hoặc `5432`) đang bị một ứng dụng khác chiếm dụng (ví dụ: container tutorial cũ của Docker, hoặc một dịch vụ Oracle/Tomcat đang chạy ngầm).
- **Cách xử lý chuẩn:**
  1. Kiểm tra xem container nào đang chạy:
     ```bash
     docker ps
     ```
  2. Dừng và xóa container chiếm cổng:
     ```bash
     docker stop <ID_hoặc_Tên_container>
     docker rm <ID_hoặc_Tên_container>
     ```

---

## 🛡️ 6. 4 LỆNH DOCKER THỰC CHIẾN NẰM LÒNG

| Lệnh | Khi nào dùng? |
|---|---|
| `docker compose -f docker/docker-compose.dev.yml up -d` | **Mỗi sáng bắt đầu code:** Bật hệ thống DB lên |
| `docker compose -f docker/docker-compose.dev.yml down` | **Tối hết giờ làm:** Tắt container để giải phóng RAM cho máy (Dữ liệu vẫn còn nguyên) |
| `docker compose -f docker/docker-compose.dev.yml ps` | **Khi code báo lỗi mất kết nối DB:** Kiểm tra xem container có đang `Up` không |
| `docker compose -f docker/docker-compose.dev.yml down -v` | ⚠️ **Khi muốn RESET DB về số 0:** Xóa sạch volume dữ liệu cũ để nạp lại từ đầu |

Nguồn: [Docker Desktop WSL 2 backend](https://docs.docker.com/desktop/features/wsl/), [Postgres image initialization](https://hub.docker.com/_/postgres). Init scripts chỉ chạy khi data directory trống; sửa file SQL không tự cập nhật volume đã tồn tại. Các giá trị dev trong bảng trên không tự đổi chỉ bằng sửa `.env` khi Compose đang ghi cứng chúng.
