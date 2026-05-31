# PROJECT2 - Yêu cầu đồ án cho AI Agent

> Nguồn: `PROJECT2_VI(1).pdf` - CSC11006, Nhập môn Điện toán đám mây.  
> Mục tiêu của file này: gom toàn bộ yêu cầu đồ án thành một bản Markdown rõ ràng, có cấu trúc, để AI coding/deployment agent có thể đọc và triển khai theo checklist.

---

## 0. Agent Brief

Xây dựng ứng dụng web **Quản lý Công việc / Task Manager** trên AWS theo kiến trúc **100% serverless**, có frontend riêng tư qua **S3 private + CloudFront OAC**, backend **API Gateway REST API + 4 Lambda riêng biệt**, dữ liệu trong **DynamoDB**, xác thực bằng **Amazon Cognito**, Lambda chạy trong **Custom VPC private subnets** và truy cập DynamoDB qua **VPC Gateway Endpoint**, không dùng NAT Gateway, không dùng EC2, không để S3 public, không dùng CORS wildcard.

### 0.1 Kết quả cần đạt

- Frontend hoạt động qua URL CloudFront.
- Có Login / Sign Up bằng Cognito.
- CRUD công việc hoạt động đầy đủ: tạo, xem, cập nhật, xóa.
- Có lọc công việc theo ngày hết hạn và mức ưu tiên.
- API được bảo vệ bằng Cognito JWT token.
- Dữ liệu lưu bền vững trong DynamoDB giữa các request.
- Có CloudWatch Dashboard, CloudWatch Alarms, SNS email notification.
- Có AWS Budget giới hạn 0.01 USD/tháng.
- Có đủ bằng chứng SE/NE/IM/CO, log, cost, monitoring, kiến trúc, source code, README, báo cáo.

### 0.2 Ràng buộc bắt buộc, không được vi phạm

- Không dùng EC2 hoặc máy ảo.
- Không tạo hoặc sử dụng NAT Gateway.
- Không bật Static Website Hosting trên S3.
- Không để S3 bucket public.
- Không cho truy cập file frontend trực tiếp qua URL S3.
- Không gộp CRUD vào một Lambda duy nhất.
- Không dùng HTTP API; phải dùng API Gateway **REST API**.
- Không dùng `Access-Control-Allow-Origin: *`.
- Không dùng IAM wildcard `*` cho action/resource nhạy cảm.
- Không dùng một IAM Role chung cho nhiều Lambda nếu điều đó làm trái yêu cầu role riêng.
- Không bỏ qua Cognito Authorizer.
- Nếu dùng GenAI hỗ trợ, phải nộp lịch sử prompt hoặc screenshot chat.

---

## 1. Thông tin chung

| Trường | Chi tiết |
|---|---|
| Mã đồ án | PROJECT2 |
| Môn học | CSC11006 - Nhập môn Điện toán đám mây |
| Tên đồ án | Xây dựng Ứng dụng Web Serverless với Kiến trúc bảo mật & Tối ưu chi phí |
| Thời gian | Dự kiến 3 tuần |
| Nhóm | Nhóm 3 sinh viên |
| Hạn nộp | Xem lịch Moodles |

---

## 2. Mục tiêu học tập

Đồ án hướng đến các kết quả học tập: **G2.1, G2.2, G2.3, G2.4, G3.1, G5.2, G5.3**.

Sinh viên cần chứng minh khả năng:

- Thiết kế hệ thống điện toán đám mây sử dụng các dịch vụ serverless có quản lý.
- Triển khai bảo mật theo nguyên tắc **Least Privilege** và cô lập mạng.
- Cấu hình giám sát, cảnh báo và quản lý chi phí.
- Xây dựng và triển khai ứng dụng web hoàn chỉnh trên nền tảng điện toán đám mây.
- Giải thích kiến trúc hệ thống, luồng yêu cầu và cơ chế tự động mở rộng.

---

## 3. Mô tả đồ án

Sinh viên thiết kế và triển khai ứng dụng web **Quản lý Công việc** sử dụng kiến trúc serverless hiện đại trên AWS.

Hệ thống phải thể hiện:

- Khả năng tự mở rộng.
- Bảo mật nhiều lớp.
- Kết nối cơ sở dữ liệu hoàn toàn qua mạng riêng của AWS, không đi qua internet công cộng.

### 3.1 Mục tiêu cốt lõi

- **100% kiến trúc serverless** - không sử dụng máy ảo EC2.
- Tự động mở rộng dựa trên lưu lượng thực tế.
- **High Availability** theo thiết kế - không cần cấu hình failover thủ công.
- Cô lập mạng: Lambda phải kết nối DynamoDB qua **VPC Endpoint**, không qua internet.
- Bảo mật frontend: S3 bucket phải riêng tư, chỉ truy cập qua **CloudFront + OAC**.
- Tuân thủ chặt chẽ Free Tier / không phát sinh chi phí.
- Có khả năng quan sát đầy đủ và kiểm soát chi phí.

---

## 4. Yêu cầu kỹ thuật

# 4.1 Frontend

## 4.1.1 Công nghệ

- HTML.
- CSS.
- JavaScript.
- Không bắt buộc dùng frontend framework.

## 4.1.2 Tính năng frontend

Ứng dụng phải có:

- CRUD công việc:
  - Tạo công việc.
  - Xem danh sách công việc.
  - Cập nhật công việc.
  - Xóa công việc.
- Giao diện danh sách công việc responsive.
- Lọc công việc theo:
  - Ngày hết hạn / due date.
  - Mức ưu tiên / priority.
- Giao diện xác thực:
  - Login.
  - Sign Up.
- Sau khi đăng nhập, frontend phải lưu JWT token và gửi token trong mọi request đến API.

## 4.1.3 Lưu trữ frontend - yêu cầu bảo mật

### Không được làm

- S3 bucket không được cấu hình public.
- Không bật Static Website Hosting trên S3.
- Không để file frontend được truy cập trực tiếp qua URL S3 dạng:

```text
https://<bucket>.s3.amazonaws.com/index.html
```

### Bắt buộc làm

- S3 bucket phải private.
- Bật cả bốn tùy chọn **Block Public Access**.
- CloudFront phải là CDN duy nhất phục vụ frontend cho người dùng.
- Cấu hình **Origin Access Control (OAC)** để CloudFront đọc được file từ S3.
- Bucket Policy của S3 chỉ cho phép **CloudFront Service Principal** đọc object.

## 4.1.4 Bằng chứng bảo mật frontend

| ID | Mục bằng chứng | Cách thu thập | Thể thức chấp nhận |
|---|---|---|---|
| SE-1 | S3 Block Public Access bật | Chụp màn hình tab Permissions của S3 bucket cho thấy cả bốn checkbox được bật | Screenshot |
| SE-2 | Truy cập trực tiếp S3 bị từ chối | Mở trình duyệt hoặc chạy `curl` tới `https://<bucket>.s3.amazonaws.com/index.html` và ghi lại phản hồi `403 Forbidden` / `AccessDenied` | Screenshot hoặc curl output |
| SE-3 | Truy cập CloudFront thành công | Mở URL CloudFront `https://<id>.cloudfront.net` và ghi lại trang web hoạt động với HTTP status 200 | Screenshot |
| SE-4 | OAC gắn vào CloudFront | Screenshot trang Settings của CloudFront distribution cho thấy rõ `Origin access: Origin access control settings` và tên OAC | Screenshot |

---

# 4.2 Backend API

## 4.2.1 Ngôn ngữ

Chọn một trong hai:

- Node.js 20.x.
- Python 3.12.

## 4.2.2 API endpoints bắt buộc

| HTTP Method | Path | Mô tả |
|---|---|---|
| GET | `/tasks` | Lấy toàn bộ danh sách công việc |
| POST | `/tasks` | Tạo công việc mới |
| PUT | `/tasks/:id` | Cập nhật công việc theo ID |
| DELETE | `/tasks/:id` | Xóa công việc theo ID |

## 4.2.3 Kiến trúc compute

- Serverless compute: AWS Lambda.
- Hướng sự kiện: Lambda được kích hoạt bởi API Gateway.
- Stateless: mỗi request độc lập hoàn toàn; không lưu trạng thái trong Lambda.
- Tự mở rộng: Lambda tự động mở rộng, không cần cấu hình thêm.

## 4.2.4 Bốn Lambda function riêng biệt

| Lambda Function | Endpoint | HTTP Method | Chức năng |
|---|---|---|---|
| `GetTasksFunction` | `/tasks` | GET | Lấy danh sách công việc từ DynamoDB |
| `CreateTaskFunction` | `/tasks` | POST | Tạo công việc mới vào DynamoDB |
| `UpdateTaskFunction` | `/tasks/:id` | PUT | Cập nhật công việc theo ID trong DynamoDB |
| `DeleteTaskFunction` | `/tasks/:id` | DELETE | Xóa công việc theo ID khỏi DynamoDB |

### Ràng buộc quan trọng

- Mỗi Lambda Function phải được triển khai riêng biệt.
- Mỗi Lambda Function phải có IAM Role riêng theo yêu cầu đồ án.
- Mỗi Lambda Function phải được gắn vào API Gateway tương ứng.
- Không được gộp nhiều chức năng vào một Lambda duy nhất.

---

# 4.3 Mạng - Lambda kết nối DynamoDB

## 4.3.1 Thách thức mạng

Lambda cần đọc/ghi DynamoDB. Có hai cách:

### Cách 1 - sai trong đồ án này

Lambda gọi DynamoDB qua internet công cộng.

Hệ quả:

- Cần NAT Gateway nếu Lambda nằm trong private subnet.
- NAT Gateway tốn khoảng 32 USD/tháng.
- Vi phạm yêu cầu chi phí.

### Cách 2 - đúng và bắt buộc

Lambda gọi DynamoDB qua **VPC Gateway Endpoint**.

Đặc điểm:

- Traffic đi trên AWS private backbone.
- Không đi qua internet công cộng.
- Không cần NAT Gateway.
- Chi phí 0 USD cho Gateway Endpoint DynamoDB.

Đồ án bắt buộc dùng cách 2.

## 4.3.2 Custom VPC bắt buộc

Tạo Custom VPC và triển khai các Lambda function bên trong VPC đó.

| Thành phần | Cấu hình yêu cầu | Mục đích |
|---|---|---|
| Custom VPC | CIDR `10.0.0.0/16` | Mạng ảo riêng để cô lập compute |
| Private Subnet AZ-1 | Ví dụ `10.0.1.0/24` tại `ap-southeast-1a` | Đặt Lambda functions vào subnet này |
| Private Subnet AZ-2 | Ví dụ `10.0.2.0/24` tại `ap-southeast-1b` | Đảm bảo High Availability trên hai AZ |
| VPC Gateway Endpoint | Tạo endpoint DynamoDB và liên kết với Route Table | Cho phép Lambda kết nối DynamoDB qua mạng riêng |
| Lambda Security Group | Outbound chỉ cho phép port 443 tới DynamoDB Prefix List | Ngăn Lambda truy cập internet công cộng |
| Route Table entry | Destination `pl-xxxxxx` DynamoDB Prefix List -> Target `vpce-xxxxxxxx` | Hướng traffic DynamoDB qua Endpoint |

## 4.3.3 Gắn Lambda vào VPC

Khi tạo mỗi Lambda function, phải cấu hình `VpcConfig`.

Nếu không có `VpcConfig`:

- Lambda sẽ chạy ngoài Custom VPC.
- Lambda sẽ không sử dụng Endpoint đã tạo.
- Có thể mất điểm Networking dù VPC Endpoint tồn tại.

## 4.3.4 Cấm NAT Gateway

Không được tạo hoặc sử dụng NAT Gateway.

Lý do:

- NAT Gateway tính phí khoảng 0.045 USD/giờ, tương đương khoảng 32 USD/tháng dù không có traffic.
- Vi phạm quy tắc này bị điểm 0 cho cả Networking và Cost Efficiency.
- Giảng viên sẽ kiểm tra VPC console; bất kỳ NAT Gateway nào tìm thấy đều có thể dẫn đến mất điểm.

## 4.3.5 Bằng chứng Networking

| ID | Mục bằng chứng | Cách thu thập | Thể thức chấp nhận |
|---|---|---|---|
| NE-1 | VPC Endpoint tạo cho DynamoDB | Screenshot VPC > Endpoints cho thấy Service Name `com.amazonaws.<region>.dynamodb` và Status `Available` | Screenshot |
| NE-2 | Lambda có VpcConfig | Screenshot tab Configuration > VPC của Lambda function cho thấy Subnets và Security Group được gắn | Screenshot |
| NE-3 | Route table có Endpoint route | Screenshot Route Table của Private Subnet cho thấy dòng Destination = `pl-xxxxxx` DynamoDB Prefix List, Target = `vpce-xxxxxxxx` | Screenshot |
| NE-4 | Không có NAT Gateway | Screenshot VPC > NAT Gateways; danh sách phải trống hoặc tất cả entries đều có Status `Deleted` | Screenshot |
| NE-5 | Lambda gọi DynamoDB thành công | CloudWatch log của Lambda invocation cho thấy `StatusCode 200` trên DynamoDB call, không có lỗi `NetworkingError` hoặc `UnauthorizedAccess` | Screenshot log |

---

# 4.4 Cơ sở dữ liệu - Amazon DynamoDB

## 4.4.1 Yêu cầu chung

- Dùng Amazon DynamoDB.
- Loại cơ sở dữ liệu: NoSQL.
- DynamoDB có High Availability tích hợp sẵn: sao chép multi-AZ, không cần cấu hình thêm.
- Free Tier: 25 GB lưu trữ, 25 RCU / 25 WCU mỗi tháng, không hết hạn.
- Cơ sở dữ liệu phải có ít nhất **2 users** được khởi tạo sẵn để demo và kiểm thử, có thể thấy trong bảng DynamoDB khi kiểm tra.

## 4.4.2 Schema bảng Tasks

| Thuộc tính | Kiểu | Vai trò | Mô tả |
|---|---|---|---|
| `taskId` | String | Partition Key | UUID do Lambda tạo khi tạo công việc |
| `userId` | String | GSI partition key | ID của người dùng sở hữu công việc |
| `title` | String | Thuộc tính | Tiêu đề công việc |
| `description` | String | Thuộc tính | Chi tiết công việc, tùy chọn |
| `priority` | String | Thuộc tính | Giá trị: `low`, `medium`, `high` |
| `dueDate` | String | Thuộc tính | Định dạng ISO, ví dụ `2025-06-15` |
| `status` | String | Thuộc tính | Giá trị: `pending`, `done` |
| `createdAt` | String | Thuộc tính | Timestamp ISO đặt lúc tạo |

## 4.4.3 Global Secondary Index

Tạo GSI để truy vấn hiệu quả tất cả công việc của một user.

| Cấu hình | Giá trị |
|---|---|
| Tên GSI | `userId-index` |
| GSI partition key | `userId` |
| Projection | `ALL` |

Lý do:

- Nếu không có GSI này, việc lấy công việc của user sẽ phải Scan toàn bộ bảng.
- Scan toàn bảng không hiệu quả và không đáp ứng yêu cầu thiết kế kiến trúc.

---

# 4.5 Bảo mật - IAM Least Privilege

## 4.5.1 Nguyên tắc

- Mỗi Lambda function phải có IAM Role riêng.
- Không được dùng chung một role cho nhiều Lambda function.
- Policy phải theo nguyên tắc Least Privilege.
- Không dùng wildcard `*` cho action hoặc resource nếu yêu cầu ARN cụ thể.
- Quyền DynamoDB chỉ được cấp trên ARN của bảng `TasksTable`.

> Ghi chú cho agent: PDF có bảng bằng chứng IM-1 ghi “Hai IAM Role riêng biệt”, nhưng phần mô tả backend và IAM lại yêu cầu mỗi Lambda Function có IAM Role riêng. Để an toàn khi triển khai, nên tạo role riêng cho từng Lambda hoặc tối thiểu đảm bảo không vi phạm yêu cầu “không dùng chung role cho nhiều Lambda”.

## 4.5.2 Quyền IAM theo tài liệu

| IAM Role | Lambda | Hành động được phép | Nghiêm cấm |
|---|---|---|---|
| `LambdaTaskRole` | Task Service | `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Query`, `dynamodb:Scan` chỉ trên ARN của `TasksTable`; `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`; `ec2:CreateNetworkInterface`, `ec2:DescribeNetworkInterfaces`, `ec2:DeleteNetworkInterface` khi gắn VPC | Wildcard `*` cho action hoặc resource; truy cập bất kỳ bảng nào khác ngoài `TasksTable` |
| `LambdaBaseRole` | Các Lambda khác | `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`; `ec2:CreateNetworkInterface`, `ec2:DescribeNetworkInterfaces`, `ec2:DeleteNetworkInterface` | Bất kỳ quyền truy cập DynamoDB |

## 4.5.3 Bằng chứng IAM

| ID | Mục bằng chứng | Cách thu thập |
|---|---|---|
| IM-1 | Hai IAM Role riêng biệt | Screenshot IAM > Roles được lọc theo tên dự án, hiển thị hai role riêng biệt |
| IM-2 | Policy chỉ rõ ARN resource cụ thể | Mở Inline Policy hoặc JSON của mỗi Role và chụp trường `Resource`; phải hiển thị ARN bảng DynamoDB cụ thể, không phải `*` |
| IM-3 | Lambda gắn với Role đúng | Screenshot tab Configuration > Permissions của mỗi Lambda function cho thấy tên Role đúng |

---

# 4.6 Bảo mật truy cập Web App - Amazon Cognito

## 4.6.1 Yêu cầu Cognito

- Tạo Cognito User Pool để quản lý tài khoản người dùng.
- Tạo Cognito App Client để frontend có thể xác thực.
- Tích hợp Cognito Authorizer vào API Gateway.
- Mọi request đến các endpoint `/tasks` phải đính kèm JWT token hợp lệ.
- Frontend phải có giao diện Login và Sign Up sử dụng Cognito.
- Sau khi đăng nhập, frontend lưu JWT token và gửi kèm vào mọi lời gọi API.
- Người dùng chưa đăng nhập sẽ nhận phản hồi `401 Unauthorized` khi truy cập API.

## 4.6.2 Bằng chứng Cognito

| ID | Mục bằng chứng | Cách thu thập | Thể thức chấp nhận |
|---|---|---|---|
| CO-1 | Cognito User Pool đã tạo | Screenshot trang Cognito > User Pools cho thấy tên Pool và Pool ID | Screenshot |
| CO-2 | API Gateway Authorizer được cấu hình | Screenshot API Gateway > Authorizers cho thấy Cognito Authorizer liên kết với User Pool | Screenshot |
| CO-3 | Truy cập API không có token bị từ chối | Chạy `curl` gọi API không kèm Authorization header; phải nhận phản hồi `401 Unauthorized` | Screenshot/curl |
| CO-4 | Truy cập API với token hợp lệ thành công | Chạy `curl` gọi API kèm JWT token hợp lệ; phải nhận phản hồi `200 OK` với dữ liệu | Screenshot/curl |

---

# 4.7 API Gateway - Định tuyến và bảo mật

## 4.7.1 Cấu hình bắt buộc

- Loại API: **REST API**.
- Không sử dụng HTTP API cho dự án này.
- Deployment stage: `prod`.
- HTTPS bật theo mặc định; API Gateway tự động cấp SSL certificate.

## 4.7.2 Throttling

| Tham số | Giá trị khợi đề nghị | Lý do |
|---|---:|---|
| Rate | 100 req/s | Giới hạn thông lượng yêu cầu mỗi người dùng |
| Burst | 50 | Số yêu cầu đồng thời tối đa được phép |
| Lambda Reserved Concurrency | Sinh viên cần tìm hiểu giá trị có thể thiết lập | Cần giải thích Reserved Concurrency là gì, giá trị phù hợp Free Tier, ảnh hưởng khi đặt quá thấp/quá cao, và ghi rõ giá trị đã chọn trong báo cáo |

## 4.7.3 CORS

- `Access-Control-Allow-Origin` phải được đặt thành **CloudFront domain** của nhóm.
- Ví dụ:

```http
Access-Control-Allow-Origin: https://d1abc123.cloudfront.net
```

- Không được đặt là `*`.
- CORS wildcard sẽ bị trừ điểm.

---

# 4.8 Giám sát và quản lý chi phí

## 4.8.1 CloudWatch Dashboard

Tạo CloudWatch Dashboard tên:

```text
TaskManager-Dashboard
```

Dashboard phải có ít nhất 5 widget. Tài liệu liệt kê các widget sau:

| Widget | Metric | Namespace | Mục đích |
|---|---|---|---|
| Invocations | `Invocations` | `AWS/Lambda` | Tổng số request |
| Duration | `Duration` P50, P99 | `AWS/Lambda` | Thời gian thực thi Lambda |
| Errors | `Errors` | `AWS/Lambda` | Lỗi mức function |
| Throttles | `Throttles` | `AWS/Lambda` | Request bị giới hạn bởi concurrency cap |
| API Latency | `Latency` | `AWS/ApiGateway` | Thời gian phản hồi toàn trình |
| 4xx / 5xx | `4XXError`, `5XXError` | `AWS/ApiGateway` | Tỷ lệ lỗi client và server |

## 4.8.2 CloudWatch Alarms bắt buộc

| Tên Alarm | Điều kiện | Hành động |
|---|---|---|
| `Lambda-Error-Alarm` | Lambda Errors > 10 trong 5 phút | Gửi email qua SNS |
| `API-5xx-Alarm` | API Gateway 5XXError > 5 trong 5 phút | Gửi email qua SNS |

## 4.8.3 Bằng chứng log

| Log | Nội dung yêu cầu | Vị trí log group |
|---|---|---|
| Request thành công | Log hiển thị dòng `REPORT` với `StatusCode 200`, `Duration`, `Billed Duration`, `Memory Used` | `/aws/lambda/<function-name>` |
| Request lỗi | Log hiển thị lỗi `ERROR` hoặc stack trace do gửi input không hợp lệ, ví dụ thiếu trường bắt buộc | `/aws/lambda/<function-name>` |

## 4.8.4 Kiểm soát chi phí

- Tạo AWS Budget với giới hạn **0.01 USD mỗi tháng**.
- Cấu hình cảnh báo tại:
  - 80% = 0.008 USD.
  - 100% = 0.01 USD.
- Cả hai cảnh báo phải gửi thông báo email.
- Tìm hiểu và thiết lập Lambda Reserved Concurrency phù hợp.
- Ghi rõ giá trị Reserved Concurrency đã chọn và lý do trong báo cáo.
- Áp dụng API Gateway throttling theo mục 4.7.2.

---

## 5. Sản phẩm nộp

# 5.1 Ứng dụng web

Ứng dụng nộp phải thỏa mãn:

- Frontend truy cập được qua URL CloudFront.
- Backend API trả về phản hồi JSON chính xác.
- Tất cả bốn endpoint CRUD hoạt động đúng.
- Tích hợp cơ sở dữ liệu được xác minh; dữ liệu tồn tại trong DynamoDB giữa các request.
- Chức năng xác thực người dùng qua Cognito hoạt động đúng: Login / Sign Up.

---

# 5.2 Sơ đồ kiến trúc

Sơ đồ có thể vẽ bằng bất kỳ công cụ nào:

- draw.io.
- Lucidchart.
- Vẽ tay.
- Công cụ khác.

Sơ đồ phải hiển thị rõ tất cả thành phần sau:

| Tầng | Thành phần yêu cầu |
|---|---|
| Edge | CloudFront + OAC + S3 riêng tư |
| API | API Gateway -> kích hoạt Lambda |
| Compute (VPC) | Lambda có VpcConfig bên trong Private Subnets, 4 functions riêng biệt |
| Network | VPC Gateway Endpoint cho DynamoDB |
| Database | DynamoDB với ít nhất 2 users |
| Bảo mật | IAM roles riêng biệt; Cognito User Pool + Authorizer |
| Giám sát | CloudWatch + SNS alarms |
| Chi phí | AWS Budgets |

---

# 5.3 Bằng chứng bảo mật cần nộp

Có thể tổng hợp thành PDF hoặc thư mục chứa file PNG/JPG.

| ID | Mục bằng chứng | Hạng mục Rubric |
|---|---|---|
| SE-1 | S3 Block Public Access - bốn tùy chọn đều bật | Triển khai Đám mây |
| SE-2 | Truy cập trực tiếp S3 trả về `403 Forbidden` | Triển khai Đám mây |
| SE-3 | Truy cập CloudFront trả về `200 OK` | Triển khai Đám mây |
| SE-4 | OAC gắn vào CloudFront distribution | Triển khai Đám mây |
| CO-1 | Cognito User Pool đã tạo | Triển khai Đám mây / Bảo mật |
| CO-2 | API Gateway Cognito Authorizer được cấu hình | Triển khai Đám mây / Bảo mật |
| CO-3 | Truy cập API không có token trả về `401 Unauthorized` | Triển khai Đám mây / Bảo mật |
| CO-4 | Truy cập API với token hợp lệ thành công | Triển khai Đám mây / Bảo mật |
| NE-1 | VPC Endpoint cho DynamoDB - Status `Available` | Hiểu biết Kiến trúc |
| NE-2 | Lambda VpcConfig - Subnets và Security Group gắn | Hiểu biết Kiến trúc |
| NE-3 | Route Table - dòng `pl-xxx -> vpce-xxx` hiện diện | Hiểu biết Kiến trúc |
| NE-4 | Không có NAT Gateway, danh sách trống hoặc toàn bộ Deleted | Hiệu quả Chi phí |
| NE-5 | CloudWatch log: Lambda gọi DynamoDB thành công | Giám sát |
| IM-1 | Hai IAM Roles riêng biệt với tên phân biệt | Triển khai Đám mây |
| IM-2 | Policy JSON với ARN bảng DynamoDB cụ thể làm Resource | Triển khai Đám mây |
| IM-3 | Mỗi Lambda gắn với Role đúng | Triển khai Đám mây |

---

# 5.4 Monitoring Dashboard

Cần nộp:

- Screenshot CloudWatch Dashboard cho thấy ít nhất 5 widget với dữ liệu thực.
- Screenshot 2 alarm đã tạo, trạng thái OK hoặc ALARM đều được chấp nhận.
- Screenshot trang cấu hình AWS Budget.

---

# 5.5 Báo cáo chi phí

Cần nộp:

- Screenshot AWS Cost Explorer hoặc Billing Dashboard.
- Chứng minh tổng chi phí <= 0.01 USD trong suốt thời gian dự án.
- Nếu có phát sinh chi phí, giải thích lý do và mô tả biện pháp khắc phục.

---

# 5.6 Tài liệu kỹ thuật

Báo cáo kỹ thuật phải giải thích rõ bốn khái niệm sau. Giảng viên sẽ hỏi trực tiếp trong buổi bảo vệ.

| Khái niệm | Nội dung phải giải thích | Tỷ trọng gần đúng |
|---|---|---:|
| Luồng request | Mô tả từng bước từ khi người dùng nhấn “Tạo công việc” đến khi nhận phản hồi: Trình duyệt -> CloudFront tài sản tĩnh hoặc API Gateway -> Lambda -> VPC Endpoint -> DynamoDB -> phản hồi | ~8% |
| Tự mở rộng Serverless | Giải thích Lambda mở rộng từ 0 đến N instance đồng thời. Mô tả API Gateway hoạt động như load balancer tự nhiên. Giải thích tại sao không cần ALB | ~6% |
| CDN và OAC | Giải thích CloudFront caching hoạt động thế nào, cache HIT vs MISS. Định nghĩa OAC và lý do cần thiết. Giải thích tại sao S3 phải riêng tư | ~4% |
| VPC Endpoint | Giải thích tại sao Lambda bên trong Private Subnet cần VPC Endpoint để kết nối DynamoDB. Mô tả đường đi traffic qua AWS private backbone. So sánh với NAT Gateway về chi phí và bảo mật | ~4% |

---

# 5.7 Source code

Cần nộp:

- Frontend: HTML, CSS, JavaScript.
- Backend: Node.js hoặc Python.
- Đủ bốn CRUD handler tương ứng với bốn Lambda function riêng biệt.
- Nếu dùng IaC: nộp kèm CloudFormation hoặc AWS SAM template source code.
- README mô tả cách chạy local và cách deploy lên AWS.

---

## 6. Rubric đánh giá

| Hạng mục | Tỷ trọng | Yêu cầu để được điểm tối đa |
|---|---:|---|
| Chức năng | 20% | Tất cả bốn thao tác CRUD hoạt động đúng. Frontend, backend và DynamoDB tích hợp chính xác. Bộ lọc theo độ ưu tiên và ngày hết hạn hoạt động |
| Triển khai Đám mây | 25% | S3 private + CloudFront OAC xác minh SE-1 -> SE-4. Lambda trong VPC có Endpoint NE-1 -> NE-3. IAM Least Privilege với role riêng IM-1 -> IM-3. Cognito xác thực đúng CO-1 -> CO-4. API Gateway CORS chỉ cho phép CloudFront domain |
| Hiểu biết Kiến trúc | 20% | Sinh viên giải thích được toàn bộ luồng request. Hiểu VPC Endpoint và lý do thay thế NAT Gateway. Hiểu Lambda auto-scaling và vai trò load balancing của API Gateway. Hiểu CloudFront CDN caching và OAC |
| Giám sát | 10% | CloudWatch Dashboard với 5+ widget có dữ liệu thực. Hai alarm được tạo và cấu hình. Screenshot log thành công và log lỗi đã nộp NE-5. Cấu hình thông báo email SNS |
| Hiệu quả Chi phí | 15% | Không có NAT Gateway NE-4. Lambda concurrency được giới hạn phù hợp và ghi rõ giá trị/lý do. AWS Budget 0.01 được cấu hình. Tổng chi phí dự án = 0 hoặc gần 0 |
| Tài liệu | 10% | Báo cáo giải thích rõ cả bốn khái niệm. Sơ đồ kiến trúc đủ thành phần. Đủ 16 mục bằng chứng SE/NE/IM/CO. Nếu dùng GenAI, phải cung cấp lịch sử prompt đã sử dụng. Nếu dùng IaC, nộp kèm source code IaC |

Tổng: **100%**.

Thiếu bất kỳ mục bằng chứng bắt buộc sẽ bị trừ điểm trong hạng mục rubric tương ứng, dù hệ thống hoạt động đúng chức năng.

---

## 7. Tiến độ đồ án

| Tuần | Công việc chính | Kết quả dự kiến cuối tuần |
|---|---|---|
| Tuần 1 | Phát triển frontend và backend cục bộ | Frontend chạy được cục bộ. Cả bốn Lambda CRUD handler được viết và kiểm thử cục bộ với DynamoDB Local hoặc thư viện mock |
| Tuần 2 | Deploy hạ tầng đám mây và kết nối cơ sở dữ liệu | Custom VPC + 2 Private Subnets + VPC Endpoint tạo xong. Lambda deploy trong VPC. DynamoDB table và GSI tạo xong. API Gateway cấu hình CORS và throttling. CloudFront + OAC + S3 private sẵn sàng. Cognito User Pool và Authorizer cấu hình xong. Thu thập đủ bằng chứng NE-1 -> NE-5 |
| Tuần 3 | Kiểm thử, thiết lập giám sát, tài liệu và nộp bài | CloudWatch Dashboard + 2 Alarms + 2 log screenshot hoàn tất. AWS Budget cấu hình. Báo cáo chi phí sẵn sàng. Tài liệu được viết đầy đủ. Đủ 16 mục bằng chứng SE/NE/IM/CO được tổng hợp và nộp |

---

## 8. Lỗi thường gặp cần tránh

| Lỗi | Mô tả | Hậu quả |
|---|---|---|
| S3 public | Để bucket public hoặc bật Static Website Hosting | Mất toàn bộ điểm SE-1 -> SE-4 trong Triển khai |
| Dùng NAT Gateway | Tạo NAT Gateway để Lambda trong VPC kết nối internet | Mất toàn bộ điểm NE-4 và Hiệu quả Chi phí; phát sinh khoảng 32 USD/tháng |
| Lambda ngoài VPC | Tạo Lambda mà không cấu hình VpcConfig | Mất toàn bộ điểm NE-1 -> NE-3 dù VPC Endpoint đã tạo đúng |
| IAM Role chung | Dùng một Role cho nhiều Lambda hoặc dùng quyền wildcard | Mất toàn bộ điểm IM-1 -> IM-3 |
| CORS wildcard | Đặt `Access-Control-Allow-Origin: *` thay vì CloudFront domain cụ thể | Bị trừ điểm Triển khai/Bảo mật |
| Thiếu bằng chứng | Không chụp screenshot theo bảng SE/NE/IM/CO | Bị trừ điểm theo từng mục dù hệ thống hoạt động đúng |
| Không nộp prompt GenAI | Dùng GenAI hỗ trợ nhưng không cung cấp lịch sử prompt | Bị trừ điểm phần Tài liệu |

---

## 9. Checklist trước khi nộp

# 9.1 Frontend, S3, CloudFront

- [ ] S3 bucket: bốn tùy chọn Block Public Access = bật. `SE-1`
- [ ] Truy cập URL S3 trực tiếp trả về `403 Forbidden` hoặc `AccessDenied`. `SE-2`
- [ ] URL CloudFront trả về `200 OK` và frontend hoạt động. `SE-3`
- [ ] CloudFront distribution dùng OAC. `SE-4`
- [ ] Không bật Static Website Hosting trên S3.
- [ ] Bucket Policy chỉ cho CloudFront Service Principal đọc object.

# 9.2 API và Lambda

- [ ] API Gateway là REST API, stage `prod`.
- [ ] Có 4 endpoint: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`.
- [ ] Có 4 Lambda function riêng biệt.
- [ ] Lambda stateless, không lưu state nội bộ.
- [ ] API trả JSON đúng.
- [ ] Tất cả CRUD hoạt động đúng.

# 9.3 VPC và DynamoDB Endpoint

- [ ] Có Custom VPC CIDR `10.0.0.0/16`.
- [ ] Có 2 Private Subnets trên 2 AZ.
- [ ] VPC > Endpoints: DynamoDB endpoint có Status `Available`. `NE-1`
- [ ] Lambda > Configuration > VPC hiển thị Subnets và Security Group. `NE-2`
- [ ] Private Subnet Route Table có dòng `pl-xxx -> vpce-xxx`. `NE-3`
- [ ] VPC > NAT Gateways: danh sách trống hoặc tất cả Deleted. `NE-4`
- [ ] CloudWatch log cho thấy Lambda gọi DynamoDB thành công, không có NetworkError. `NE-5`

# 9.4 DynamoDB

- [ ] Có bảng `TasksTable` hoặc tên tương đương theo project.
- [ ] Partition key: `taskId` String.
- [ ] Có GSI `userId-index` với partition key `userId` và Projection `ALL`.
- [ ] Có ít nhất 2 users/demo users được khởi tạo sẵn.
- [ ] Dữ liệu tồn tại giữa các request.

# 9.5 IAM

- [ ] IAM có role riêng biệt theo yêu cầu, không dùng role chung trái yêu cầu. `IM-1`
- [ ] Policy dùng ARN bảng DynamoDB cụ thể, không phải `*`. `IM-2`
- [ ] Mỗi Lambda gắn với role đúng trong Configuration > Permissions. `IM-3`
- [ ] Lambda role có quyền CloudWatch Logs.
- [ ] Lambda trong VPC có quyền ENI: `ec2:CreateNetworkInterface`, `ec2:DescribeNetworkInterfaces`, `ec2:DeleteNetworkInterface`.

# 9.6 Cognito

- [ ] Tạo Cognito User Pool. `CO-1`
- [ ] Tạo App Client cho frontend.
- [ ] API Gateway có Cognito Authorizer liên kết User Pool. `CO-2`
- [ ] Gọi API không có token trả về `401 Unauthorized`. `CO-3`
- [ ] Gọi API có token hợp lệ trả về `200 OK`. `CO-4`
- [ ] Frontend có Login / Sign Up.
- [ ] Frontend lưu JWT token và gửi trong mọi API call.

# 9.7 CORS và throttling

- [ ] `Access-Control-Allow-Origin` chỉ là CloudFront domain.
- [ ] Không dùng CORS `*`.
- [ ] API Gateway throttling: Rate gợi ý 100 req/s.
- [ ] API Gateway throttling: Burst gợi ý 50.
- [ ] Có tìm hiểu và cấu hình Lambda Reserved Concurrency phù hợp.
- [ ] Báo cáo giải thích Reserved Concurrency, giá trị chọn, ảnh hưởng quá thấp/quá cao.

# 9.8 Monitoring và cost

- [ ] CloudWatch Dashboard `TaskManager-Dashboard` có ít nhất 5 widget với dữ liệu thực.
- [ ] Widget Lambda Invocations.
- [ ] Widget Lambda Duration P50/P99.
- [ ] Widget Lambda Errors.
- [ ] Widget Lambda Throttles.
- [ ] Widget API Gateway Latency.
- [ ] Widget API Gateway 4XX/5XX nếu triển khai đủ 6 widget.
- [ ] Tạo `Lambda-Error-Alarm`, Lambda Errors > 10 trong 5 phút, gửi email qua SNS.
- [ ] Tạo `API-5xx-Alarm`, API Gateway 5XXError > 5 trong 5 phút, gửi email qua SNS.
- [ ] Screenshot 2 alarm, trạng thái OK hoặc ALARM đều chấp nhận.
- [ ] Screenshot log request thành công.
- [ ] Screenshot log request lỗi.
- [ ] AWS Budget giới hạn 0.01 USD/tháng.
- [ ] Budget alert 80% = 0.008 USD gửi email.
- [ ] Budget alert 100% = 0.01 USD gửi email.
- [ ] Email subscription đã xác nhận.
- [ ] Screenshot Cost Explorer hoặc Billing Dashboard.
- [ ] Tổng chi phí <= 0.01 USD, hoặc có giải thích và biện pháp khắc phục.

# 9.9 Tài liệu và nộp bài

- [ ] Báo cáo giải thích luồng request.
- [ ] Báo cáo giải thích serverless auto-scaling.
- [ ] Báo cáo giải thích CDN và OAC.
- [ ] Báo cáo giải thích VPC Endpoint và so sánh NAT Gateway.
- [ ] Sơ đồ kiến trúc có CloudFront + OAC + S3 private.
- [ ] Sơ đồ có API Gateway -> 4 Lambda.
- [ ] Sơ đồ có Lambda trong VPC boundary, private subnets, VpcConfig.
- [ ] Sơ đồ có VPC Gateway Endpoint cho DynamoDB.
- [ ] Sơ đồ có DynamoDB và ít nhất 2 users/demo users.
- [ ] Sơ đồ có IAM roles.
- [ ] Sơ đồ có Cognito User Pool + Authorizer.
- [ ] Sơ đồ có CloudWatch + SNS alarms.
- [ ] Sơ đồ có AWS Budgets.
- [ ] Có README mô tả chạy local và deploy AWS.
- [ ] Có source code frontend.
- [ ] Có source code backend 4 handler.
- [ ] Nếu dùng IaC, có nộp source code CloudFormation/SAM.
- [ ] Nếu dùng GenAI, có nộp lịch sử prompt hoặc screenshot chat.
- [ ] Có link video demo cho trường hợp bảo vệ dự phòng.

---

## 10. Acceptance Criteria cho agent

Agent chỉ được xem là hoàn thành khi:

1. Repo có đầy đủ frontend, backend Lambda handlers, IaC/README nếu dùng IaC.
2. Frontend chạy local và có thể deploy lên S3 private.
3. Backend có 4 handler riêng biệt, mỗi handler map đúng endpoint.
4. API contract thống nhất giữa frontend và backend.
5. DynamoDB schema và GSI đúng yêu cầu.
6. Không có cấu hình NAT Gateway trong IaC hoặc hướng dẫn deploy.
7. Không có cấu hình S3 public hoặc Static Website Hosting.
8. Không có CORS wildcard trong production config.
9. Có Cognito login/signup và JWT Authorization header.
10. Có checklist bằng chứng để nhóm tick khi deploy thật.
11. Có phần README hướng dẫn local test, deploy, kiểm thử API có/không token.
12. Có phần báo cáo hoặc notes giải thích 4 khái niệm bảo vệ.

---

## 11. Gợi ý cấu trúc repo cho agent

```text
project2-task-manager/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── config.example.js
├── backend/
│   ├── functions/
│   │   ├── getTasks/
│   │   ├── createTask/
│   │   ├── updateTask/
│   │   └── deleteTask/
│   ├── shared/
│   │   ├── dynamodbClient.js hoặc dynamodb_client.py
│   │   ├── response.js hoặc response.py
│   │   └── validation.js hoặc validation.py
│   └── tests/
├── infra/
│   ├── template.yaml hoặc cloudformation.yaml
│   ├── deploy-notes.md
│   └── evidence-checklist.md
├── docs/
│   ├── architecture.md
│   ├── cost-report.md
│   ├── defense-notes.md
│   └── genai-prompts.md
└── README.md
```

---

## 12. Biến cấu hình cần điền khi triển khai

Agent/code nên dùng file config hoặc environment variables, không hard-code tùy tiện.

| Biến | Ý nghĩa |
|---|---|
| `AWS_REGION` | Region triển khai, ví dụ `ap-southeast-1` |
| `TASKS_TABLE_NAME` | Tên bảng DynamoDB |
| `USER_ID_INDEX_NAME` | Tên GSI, mặc định `userId-index` |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_APP_CLIENT_ID` | Cognito App Client ID |
| `API_BASE_URL` | URL API Gateway stage `prod` |
| `CLOUDFRONT_DOMAIN` | CloudFront domain cho frontend và CORS |
| `S3_BUCKET_NAME` | Bucket chứa frontend private |

---

## 13. API behavior đề xuất để thống nhất triển khai

> Phần này không thay thế yêu cầu PDF, chỉ chuẩn hóa contract cho agent khi code.

## 13.1 GET `/tasks`

- Yêu cầu JWT hợp lệ.
- Lấy `userId` từ Cognito claims nếu triển khai được.
- Query DynamoDB qua GSI `userId-index`.
- Trả về danh sách task của user.

Response 200:

```json
{
  "items": [
    {
      "taskId": "uuid",
      "userId": "user-id",
      "title": "Example task",
      "description": "Optional description",
      "priority": "medium",
      "dueDate": "2025-06-15",
      "status": "pending",
      "createdAt": "2025-06-01T10:00:00.000Z"
    }
  ]
}
```

## 13.2 POST `/tasks`

Request body:

```json
{
  "title": "Example task",
  "description": "Optional description",
  "priority": "medium",
  "dueDate": "2025-06-15",
  "status": "pending"
}
```

Validation:

- `title` bắt buộc.
- `priority` thuộc `low`, `medium`, `high`.
- `status` thuộc `pending`, `done`.
- `dueDate` dạng ISO date `YYYY-MM-DD`.

Response 201:

```json
{
  "item": {
    "taskId": "uuid",
    "userId": "user-id",
    "title": "Example task",
    "description": "Optional description",
    "priority": "medium",
    "dueDate": "2025-06-15",
    "status": "pending",
    "createdAt": "2025-06-01T10:00:00.000Z"
  }
}
```

## 13.3 PUT `/tasks/:id`

Request body:

```json
{
  "title": "Updated task",
  "description": "Updated description",
  "priority": "high",
  "dueDate": "2025-06-20",
  "status": "done"
}
```

Response 200:

```json
{
  "item": {
    "taskId": "uuid",
    "userId": "user-id",
    "title": "Updated task",
    "description": "Updated description",
    "priority": "high",
    "dueDate": "2025-06-20",
    "status": "done",
    "createdAt": "2025-06-01T10:00:00.000Z"
  }
}
```

## 13.4 DELETE `/tasks/:id`

Response 200:

```json
{
  "message": "Task deleted successfully"
}
```

## 13.5 Error responses đề xuất

```json
{
  "error": "ValidationError",
  "message": "title is required"
}
```

Status codes đề xuất:

- `200 OK`: đọc/cập nhật/xóa thành công.
- `201 Created`: tạo thành công.
- `400 Bad Request`: input không hợp lệ.
- `401 Unauthorized`: thiếu hoặc sai JWT token.
- `403 Forbidden`: token hợp lệ nhưng không có quyền thao tác tài nguyên.
- `404 Not Found`: không tìm thấy task.
- `500 Internal Server Error`: lỗi ngoài dự kiến.

---

## 14. Ghi chú triển khai để tránh mất điểm

- Đối với Lambda trong VPC, cần quyền ENI trong IAM role; nếu thiếu sẽ lỗi khi cold start hoặc attach VPC.
- Gateway Endpoint DynamoDB hoạt động qua route table gắn với private subnet; cần kiểm tra route có `pl-xxx -> vpce-xxx`.
- Lambda Security Group outbound nên giới hạn đến DynamoDB Prefix List port 443 theo yêu cầu.
- Khi test `CO-3`, gọi API không có `Authorization` header để nhận 401.
- Khi test `CO-4`, lấy JWT token hợp lệ từ Cognito login và gọi API với header:

```http
Authorization: Bearer <JWT_TOKEN>
```

- Khi deploy frontend lên S3 private, CloudFront có thể cache file cũ; cần tạo invalidation nếu cập nhật frontend.
- CloudFront domain phải được dùng trong CORS của API Gateway/Lambda response.
- Nếu dùng SAM/CloudFormation, tuyệt đối không thêm NAT Gateway resource.
- Nếu dùng CloudFormation/SAM cho API Gateway REST API + Cognito Authorizer, cần kiểm tra authorizer thật sự gắn vào từng method `/tasks`.
- Nếu để Lambda log không có `StatusCode 200` cho DynamoDB call, nên bổ sung logging rõ ràng trong handler để dễ chụp NE-5.

---

## 15. Prompt log / GenAI note

Nếu nhóm dùng AI agent để tạo code, sửa lỗi, viết tài liệu hoặc hướng dẫn deploy, cần lưu lại:

- Prompt đã dùng.
- Câu trả lời quan trọng của AI.
- Screenshot hoặc export chat.
- Mô tả phần nào trong project được hỗ trợ bởi GenAI.

Không nộp prompt GenAI có thể bị trừ điểm phần Tài liệu.

---

## 16. Video demo dự phòng

Cần chuẩn bị link video demo cho trường hợp bảo vệ dự phòng.

Video nên thể hiện tối thiểu:

- Truy cập frontend qua CloudFront.
- Login / Sign Up Cognito.
- CRUD task.
- Lọc task theo priority và due date.
- API không token trả về 401.
- API có token trả về 200.
- DynamoDB có dữ liệu.
- CloudWatch log thành công/lỗi.
- Không có NAT Gateway.
- S3 private và OAC.
