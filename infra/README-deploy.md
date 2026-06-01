# README Deploy — PROJECT2 Cloud Computing

Tài liệu này hướng dẫn thứ tự triển khai mô hình **Hybrid IaC + Console** cho đồ án PROJECT2: Web App Task Manager serverless trên AWS. Tài liệu đi kèm 3 file trong thư mục `infra/`:

```text
infra/
├── iac/template.yaml            # AWS SAM/CloudFormation template
├── console/console-guide.md     # Hướng dẫn thao tác/chụp bằng chứng trên AWS Console
└── README-deploy.md             # File này
```

## 1. Mục tiêu triển khai

Triển khai hệ thống gồm:

```text
CloudFront + OAC + S3 private
API Gateway REST API stage prod
Cognito User Pool + App Client + Authorizer
4 Lambda functions riêng biệt trong VPC
DynamoDB TasksTable + GSI userId-index
DynamoDB Gateway VPC Endpoint
IAM roles riêng cho từng Lambda
CloudWatch Logs, Dashboard, Alarms, SNS
AWS Budget 0.01 USD
```

Nguyên tắc quan trọng:

```text
Không dùng EC2.
Không tạo NAT Gateway.
Không public S3 bucket.
Không bật S3 Static Website Hosting.
Không dùng CORS '*'.
Không dùng chung IAM Role cho nhiều Lambda.
Không dùng wildcard DynamoDB Resource trong IAM policy.
```

---

## 2. Phân chia IaC và Console trong bộ triển khai này

### 2.1. Phần tạo bằng IaC trong `template.yaml`

`iac/template.yaml` hiện tại tạo các nhóm tài nguyên sau:

| Nhóm | Resource chính |
|---|---|
| Network | VPC, 2 private subnets, private route table, Lambda Security Group |
| VPC Endpoint | DynamoDB Gateway Endpoint, route table association |
| Database | DynamoDB `TasksTable`, GSI `userId-index` |
| Auth | Cognito User Pool, User Pool App Client |
| API | API Gateway REST API, stage `prod`, Cognito Authorizer, CORS, throttling |
| Compute | 4 Lambda functions: get/create/update/delete tasks |
| IAM | 4 IAM roles riêng, policy least privilege theo từng function |
| Logs | 4 CloudWatch Log Groups với retention |
| Cost safety | Lambda Reserved Concurrency, API throttling parameters |

### 2.2. Phần làm bằng Console

Các phần sau nên làm bằng AWS Console để dễ kiểm tra trực quan và chụp bằng chứng:

| Nhóm | Việc cần làm |
|---|---|
| Cost guardrail | Tạo AWS Budget 0.01 USD, alert 80% và 100% |
| Frontend hosting | Tạo S3 private bucket, upload frontend |
| CDN/Security | Tạo CloudFront Distribution + OAC, cập nhật S3 bucket policy |
| Cognito operation | Tạo/test ít nhất 2 users, lấy token test API nếu cần |
| Evidence | Chụp SE/CO/NE/IM screenshots |
| Monitoring | Tạo CloudWatch Dashboard, 2 alarms, SNS email subscription |
| Cost report | Chụp Billing Dashboard hoặc Cost Explorer |

---

## 3. Thứ tự triển khai tổng quát

Không nên chạy toàn bộ Console xong rồi mới IaC, cũng không nên IaC xong hết rồi mới Console. Thứ tự tối ưu là **xen kẽ**:

```text
0. Chuẩn bị local code và AWS CLI/SAM
1. Console: tạo AWS Budget trước
2. IaC: deploy stack lần 1 với AllowedOrigin placeholder
3. Console: verify VPC, Endpoint, DynamoDB, Lambda, IAM, Cognito, API
4. Console/CLI: tạo users Cognito, lấy token, test API 401/200 và CRUD
5. Console: tạo S3 private bucket, upload frontend
6. Console: tạo CloudFront + OAC, cập nhật bucket policy
7. IaC: deploy update stack lần 2 với AllowedOrigin = CloudFront domain thật
8. Console/CLI: upload/update frontend config, test end-to-end qua CloudFront
9. Console: tạo CloudWatch Dashboard, SNS, Alarms
10. Console: chụp toàn bộ evidence, cost report, hoàn thiện báo cáo
```

Lý do phải deploy xen kẽ:

```text
- API CORS cần CloudFront domain thật.
- CloudFront domain chỉ có sau khi tạo CloudFront bằng Console.
- Frontend config cần API URL, UserPoolId, UserPoolClientId từ IaC outputs.
- Monitoring cần hệ thống đã có traffic thật.
- Evidence cần kiểm tra trên Console sau mỗi nhóm resource.
```

---

## 4. Cơ chế deploy nhiều lần với một `template.yaml`

Mỗi lần chạy `sam deploy`, AWS SAM/CloudFormation sẽ đọc toàn bộ `template.yaml`, nhưng **không tạo lại toàn bộ resource**. Nó so sánh trạng thái mong muốn trong template với stack hiện tại:

```text
Resource không đổi  -> giữ nguyên
Parameter thay đổi  -> cập nhật resource liên quan
Code/config đổi     -> update resource liên quan
Resource mới        -> tạo thêm
Resource bị xóa khỏi template -> xóa khỏi stack, trừ khi có DeletionPolicy phù hợp
```

Vì vậy quy trình deploy 2 lần là bình thường:

```text
Deploy lần 1: tạo stack với AllowedOrigin placeholder.
Tạo CloudFront bằng Console.
Deploy lần 2: update cùng stack, chỉ đổi AllowedOrigin sang CloudFront domain thật.
```

Luôn dùng **cùng stack name**:

```text
task-manager-project2
```

Không đổi các thông tin dễ gây replacement sau khi deploy lần đầu:

```text
TableName
DynamoDB key schema
VPC CIDR
Subnet CIDR
FunctionName
RoleName
Logical ID trong template
```

---

## 5. Prerequisites

### 5.1. Công cụ cần có

```text
AWS CLI v2
AWS SAM CLI
Một AWS account/lab có quyền tạo VPC, Lambda, API Gateway, DynamoDB, Cognito, IAM, CloudFront, S3, CloudWatch, SNS, Budget
```

Kiểm tra:

```bash
aws --version
sam --version
aws sts get-caller-identity
```

Nếu dùng Windows PowerShell, nên gọi `curl.exe` thay vì `curl` vì `curl` trong PowerShell có thể là alias của `Invoke-WebRequest`.

### 5.2. Quy ước biến môi trường

Bash/macOS/Linux/Git Bash:

```bash
export AWS_REGION=ap-southeast-1
export PROJECT_NAME=task-manager-project2
export STACK_NAME=task-manager-project2
export TABLE_NAME=TasksTable
```

PowerShell:

```powershell
$env:AWS_REGION = "ap-southeast-1"
$env:PROJECT_NAME = "task-manager-project2"
$env:STACK_NAME = "task-manager-project2"
$env:TABLE_NAME = "TasksTable"
```

---

## 6. Phase 0 — Chuẩn bị local project

Đặt file theo cấu trúc gợi ý:

```text
project2-task-manager/
├── backend/
├── frontend/
│   ├── src/
│   └── dist/                # Sinh ra sau khi build Vite
├── infra/
│   ├── iac/template.yaml
│   ├── console/console-guide.md
│   └── README-deploy.md
├── evidence/
└── README.md
```

Nếu dùng template hiện tại với `InlineCode`, chưa cần thư mục backend riêng để deploy Lambda. Nếu sau này tách Lambda code ra file riêng qua `CodeUri`, cần chạy `sam build` trước `sam deploy`.

Kiểm tra template trước khi deploy:

```bash
cd infra
sam validate --template-file iac/template.yaml
```

Nếu có cài `cfn-lint`, có thể kiểm tra thêm:

```bash
sam validate --template-file iac/template.yaml --lint
```

---

## 7. Phase 1 — Console: tạo AWS Budget trước

Làm bước này trước mọi deploy để giảm rủi ro chi phí.

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

Chụp bằng chứng:

```text
evidence/COST-1-budget.png
```

---

## 8. Phase 2 — IaC: lấy DynamoDB Prefix List ID

Template giới hạn Security Group egress của Lambda chỉ tới DynamoDB AWS-managed prefix list qua port 443. Cần lấy `DynamoDBPrefixListId` trước khi deploy.

Bash:

```bash
export DDB_PREFIX_LIST_ID=$(aws ec2 describe-managed-prefix-lists \
  --region $AWS_REGION \
  --filters Name=prefix-list-name,Values=com.amazonaws.$AWS_REGION.dynamodb \
  --query 'PrefixLists[0].PrefixListId' \
  --output text)

echo $DDB_PREFIX_LIST_ID
```

PowerShell:

```powershell
$env:DDB_PREFIX_LIST_ID = aws ec2 describe-managed-prefix-lists `
  --region $env:AWS_REGION `
  --filters Name=prefix-list-name,Values=com.amazonaws.$env:AWS_REGION.dynamodb `
  --query 'PrefixLists[0].PrefixListId' `
  --output text

$env:DDB_PREFIX_LIST_ID
```

Kết quả mong muốn:

```text
pl-xxxxxxxxxxxxxxxxx
```

Nếu kết quả rỗng, kiểm tra lại region và quyền AWS CLI.

---

## 9. Phase 3 — IaC: deploy stack lần 1

Lần deploy đầu tiên dùng `AllowedOrigin` placeholder vì chưa có CloudFront domain.

### 9.1. Deploy bằng `sam deploy --guided`

```bash
sam deploy --guided \
  --template-file iac/template.yaml \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --capabilities CAPABILITY_NAMED_IAM
```

Khi được hỏi parameter, nhập gợi ý:

```text
ProjectName: task-manager-project2
AllowedOrigin: https://CHANGE-ME.cloudfront.net
VpcCidr: 10.0.0.0/16
PrivateSubnetACidr: 10.0.1.0/24
PrivateSubnetBCidr: 10.0.2.0/24
DynamoDBPrefixListId: pl-xxxxxxxxxxxxxxxxx
TableName: TasksTable
DynamoDbReadCapacity: 5
DynamoDbWriteCapacity: 5
LambdaReservedConcurrency: 5
ApiRateLimit: 100
ApiBurstLimit: 50
LogRetentionDays: 14
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Save arguments to samconfig.toml: Y
```

Sau khi lưu `samconfig.toml`, các lần deploy sau có thể dùng `sam deploy` ngắn hơn.

### 9.2. Deploy không dùng guided

Bash:

```bash
sam deploy \
  --template-file iac/template.yaml \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=$PROJECT_NAME \
    AllowedOrigin=https://CHANGE-ME.cloudfront.net \
    DynamoDBPrefixListId=$DDB_PREFIX_LIST_ID \
    TableName=$TABLE_NAME \
    DynamoDbReadCapacity=5 \
    DynamoDbWriteCapacity=5 \
    LambdaReservedConcurrency=5 \
    ApiRateLimit=100 \
    ApiBurstLimit=50 \
    LogRetentionDays=14
```

PowerShell:

```powershell
sam deploy `
  --template-file iac/template.yaml `
  --stack-name $env:STACK_NAME `
  --region $env:AWS_REGION `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides `
    ProjectName=$env:PROJECT_NAME `
    AllowedOrigin=https://CHANGE-ME.cloudfront.net `
    DynamoDBPrefixListId=$env:DDB_PREFIX_LIST_ID `
    TableName=$env:TABLE_NAME `
    DynamoDbReadCapacity=5 `
    DynamoDbWriteCapacity=5 `
    LambdaReservedConcurrency=5 `
    ApiRateLimit=100 `
    ApiBurstLimit=50 `
    LogRetentionDays=14
```

### 9.3. Xem Change Set trước khi execute, nếu muốn an toàn hơn

```bash
sam deploy \
  --template-file iac/template.yaml \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --capabilities CAPABILITY_NAMED_IAM \
  --no-execute-changeset \
  --parameter-overrides \
    ProjectName=$PROJECT_NAME \
    AllowedOrigin=https://CHANGE-ME.cloudfront.net \
    DynamoDBPrefixListId=$DDB_PREFIX_LIST_ID \
    TableName=$TABLE_NAME
```

Sau đó vào:

```text
CloudFormation > Stacks > task-manager-project2 > Change sets
```

Kiểm tra thay đổi rồi execute nếu đúng.

---

## 10. Phase 4 — Ghi lại Outputs của stack

Sau khi deploy xong, lấy outputs:

```bash
aws cloudformation describe-stacks \
  --region $AWS_REGION \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[].[OutputKey,OutputValue]' \
  --output table
```

Có thể lưu vào file:

```bash
aws cloudformation describe-stacks \
  --region $AWS_REGION \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs' \
  --output json > ../evidence/stack-outputs.json
```

Các output cần ghi lại:

```text
ApiUrl
UserPoolId
UserPoolClientId
DynamoDBTableName
DynamoDBTableArn
DynamoDbGatewayEndpointId
VpcId
PrivateSubnetAId
PrivateSubnetBId
LambdaSecurityGroupId
```

Trích output vào biến Bash:

```bash
export API_URL=$(aws cloudformation describe-stacks --region $AWS_REGION --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)
export USER_POOL_ID=$(aws cloudformation describe-stacks --region $AWS_REGION --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
export USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks --region $AWS_REGION --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text)

echo $API_URL
echo $USER_POOL_ID
echo $USER_POOL_CLIENT_ID
```

PowerShell:

```powershell
$env:API_URL = aws cloudformation describe-stacks --region $env:AWS_REGION --stack-name $env:STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text
$env:USER_POOL_ID = aws cloudformation describe-stacks --region $env:AWS_REGION --stack-name $env:STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text
$env:USER_POOL_CLIENT_ID = aws cloudformation describe-stacks --region $env:AWS_REGION --stack-name $env:STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text
```

---

## 11. Phase 5 — Console: verify IaC resources và chụp bằng chứng sớm

### 11.1. Networking evidence

Chụp sớm các mục sau:

```text
NE-1: VPC > Endpoints > DynamoDB endpoint, Status = Available
NE-3: VPC > Route Tables > private route table > Routes có pl-xxx -> vpce-xxx
NE-4: VPC > NAT Gateways > danh sách trống hoặc toàn bộ Deleted
```

Sau đó kiểm tra Lambda VPC config:

```text
NE-2: Lambda > từng function > Configuration > VPC > có 2 private subnets và Lambda SG
```

### 11.2. IAM evidence

Chụp:

```text
IM-1: IAM > Roles, filter task-manager-project2, thấy 4 roles riêng
IM-2: Inline policy DynamoDB dùng ARN table/index cụ thể
IM-3: Lambda > Configuration > Permissions, mỗi function gắn đúng role
```

Lưu ý: EC2 network-interface permissions có thể cần `Resource: "*"` theo cơ chế IAM của AWS. Khi nộp IM-2, hãy chụp rõ statement DynamoDB có ARN cụ thể.

### 11.3. Cognito/API evidence

Chụp:

```text
CO-1: Cognito > User Pools > task-manager-project2-user-pool, thấy Pool ID
CO-2: API Gateway > task-manager-project2-api > Authorizers, thấy Cognito Authorizer gắn User Pool
```

---

## 12. Phase 6 — Tạo Cognito users và lấy JWT token

Template đã tạo User Pool và App Client. Bạn chỉ cần tạo/test user.

### 12.1. Cách 1: tạo user bằng frontend Sign Up

Cách này phù hợp nhất cho demo vì chứng minh flow thật:

```text
Frontend Sign Up -> Confirm email/code nếu có -> Login -> nhận token -> gọi API
```

### 12.2. Cách 2: tạo user bằng AWS CLI

Tạo user 1:

```bash
aws cognito-idp sign-up \
  --region $AWS_REGION \
  --client-id $USER_POOL_CLIENT_ID \
  --username user1@example.com \
  --password 'Password123' \
  --user-attributes Name=email,Value=user1@example.com
```

Tạo user 2:

```bash
aws cognito-idp sign-up \
  --region $AWS_REGION \
  --client-id $USER_POOL_CLIENT_ID \
  --username user2@example.com \
  --password 'Password123' \
  --user-attributes Name=email,Value=user2@example.com
```

Nếu môi trường cho phép, xác nhận user bằng admin command:

```bash
aws cognito-idp admin-confirm-sign-up \
  --region $AWS_REGION \
  --user-pool-id $USER_POOL_ID \
  --username user1@example.com

aws cognito-idp admin-confirm-sign-up \
  --region $AWS_REGION \
  --user-pool-id $USER_POOL_ID \
  --username user2@example.com
```

Nếu không có quyền admin, xác nhận qua email/code hoặc xác nhận trong Console.

### 12.3. Lấy JWT token để test API

```bash
export TOKEN=$(aws cognito-idp initiate-auth \
  --region $AWS_REGION \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $USER_POOL_CLIENT_ID \
  --auth-parameters USERNAME=user1@example.com,PASSWORD='Password123' \
  --query 'AuthenticationResult.IdToken' \
  --output text)

echo $TOKEN
```

PowerShell:

```powershell
$env:TOKEN = aws cognito-idp initiate-auth `
  --region $env:AWS_REGION `
  --auth-flow USER_PASSWORD_AUTH `
  --client-id $env:USER_POOL_CLIENT_ID `
  --auth-parameters USERNAME=user1@example.com,PASSWORD='Password123' `
  --query 'AuthenticationResult.IdToken' `
  --output text
```

---

## 13. Phase 7 — Test API trước khi làm frontend

### 13.1. Test không token phải trả 401

Bash:

```bash
curl -i "$API_URL/tasks"
```

PowerShell:

```powershell
curl.exe -i "$env:API_URL/tasks"
```

Kỳ vọng:

```text
HTTP/2 401
{"message":"Unauthorized"}
```

Lưu bằng chứng:

```text
evidence/CO-3-api-no-token-401.txt
```

### 13.2. Test có token phải trả 200

Bash:

```bash
curl -i \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/tasks"
```

PowerShell:

```powershell
curl.exe -i `
  -H "Authorization: Bearer $env:TOKEN" `
  "$env:API_URL/tasks"
```

Kỳ vọng:

```text
HTTP/2 200
[]
```

Lưu bằng chứng:

```text
evidence/CO-4-api-token-200.txt
```

### 13.3. Test CRUD bằng curl

Create:

```bash
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo task","description":"Test from curl","priority":"high","dueDate":"2025-06-15"}' \
  "$API_URL/tasks"
```

Get:

```bash
curl -i \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/tasks"
```

Update:

```bash
curl -i -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated task","priority":"medium","dueDate":"2025-06-20","status":"done"}' \
  "$API_URL/tasks/<taskId>"
```

Delete:

```bash
curl -i -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/tasks/<taskId>"
```

Tạo dữ liệu demo cho ít nhất 2 users để khi kiểm tra DynamoDB thấy có ít nhất 2 `userId` khác nhau.

---

## 14. Phase 8 — Console: tạo S3 private bucket

Vào:

```text
S3 > Create bucket
```

Cấu hình:

```text
Bucket name: task-manager-project2-<team-id-or-mssv>
Region: ap-southeast-1
Block Public Access: ON cả 4 tùy chọn
Default encryption: SSE-S3
Static Website Hosting: không bật
```

Build frontend (Vite) rồi upload thư mục `dist`:

```bash
cd frontend
npm install
npm run build
```

Upload frontend files:

```text
frontend/dist/*
```

Cập nhật cấu hình frontend theo file hiện có trong repo:

1) Tạo `frontend/.env.production`:

```text
VITE_AWS_REGION=ap-southeast-1
VITE_COGNITO_POOL_ID=ap-southeast-1_xxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

2) Cập nhật API base URL trong `frontend/src/api/tasks.js` (hằng số `API_ENDPOINT`) thành:

```text
https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod
```

Chụp:

```text
SE-1: S3 Block Public Access ON cả 4 tùy chọn
SE-2: Direct S3 URL /index.html trả 403 Forbidden hoặc AccessDenied
```

Test direct S3 URL:

```bash
curl -i "https://<bucket-name>.s3.amazonaws.com/index.html"
```

Hoặc regional endpoint:

```bash
curl -i "https://<bucket-name>.s3.ap-southeast-1.amazonaws.com/index.html"
```

---

## 15. Phase 9 — Console: tạo CloudFront + OAC

### 15.1. Tạo OAC

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

### 15.2. Tạo distribution

Vào:

```text
CloudFront > Distributions > Create distribution
```

Cấu hình chính:

```text
Origin domain: chọn S3 bucket REST endpoint, không chọn website endpoint
Origin access: Origin access control settings
OAC: task-manager-project2-oac
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed methods: GET, HEAD, OPTIONS
Default root object: index.html
```

Sau khi tạo CloudFront, cập nhật bucket policy theo gợi ý của CloudFront hoặc dùng mẫu:

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

Chờ distribution status là `Deployed`, lấy domain:

```text
dxxxxxxxxxxxxx.cloudfront.net
```

Chụp:

```text
SE-3: CloudFront URL trả 200, frontend hoạt động
SE-4: CloudFront origin access = OAC
```

---

## 16. Phase 10 — IaC: update CORS bằng CloudFront domain thật

Sau khi có CloudFront domain, deploy lại cùng stack để update `AllowedOrigin`.

Bash:

```bash
export CLOUDFRONT_DOMAIN=dxxxxxxxxxxxxx.cloudfront.net
export ALLOWED_ORIGIN=https://$CLOUDFRONT_DOMAIN

sam deploy \
  --template-file iac/template.yaml \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=$PROJECT_NAME \
    AllowedOrigin=$ALLOWED_ORIGIN \
    DynamoDBPrefixListId=$DDB_PREFIX_LIST_ID \
    TableName=$TABLE_NAME \
    DynamoDbReadCapacity=5 \
    DynamoDbWriteCapacity=5 \
    LambdaReservedConcurrency=5 \
    ApiRateLimit=100 \
    ApiBurstLimit=50 \
    LogRetentionDays=14
```

PowerShell:

```powershell
$env:CLOUDFRONT_DOMAIN = "dxxxxxxxxxxxxx.cloudfront.net"
$env:ALLOWED_ORIGIN = "https://$env:CLOUDFRONT_DOMAIN"

sam deploy `
  --template-file iac/template.yaml `
  --stack-name $env:STACK_NAME `
  --region $env:AWS_REGION `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides `
    ProjectName=$env:PROJECT_NAME `
    AllowedOrigin=$env:ALLOWED_ORIGIN `
    DynamoDBPrefixListId=$env:DDB_PREFIX_LIST_ID `
    TableName=$env:TABLE_NAME `
    DynamoDbReadCapacity=5 `
    DynamoDbWriteCapacity=5 `
    LambdaReservedConcurrency=5 `
    ApiRateLimit=100 `
    ApiBurstLimit=50 `
    LogRetentionDays=14
```

Kiểm tra CORS response header:

```bash
curl -i -X OPTIONS \
  -H "Origin: $ALLOWED_ORIGIN" \
  -H "Access-Control-Request-Method: GET" \
  "$API_URL/tasks"
```

Kỳ vọng có header:

```text
Access-Control-Allow-Origin: https://dxxxxxxxxxxxxx.cloudfront.net
```

Không được là:

```text
Access-Control-Allow-Origin: *
```

---

## 17. Phase 11 — Upload/update frontend và test end-to-end

Nếu đã sửa `config.js`, upload lại file lên S3.

Nếu CloudFront đang cache file cũ, tạo invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

Test từ browser:

```text
https://dxxxxxxxxxxxxx.cloudfront.net
```

Checklist:

```text
[ ] Mở CloudFront URL được
[ ] Sign Up được
[ ] Login được
[ ] Tạo task được
[ ] Xem task được
[ ] Sửa task được
[ ] Xóa task được
[ ] Filter priority hoạt động
[ ] Filter dueDate hoạt động
[ ] User A không thấy task của User B
[ ] DynamoDB có dữ liệu của ít nhất 2 users
```

---

## 18. Phase 12 — Console: CloudWatch Dashboard, SNS, Alarms

### 18.1. Tạo SNS Topic

Vào:

```text
SNS > Topics > Create topic
```

Cấu hình:

```text
Name: task-manager-project2-alerts
Type: Standard
Subscription: Email nhóm
```

Mở email và bấm Confirm subscription.

### 18.2. Tạo CloudWatch Dashboard

Vào:

```text
CloudWatch > Dashboards > Create dashboard
```

Tên:

```text
TaskManager-Dashboard
```

Tạo ít nhất 5 widget, khuyến nghị 6:

| Widget | Namespace | Metric |
|---|---|---|
| Lambda Invocations | AWS/Lambda | Invocations |
| Lambda Duration | AWS/Lambda | Duration P50/P99 |
| Lambda Errors | AWS/Lambda | Errors |
| Lambda Throttles | AWS/Lambda | Throttles |
| API Latency | AWS/ApiGateway | Latency |
| API 4xx/5xx | AWS/ApiGateway | 4XXError, 5XXError |

Trước khi chụp dashboard, chạy CRUD vài lần và chờ metric xuất hiện.

### 18.3. Tạo alarms

Alarm 1:

```text
Name: Lambda-Error-Alarm
Metric: AWS/Lambda Errors
Condition: Errors > 10 trong 5 phút
Action: SNS email
```

Alarm 2:

```text
Name: API-5xx-Alarm
Metric: AWS/ApiGateway 5XXError
Condition: 5XXError > 5 trong 5 phút
Action: SNS email
```

Chụp:

```text
evidence/MON-1-dashboard.png
evidence/MON-2-alarms.png
evidence/MON-3-sns-confirmed.png
```

---

## 19. Phase 13 — CloudWatch Logs evidence

Tạo request thành công:

```bash
curl -i \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/tasks"
```

Tạo request lỗi, ví dụ thiếu `title`:

```bash
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"missing title","priority":"high","dueDate":"2025-06-15"}' \
  "$API_URL/tasks"
```

Vào:

```text
CloudWatch > Log groups > /aws/lambda/task-manager-project2-create-task
CloudWatch > Log groups > /aws/lambda/task-manager-project2-get-tasks
```

Chụp:

```text
NE-5: Lambda gọi DynamoDB thành công, không có NetworkingError hoặc UnauthorizedAccess
LOG-SUCCESS: có REPORT, Duration, Billed Duration, Memory Used
LOG-ERROR: có ERROR hoặc validation error do input sai
```

---

## 20. Phase 14 — Cost check cuối cùng

Vào:

```text
Billing and Cost Management > Cost Explorer
```

Hoặc:

```text
Billing Dashboard
```

Chụp:

```text
evidence/COST-2-cost-report.png
```

Yêu cầu:

```text
Tổng chi phí <= 0.01 USD hoặc gần 0.
Nếu có chi phí phát sinh, báo cáo phải giải thích lý do và cách khắc phục.
```

Kiểm tra lại:

```text
VPC > NAT Gateways: không có NAT Gateway Available.
```

---

## 21. Checklist evidence cuối cùng

Lưu file theo tên rõ ràng:

```text
evidence/
├── SE-1-s3-block-public-access.png
├── SE-2-s3-direct-403.png
├── SE-3-cloudfront-200.png
├── SE-4-cloudfront-oac.png
├── CO-1-cognito-user-pool.png
├── CO-2-api-authorizer.png
├── CO-3-api-no-token-401.txt
├── CO-4-api-token-200.txt
├── NE-1-dynamodb-vpc-endpoint.png
├── NE-2-lambda-vpc-config.png
├── NE-3-route-table-endpoint-route.png
├── NE-4-no-nat-gateway.png
├── NE-5-lambda-dynamodb-success-log.png
├── IM-1-iam-roles.png
├── IM-2-iam-policy-specific-arn.png
├── IM-3-lambda-role-mapping.png
├── MON-1-dashboard.png
├── MON-2-alarms.png
├── MON-3-sns-confirmed.png
├── COST-1-budget.png
├── COST-2-cost-report.png
└── stack-outputs.json
```

Checklist đầy đủ:

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
[ ] Báo cáo giải thích request flow, serverless scaling, CDN/OAC, VPC Endpoint
[ ] Sơ đồ kiến trúc có đủ CloudFront/OAC/S3, API, Cognito, Lambda trong VPC, Endpoint, DynamoDB, IAM, CloudWatch/SNS, Budget
[ ] Nếu dùng GenAI: có prompt history/screenshot
```

---

## 22. Troubleshooting nhanh

### 22.1. `sam deploy` lỗi `DynamoDBPrefixListId` rỗng

Kiểm tra:

```bash
aws configure get region
aws ec2 describe-managed-prefix-lists --region ap-southeast-1
```

Đảm bảo prefix list query dùng đúng region:

```text
com.amazonaws.ap-southeast-1.dynamodb
```

### 22.2. Stack ở trạng thái `ROLLBACK_COMPLETE`

Nếu deploy lần đầu fail và stack bị `ROLLBACK_COMPLETE`, thường phải xóa stack rồi deploy lại:

```bash
aws cloudformation delete-stack \
  --region $AWS_REGION \
  --stack-name $STACK_NAME
```

Chờ xóa xong rồi deploy lại.

### 22.3. API trả 401 dù có token

Kiểm tra:

```text
Authorization header đúng dạng: Bearer <JWT>
Dùng IdToken hoặc AccessToken hợp lệ, chưa hết hạn
API Gateway Authorizer gắn đúng User Pool
Stage prod đã deploy
```

### 22.4. API trả 500 hoặc Lambda AccessDenied DynamoDB

Kiểm tra:

```text
IAM role của Lambda có quyền đúng action
Resource ARN gồm cả table ARN và index ARN nếu Query trên GSI
TABLE_NAME env đúng
GSI_NAME = userId-index
```

### 22.5. Lambda timeout hoặc lỗi network khi gọi DynamoDB

Kiểm tra:

```text
Lambda có VpcConfig
Lambda nằm trong 2 private subnets
Route table có pl-xxx -> vpce-xxx
DynamoDB Gateway Endpoint status Available
Security Group outbound 443 tới DynamoDB Prefix List
Không cần NAT Gateway
```

### 22.6. Browser bị CORS

Kiểm tra:

```text
AllowedOrigin trong stack = https://<cloudfront-domain>
Không có dấu slash cuối URL
Không dùng '*'
Đã sam deploy update sau khi có CloudFront domain
Frontend gọi đúng API URL
```

Test OPTIONS:

```bash
curl -i -X OPTIONS \
  -H "Origin: https://<cloudfront-domain>" \
  -H "Access-Control-Request-Method: GET" \
  "$API_URL/tasks"
```

### 22.7. CloudFront trả 403

Kiểm tra:

```text
OAC đã gắn vào origin
Bucket policy cho phép cloudfront.amazonaws.com với SourceArn đúng distribution
Default root object = index.html
File index.html đã upload đúng path
Origin là S3 REST endpoint, không phải website endpoint
```

### 22.8. Frontend config cũ dù đã upload S3

Tạo invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

### 22.9. Dashboard không có dữ liệu

```text
Chạy CRUD test nhiều lần.
Chờ CloudWatch metric cập nhật vài phút.
Kiểm tra dashboard chọn đúng region, đúng function/API/stage.
```

---

## 23. Cleanup sau khi bảo vệ

Chỉ cleanup khi đã bảo vệ/nộp bài xong và không cần hệ thống nữa.

Xóa SAM stack:

```bash
sam delete \
  --stack-name $STACK_NAME \
  --region $AWS_REGION
```

Sau đó kiểm tra thủ công:

```text
CloudFront: disable/delete distribution nếu không dùng nữa
S3: empty bucket rồi delete
CloudWatch Log Groups: delete nếu còn tồn tại
SNS Topic/subscriptions: delete
AWS Budget: delete nếu không cần
VPC NAT Gateways: phải không có Available
```

Lưu ý: CloudFront cần thời gian để disable/delete. Không xóa bucket nếu CloudFront còn dùng origin đó và bạn vẫn cần test.
