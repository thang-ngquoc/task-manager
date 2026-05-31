# PROJECT2 Cloud Computing — Console Guide cho mô hình Hybrid IaC + Console

Tài liệu này đi kèm `template.yaml`. Mục tiêu là dùng IaC cho phần hạ tầng backend cốt lõi, còn AWS Console dùng cho các phần cần cấu hình trực quan, xác nhận email, kiểm tra bảo mật và chụp bằng chứng nộp đồ án.

Nguồn yêu cầu: `PROJECT2_VI.pdf`.

---

## 0. Quy ước đề xuất

```text
Region: ap-southeast-1
ProjectName: task-manager-project2
Stack name: task-manager-project2
DynamoDB table: TasksTable
GSI: userId-index
API stage: prod
CloudWatch dashboard: TaskManager-Dashboard
```

Tuyệt đối không tạo NAT Gateway. Nếu Console hiển thị NAT Gateway đang `Available`, nhóm sẽ có rủi ro mất điểm phần Networking/Cost.

---

## 1. Deploy phần IaC bằng AWS SAM

### 1.1. Lấy DynamoDB managed prefix list ID

Template dùng Security Group egress chỉ cho phép Lambda đi `tcp/443` tới DynamoDB prefix list. Lấy prefix list ID trước khi deploy:

```bash
export AWS_REGION=ap-southeast-1

aws ec2 describe-managed-prefix-lists \
  --region $AWS_REGION \
  --filters Name=prefix-list-name,Values=com.amazonaws.$AWS_REGION.dynamodb \
  --query 'PrefixLists[0].PrefixListId' \
  --output text
```

Kết quả có dạng:

```text
pl-xxxxxxxxxxxxxxxxx
```

Lưu lại giá trị này để truyền vào `DynamoDBPrefixListId`.

### 1.2. Deploy stack lần đầu

```bash
sam deploy --guided \
  --template-file template.yaml \
  --stack-name task-manager-project2 \
  --region ap-southeast-1 \
  --capabilities CAPABILITY_NAMED_IAM
```

Khi được hỏi parameter, nhập ví dụ:

```text
ProjectName: task-manager-project2
AllowedOrigin: https://CHANGE-ME.cloudfront.net
DynamoDBPrefixListId: pl-xxxxxxxxxxxxxxxxx
TableName: TasksTable
LambdaReservedConcurrency: 5
ApiRateLimit: 100
ApiBurstLimit: 50
```

Lần deploy đầu tiên có thể dùng `AllowedOrigin` placeholder vì lúc này chưa có CloudFront domain. Sau khi tạo CloudFront, bạn sẽ update stack lại.

### 1.3. Ghi lại outputs

Sau khi deploy xong, lấy output:

```bash
aws cloudformation describe-stacks \
  --region ap-southeast-1 \
  --stack-name task-manager-project2 \
  --query 'Stacks[0].Outputs'
```

Cần ghi lại:

```text
ApiUrl
UserPoolId
UserPoolClientId
DynamoDBTableName
DynamoDbGatewayEndpointId
VpcId
PrivateSubnetAId
PrivateSubnetBId
LambdaSecurityGroupId
```

Các giá trị này dùng cho frontend config, testing và screenshot evidence.

---

## 2. Tạo S3 private bucket bằng Console

Phần này nên làm bằng Console để dễ kiểm tra và chụp bằng chứng SE-1/SE-2.

### 2.1. Tạo bucket

Vào:

```text
S3 > Create bucket
```

Cấu hình:

```text
Bucket name: task-manager-project2-<mssv-or-team-id>
Region: ap-southeast-1
Block Public Access: ON cả 4 tùy chọn
Bucket Versioning: Optional
Default encryption: SSE-S3
Static Website Hosting: KHÔNG bật
```

### 2.2. Upload frontend

Upload các file frontend:

```text
index.html
styles.css
app.js
config.js
```

`config.js` nên chứa output từ stack:

```js
window.APP_CONFIG = {
  apiBaseUrl: "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod",
  region: "ap-southeast-1",
  userPoolId: "ap-southeast-1_xxxxxxxx",
  userPoolClientId: "xxxxxxxxxxxxxxxxxxxxxxxxxx"
};
```

### 2.3. Evidence cần chụp

| ID | Cần chụp |
|---|---|
| SE-1 | S3 bucket > Permissions: 4 tùy chọn Block Public Access đều ON |
| SE-2 | Truy cập `https://<bucket>.s3.amazonaws.com/index.html` trả `403 Forbidden` hoặc `AccessDenied` |

Gợi ý lưu file:

```text
evidence/SE-1-s3-block-public-access.png
evidence/SE-2-s3-direct-403.png
```

---

## 3. Tạo CloudFront Distribution + OAC bằng Console

### 3.1. Tạo OAC

Vào:

```text
CloudFront > Origin access > Origin access control > Create control setting
```

Cấu hình:

```text
Name: task-manager-project2-oac
Origin type: S3
Signing behavior: Sign requests
Signing protocol: SigV4
```

### 3.2. Tạo CloudFront distribution

Vào:

```text
CloudFront > Distributions > Create distribution
```

Cấu hình chính:

```text
Origin domain: chọn S3 bucket dạng REST endpoint, không chọn website endpoint
Origin access: Origin access control settings
Origin access control: task-manager-project2-oac
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD, OPTIONS
Default root object: index.html
```

Sau khi tạo distribution, CloudFront có thể yêu cầu update bucket policy. Dùng policy được CloudFront gợi ý, hoặc dùng mẫu sau:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket-name>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```

### 3.3. Test CloudFront

Mở:

```text
https://<distribution-domain>.cloudfront.net
```

Kỳ vọng:

```text
HTTP 200, web frontend hiển thị được
```

### 3.4. Evidence cần chụp

| ID | Cần chụp |
|---|---|
| SE-3 | CloudFront URL trả 200 và frontend hoạt động |
| SE-4 | CloudFront distribution settings cho thấy Origin access = OAC |

Gợi ý lưu file:

```text
evidence/SE-3-cloudfront-200.png
evidence/SE-4-cloudfront-oac.png
```

---

## 4. Update stack để CORS chỉ cho phép CloudFront domain

Sau khi có domain CloudFront, update lại `AllowedOrigin`:

```bash
sam deploy \
  --template-file template.yaml \
  --stack-name task-manager-project2 \
  --region ap-southeast-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=task-manager-project2 \
    AllowedOrigin=https://<distribution-domain>.cloudfront.net \
    DynamoDBPrefixListId=pl-xxxxxxxxxxxxxxxxx \
    TableName=TasksTable \
    LambdaReservedConcurrency=5 \
    ApiRateLimit=100 \
    ApiBurstLimit=50
```

Kiểm tra trong browser DevTools hoặc curl response header, `Access-Control-Allow-Origin` phải là CloudFront domain, không phải `*`.

---

## 5. Cognito: tạo/test users bằng Console

Template đã tạo User Pool và App Client. Vào:

```text
Cognito > User pools > task-manager-project2-user-pool
```

### 5.1. Tạo ít nhất 2 users

Có thể tạo qua frontend Sign Up, hoặc tạo trong Console:

```text
Users > Create user
```

Khuyến nghị dùng frontend Sign Up/Login để chứng minh flow thật.

### 5.2. Lấy JWT token để test API

Cách đơn giản qua AWS CLI nếu user đã xác nhận:

```bash
aws cognito-idp initiate-auth \
  --region ap-southeast-1 \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <UserPoolClientId> \
  --auth-parameters USERNAME=<email>,PASSWORD='<password>'
```

Lấy `AuthenticationResult.IdToken` hoặc `AccessToken` để test API.

### 5.3. Evidence cần chụp

| ID | Cần chụp |
|---|---|
| CO-1 | Cognito User Pool đã tạo, có Pool ID |

---

## 6. API Gateway: verify Authorizer và test 401/200

Template đã tạo REST API, stage `prod`, Cognito Authorizer, CORS và throttling. Bạn vẫn cần verify và chụp bằng chứng.

### 6.1. Chụp Authorizer

Vào:

```text
API Gateway > APIs > task-manager-project2-api > Authorizers
```

Chụp màn hình Cognito Authorizer liên kết đúng User Pool.

Evidence:

```text
evidence/CO-2-api-authorizer.png
```

### 6.2. Test không token phải 401

```bash
curl -i https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod/tasks
```

Kỳ vọng:

```text
HTTP/2 401
{"message":"Unauthorized"}
```

Evidence:

```text
evidence/CO-3-api-no-token-401.txt
```

### 6.3. Test có token phải 200

```bash
TOKEN='<JWT_TOKEN>'

curl -i \
  -H "Authorization: Bearer $TOKEN" \
  https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod/tasks
```

Kỳ vọng:

```text
HTTP/2 200
[]
```

Evidence:

```text
evidence/CO-4-api-token-200.txt
```

---

## 7. Test CRUD end-to-end

### 7.1. Create task

```bash
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo task","description":"Test from curl","priority":"high","dueDate":"2025-06-15"}' \
  https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod/tasks
```

Ghi lại `taskId` trả về.

### 7.2. Get tasks

```bash
curl -i \
  -H "Authorization: Bearer $TOKEN" \
  https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod/tasks
```

### 7.3. Update task

```bash
curl -i -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated task","priority":"medium","dueDate":"2025-06-20","status":"done"}' \
  https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod/tasks/<taskId>
```

### 7.4. Delete task

```bash
curl -i -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod/tasks/<taskId>
```

---

## 8. Networking evidence bằng Console

### 8.1. NE-1: DynamoDB Gateway Endpoint

Vào:

```text
VPC > Endpoints
```

Chụp endpoint:

```text
Service name: com.amazonaws.ap-southeast-1.dynamodb
Status: Available
```

### 8.2. NE-2: Lambda VpcConfig

Vào từng Lambda:

```text
Lambda > Functions > task-manager-project2-get-tasks > Configuration > VPC
```

Chụp Subnets và Security Group. Có thể chụp đại diện, nhưng tốt nhất chụp đủ 4 function hoặc 1 ảnh tổng hợp.

### 8.3. NE-3: Route table endpoint route

Vào:

```text
VPC > Route tables > task-manager-project2-private-rt > Routes
```

Chụp dòng:

```text
Destination: pl-xxxxxxxx
Target: vpce-xxxxxxxx
```

### 8.4. NE-4: Không có NAT Gateway

Vào:

```text
VPC > NAT Gateways
```

Chụp màn hình danh sách trống hoặc tất cả entries đều `Deleted`.

### 8.5. NE-5: Lambda gọi DynamoDB thành công

Vào:

```text
CloudWatch > Log groups > /aws/lambda/task-manager-project2-get-tasks
```

Chụp log có dòng tương tự:

```text
StatusCode 200: queried ... tasks for userId=...
REPORT RequestId: ... Duration: ... Billed Duration: ... Memory Used: ...
```

---

## 9. IAM evidence bằng Console

### 9.1. IM-1: Role riêng biệt

Vào:

```text
IAM > Roles
```

Filter theo:

```text
task-manager-project2
```

Phải thấy 4 roles:

```text
task-manager-project2-get-tasks-role
task-manager-project2-create-task-role
task-manager-project2-update-task-role
task-manager-project2-delete-task-role
```

### 9.2. IM-2: DynamoDB policy dùng ARN cụ thể

Mở từng role, xem inline policy. Chụp statement DynamoDB, ví dụ:

```json
"Resource": [
  "arn:aws:dynamodb:ap-southeast-1:<account-id>:table/TasksTable",
  "arn:aws:dynamodb:ap-southeast-1:<account-id>:table/TasksTable/index/userId-index"
]
```

Lưu ý: EC2 network-interface actions thường cần `Resource: "*"` theo cơ chế IAM của AWS. Khi chụp IM-2, hãy chụp rõ statement DynamoDB có ARN cụ thể, vì đây là phần đề yêu cầu kiểm tra least privilege với database.

### 9.3. IM-3: Lambda gắn đúng role

Vào:

```text
Lambda > Function > Configuration > Permissions
```

Chụp mỗi Lambda gắn đúng role tương ứng.

---

## 10. CloudWatch Dashboard bằng Console

Vào:

```text
CloudWatch > Dashboards > Create dashboard
```

Tên:

```text
TaskManager-Dashboard
```

Tạo ít nhất 5 widget, khuyến nghị tạo 6:

| Widget | Namespace | Metric |
|---|---|---|
| Lambda Invocations | AWS/Lambda | Invocations |
| Lambda Duration | AWS/Lambda | Duration P50/P99 |
| Lambda Errors | AWS/Lambda | Errors |
| Lambda Throttles | AWS/Lambda | Throttles |
| API Latency | AWS/ApiGateway | Latency |
| API 4xx/5xx | AWS/ApiGateway | 4XXError, 5XXError |

Trước khi chụp dashboard, chạy CRUD test vài lần để có dữ liệu thực.

Evidence:

```text
evidence/MON-1-dashboard.png
```

---

## 11. CloudWatch Alarms + SNS bằng Console

### 11.1. Tạo SNS topic

Vào:

```text
SNS > Topics > Create topic
```

Tên:

```text
task-manager-project2-alerts
```

Tạo subscription email và bấm xác nhận trong email.

### 11.2. Tạo alarm Lambda Errors

Vào:

```text
CloudWatch > Alarms > Create alarm
```

Cấu hình:

```text
Metric: AWS/Lambda Errors
Functions: chọn 4 Lambda hoặc tạo riêng theo function
Condition: Errors > 10 trong 5 phút
Action: gửi SNS email
Name: Lambda-Error-Alarm
```

### 11.3. Tạo alarm API 5XX

```text
Metric: AWS/ApiGateway 5XXError
Condition: 5XXError > 5 trong 5 phút
Action: gửi SNS email
Name: API-5xx-Alarm
```

Evidence:

```text
evidence/MON-2-alarms.png
```

---

## 12. AWS Budget bằng Console

Vào:

```text
Billing and Cost Management > Budgets > Create budget
```

Cấu hình:

```text
Budget type: Cost budget
Period: Monthly
Amount: 0.01 USD
Alert 1: 80% = 0.008 USD
Alert 2: 100% = 0.01 USD
Email notification: email nhóm
```

Evidence:

```text
evidence/COST-1-budget.png
```

Trước khi nộp, vào Billing Dashboard hoặc Cost Explorer chụp chi phí:

```text
evidence/COST-2-cost-report.png
```

Nếu có chi phí phát sinh, ghi rõ lý do và biện pháp khắc phục trong báo cáo.

---

## 13. Checklist cuối trước khi nộp

```text
[ ] SE-1: S3 Block Public Access ON cả 4 tùy chọn
[ ] SE-2: Direct S3 URL trả 403
[ ] SE-3: CloudFront URL trả 200
[ ] SE-4: CloudFront OAC gắn đúng
[ ] CO-1: Cognito User Pool có Pool ID
[ ] CO-2: API Gateway Authorizer gắn User Pool
[ ] CO-3: API không token trả 401
[ ] CO-4: API có token trả 200
[ ] NE-1: DynamoDB VPC Endpoint Available
[ ] NE-2: Lambda có VpcConfig
[ ] NE-3: Route table có pl-xxx -> vpce-xxx
[ ] NE-4: Không có NAT Gateway
[ ] NE-5: CloudWatch log Lambda gọi DynamoDB thành công
[ ] IM-1: 4 IAM roles riêng biệt
[ ] IM-2: DynamoDB policy dùng table/index ARN cụ thể
[ ] IM-3: Lambda gắn role đúng
[ ] Dashboard có 5+ widgets và dữ liệu thật
[ ] 2 alarms tạo xong và SNS email confirmed
[ ] Budget 0.01 USD tạo xong
[ ] Cost report <= 0.01 USD hoặc có giải thích
[ ] DynamoDB có dữ liệu demo của ít nhất 2 users
[ ] Frontend CRUD + filter chạy đúng qua CloudFront
[ ] Báo cáo giải thích request flow, serverless scaling, CDN/OAC, VPC endpoint
[ ] Sơ đồ kiến trúc có đủ CloudFront/OAC/S3, API, Cognito, Lambda trong VPC, Endpoint, DynamoDB, IAM, CloudWatch/SNS, Budget
[ ] Nếu dùng GenAI: có prompt history/screenshot
```

---

## 14. Cleanup sau khi bảo vệ

Để tránh phát sinh chi phí:

```bash
sam delete --stack-name task-manager-project2 --region ap-southeast-1
```

Sau đó kiểm tra thủ công:

```text
CloudFront distribution: disable/delete nếu không dùng
S3 bucket: empty + delete
CloudWatch log groups: delete nếu stack không xóa
SNS topic/subscriptions: delete
Budget: delete nếu không cần
NAT Gateway: phải không có
```

CloudFront cần thời gian disable/delete. Không xóa bucket trước khi gỡ CloudFront policy nếu còn distribution đang dùng.
