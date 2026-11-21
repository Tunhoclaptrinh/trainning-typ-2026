# 03 — RabbitMQ: kiến trúc và Docker

## Thành phần

Producer tạo message; exchange chọn queues theo bindings/routing key. Queue giữ
message chờ consumer. Consumer nhận delivery, xử lý và ack. Connection là kết nối
AMQP, channel là kênh logic trong connection; delivery tag thuộc channel đã giao nó.
Ack trên channel khác hoặc ack hai lần có thể làm channel lỗi.

Publisher confirm và consumer ack là hai phía khác nhau. Confirm không chờ consumer
hoàn thành; HTTP response của register cũng không chờ email.

## Topology đã triển khai

Topology (sơ đồ cách các thành phần của RabbitMQ được nối với nhau) dưới đây
phục vụ luồng gửi email chào mừng sau khi người dùng đăng ký. Tên `erusentia`
chỉ là ví dụ cho namespace (tiền tố dùng để phân biệt môi trường); tên thực tế
phụ thuộc cấu hình `QUEUE_NAMESPACE`.

| Thành phần | Chức năng |
|---|---|
| `erusentia.events` | Durable topic exchange (điểm nhận và định tuyến message theo routing key; cấu hình exchange được giữ khi broker khởi động lại). |
| `erusentia.welcome` | Durable quorum queue (hàng đợi công việc chào mừng, dùng cơ chế quorum của RabbitMQ và giữ cấu hình khi broker khởi động lại); binding `user.registered.v1` (quy tắc nối queue với exchange để nhận sự kiện đăng ký có routing key này). |
| `erusentia.welcome.retry` | Quorum retry queue (hàng đợi cho message cần thử lại); TTL (thời gian message chờ trong queue) hết thì DLX chuyển message về `erusentia.events` (để định tuyến lại vào hàng đợi công việc). |
| `erusentia.dead` | Direct dead-letter exchange — DLX (điểm định tuyến message bị loại theo routing key khớp chính xác); work queue dùng nó khi vượt delivery limit (giới hạn số lần broker giao lại theo cấu hình). |
| `erusentia.welcome.dead` | Quorum dead-letter queue — DLQ (hàng đợi giữ message thất bại để kiểm tra); replay có kiểm soát (chỉ gửi xử lý lại sau khi xem nguyên nhân, giữ event ID và tuân theo quy trình). |

**Ví dụ dễ hình dung:** người dùng đăng ký → sự kiện `user.registered.v1` được
gửi tới `erusentia.events` → binding đưa message vào `erusentia.welcome` → worker
(tiến trình xử lý nền) lấy message và gửi email. Nếu gặp lỗi tạm thời, worker
chuyển message sang `erusentia.welcome.retry`; sau thời gian chờ, message được
đưa về exchange để thử lại. Nếu lỗi không thể xử lý hoặc hết số lần thử theo
chính sách, message được đưa vào `erusentia.welcome.dead` để điều tra.

Retry do worker thực hiện và delivery limit do broker theo dõi là **hai bộ đếm
khác nhau**. Chi tiết từng trường hợp nằm trong [bài 05](05_ack_retry_dlq.md).

Tên bắt đầu bằng QUEUE_NAMESPACE, giúp test/demo không chạm queue của người dùng.
Worker dùng amqplib trực tiếp để điều khiển mandatory, confirm, retry và ack rõ ràng;
API vẫn NestJS/TypeORM, không thay framework hoặc thêm backend trong TYP.

## Vì sao RabbitMQ?

RabbitMQ phù hợp task queue, routing và ack/retry của use case welcome. Kafka mạnh
ở event log, replay và xử lý luồng/partition nhưng thêm bài toán retention/offset/
consumer group. “Kafka production, RabbitMQ chỉ demo” là kết luận sai; lựa chọn phụ
thuộc nghiệp vụ và vận hành. Bài chọn một broker, không triển khai cả hai.

## Docker local

Compose queue riêng dùng RabbitMQ 4.4.0-management và Mailpit v1.32.0. AMQP 5672,
management 15672, SMTP 1025 và mailbox 8025 chỉ bind 127.0.0.1. RabbitMQ có volume;
Mailpit hiện không cấu hình volume, mailbox có thể mất khi recreate container.

Quorum queue trên một node local vẫn chỉ có một bản sao: chưa có HA. Persistent
message + durable queue + volume không chống mọi lỗi mất ổ đĩa hoặc xóa volume.
Không dùng docker compose --remove-orphans vì stack PostgreSQL hiện tại được giữ.

## Quan sát

Ready là message chờ giao; Unacked là đã giao nhưng chưa ack; Consumers là số
consumer đăng ký. Queue Ready=0 không chứng minh email thành công: còn Unacked,
retry hoặc DLQ. Phải đối chiếu ledger/SMTP và đúng event ID.

Nguồn: [RabbitMQ queues](https://www.rabbitmq.com/docs/queues),
[quorum queues](https://www.rabbitmq.com/docs/quorum-queues),
[Mailpit Docker](https://mailpit.axllent.org/docs/install/docker/).

[Trước](02_queue_and_pubsub.md) · [Tiếp: outbox](04_outbox_and_registration.md)
