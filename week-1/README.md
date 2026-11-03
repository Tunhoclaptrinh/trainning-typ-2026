# Tuần 1: Kiến thức về Cơ sở dữ liệu và Lập trình hướng đối tượng

---

## Phần 1: Database (CSDL quan hệ)

### 1. Cài đặt DBMS
- MySQL hoặc PostgreSQL
- Cài đặt qua Docker Container, XAMPP, hoặc cloud (Supabase, PlanetScale,...)

### 2. SQL cơ bản
- Tạo 1 CSDL cho bài toán cụ thể (quản lý giải đấu, quản lý thư viện,...)
- DDL: CREATE TABLE, ALTER TABLE, DROP TABLE
- DML: SELECT, INSERT, UPDATE, DELETE
- Query: WHERE, JOIN (INNER, LEFT, RIGHT), GROUP BY, HAVING, ORDER BY
- Aggregate functions: COUNT, SUM, AVG, MIN, MAX

### 3. Index
- Index là gì? Tại sao cần?
- Khi nào nên đánh index, khi nào không nên?
- Thực hành: tạo index, so sánh tốc độ query trước và sau khi đánh index

### 4. Phân trang (Pagination)
- Tại sao cần phân trang?
- Offset-based pagination: `LIMIT` + `OFFSET`
- Cursor-based pagination: `WHERE id > last_id LIMIT N`
- Ưu nhược điểm và trường hợp sử dụng của từng cách

### 5. Locking trong Database
- Tại sao cần lock?
- Optimistic Locking
- Pessimistic Locking
- So sánh: khi nào dùng cái nào?
- Demo: chạy 2 transaction đồng thời để thấy lock hoạt động

### 6. Transaction
- Transaction là gì?
- Khi nào cần gom nhiều thao tác vào 1 transaction?
- COMMIT, ROLLBACK
- Ví dụ: chuyển tiền — trừ tài khoản A + cộng tài khoản B phải thành công cùng nhau, fail thì rollback cả hai

---

## Phần 2: OOP

### 1. OOP trong Java
- Các tính chất: Encapsulation, Inheritance, Polymorphism, Abstraction
- Class, Abstract Class, Interface — khi nào dùng cái nào?

### 2. Dependency Injection (DI) & Inversion of Control (IoC)
- Khái niệm, ví dụ bằng Java thuần (không dùng framework)
- Tại sao DI giúp code dễ test, dễ thay đổi?
- Tìm hiểu thêm: DI/IoC được ứng dụng thế nào trong Spring

---

## Output

- Trình bày lý thuyết
- Database có dữ liệu mẫu, chạy được các query (JOIN, GROUP BY)
- Demo được sự khác nhau giữa có index và không có index
- Demo được locking: chạy 2 transaction đồng thời, cho thấy lock hoạt động
