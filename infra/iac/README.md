# README for `template.yaml`

Tài liệu này mô tả vai trò, phạm vi, tham số cấu hình và cách deploy file `template.yaml` trong thư mục `infra/` cho đồ án **Cloud Computing Project 2 - Serverless Task Manager**.

> File này chỉ tập trung giải thích **template IaC**. Thứ tự triển khai tổng thể xem `README-deploy.md`; các bước thao tác AWS Console xem `console-guide.md`.

---

## 1. Mục đích của `template.yaml`

`template.yaml` là file **AWS SAM / CloudFormation** dùng để tạo phần hạ tầng lõi của hệ thống Task Manager. Template này giúp tự động hóa các thành phần dễ sai khi làm thủ công như VPC, subnet, DynamoDB, IAM roles, Lambda functions và API Gateway.

Template hiện tại tạo các nhóm tài nguyên chính sau:

| Nhóm | Resource chính | Ghi chú |
|---|---|---|
| Network | Custom VPC, 2 private subnets, route table, DynamoDB Gateway Endpoint, Lambda Security Group | Không tạo NAT Gateway |
| Database | DynamoDB `TasksTable`, GSI `userId-index` | Dùng cho CRUD task theo user |
| Authentication | Cognito User Pool, Cognito App Client | Template này **đã tạo Cognito bằng IaC** |
| API | API Gateway REST API, stage `prod`, Cognito Authorizer, CORS, throttling | Không dùng HTTP API |
| Compute | 4 Lambda functions riêng biệt | GET, POST, PUT, DELETE `/tasks` |
| IAM | 4 IAM roles riêng cho 4 Lambda | Giới hạn quyền DynamoDB theo từng chức năng |
| Logs | CloudWatch Log Groups cho 4 Lambda | Có retention cấu hình được |
| Outputs | API URL, User Pool ID, App Client ID, VPC/Subnet/SG/Table/Endpoint IDs | Dùng để cấu hình frontend và chụp evidence |

Các phần **không nằm trong template này** và thường làm bằng Console theo `console-guide.md`:

- S3 private bucket cho frontend.
- CloudFront Distribution + Origin Access Control.
- Bucket Policy cho CloudFront OAC.
- AWS Budget 0.01 USD.
- CloudWatch Dashboard, CloudWatch Alarms, SNS email notification nếu nhóm chưa mở rộng template.
- Cost Explorer / Billing evidence.
- Screenshot evidence SE/CO/NE/IM.

---

## 2. Kiến trúc do template tạo

Luồng backend chính:

```text
API Gateway REST API /prod
  └── Cognito Authorizer kiểm tra JWT
      ├── GET    /tasks      -> GetTasksFunction
      ├── POST   /tasks      -> CreateTaskFunction
      ├── PUT    /tasks/{id} -> UpdateTaskFunction
      └── DELETE /tasks/{id} -> DeleteTaskFunction

4 Lambda functions
  └── chạy trong 2 private subnets
      └── gọi DynamoDB qua DynamoDB Gateway Endpoint
          └── TasksTable + GSI userId-index
```

Network:

```text
Custom VPC 10.0.0.0/16
  ├── PrivateSubnetA 10.0.1.0/24
  ├── PrivateSubnetB 10.0.2.0/24
  ├── PrivateRouteTable
  │   └── DynamoDB Prefix List -> DynamoDB Gateway Endpoint
  └── LambdaSecurityGroup
      └── outbound TCP 443 tới DynamoDB Prefix List
```

---

## 3. Yêu cầu trước khi deploy

Cần cài và cấu hình:

```bash
aws --version
sam --version
```

Đảm bảo AWS CLI đang trỏ đúng account và region:

```bash
aws sts get-caller-identity
aws configure get region
```

Khuyến nghị region:

```bash
ap-southeast-1
```

Nếu chưa set region:

```bash
aws configure set region ap-southeast-1
```

---

## 4. Tham số quan trọng của template

### 4.1 `ProjectName`

Tên tiền tố cho resource.

```yaml
ProjectName: task-manager-project2
```

Nên dùng chữ thường, số và dấu gạch ngang. Không nên đổi sau khi đã deploy ổn vì nhiều resource name phụ thuộc tham số này.

---

### 4.2 `AllowedOrigin`

Domain được phép gọi API qua CORS.

```yaml
AllowedOrigin: https://CHANGE-ME.cloudfront.net
```

Khi mới deploy lần đầu, có thể để placeholder:

```text
https://CHANGE-ME.cloudfront.net
```

Sau khi tạo CloudFront bằng Console, update stack với domain thật:

```text
https://dxxxxxxxxxxxxx.cloudfront.net
```

Không dùng:

```text
*
```

Vì đề bài yêu cầu CORS chỉ cho phép CloudFront domain, không được để wildcard.

---

### 4.3 `DynamoDBPrefixListId`

Đây là tham số **bắt buộc**. Security Group của Lambda dùng giá trị này để chỉ cho phép outbound HTTPS tới DynamoDB Prefix List.

Lấy bằng lệnh:

```bash
aws ec2 describe-managed-prefix-lists \
  --filters Name=prefix-list-name,Values=com.amazonaws.$(aws configure get region).dynamodb \
  --query 'PrefixLists[0].PrefixListId' \
  --output text
```

Ví dụ output:

```text
pl-0123456789abcdef0
```

Khi deploy, truyền vào:

```bash
DynamoDBPrefixListId=pl-0123456789abcdef0
```

---

### 4.4 `VpcCidr`, `PrivateSubnetACidr`, `PrivateSubnetBCidr`

Mặc định:

```yaml
VpcCidr: 10.0.0.0/16
PrivateSubnetACidr: 10.0.1.0/24
PrivateSubnetBCidr: 10.0.2.0/24
```

Nên giữ nguyên trừ khi bị trùng CIDR trong account/lab.

---

### 4.5 `TableName`

Tên bảng DynamoDB:

```yaml
TableName: TasksTable
```

Không nên đổi sau khi đã có dữ liệu. Nếu đổi tên bảng, CloudFormation có thể tạo bảng mới.

---

### 4.6 `DynamoDbReadCapacity`, `DynamoDbWriteCapacity`

Mặc định:

```yaml
DynamoDbReadCapacity: 5
DynamoDbWriteCapacity: 5
```

Giữ thấp để phù hợp Free Tier. Template giới hạn tối đa 25 theo yêu cầu đồ án.

---

### 4.7 `LambdaReservedConcurrency`

Mặc định:

```yaml
LambdaReservedConcurrency: 5
```

Đây là giới hạn concurrency riêng cho mỗi Lambda. Giá trị 5 phù hợp demo/free-tier vì vừa đủ test, vừa tránh runaway traffic.

Nếu AWS Academy/lab quota thấp, có thể giảm xuống:

```yaml
LambdaReservedConcurrency: 2
```

---

### 4.8 `ApiRateLimit`, `ApiBurstLimit`

Mặc định:

```yaml
ApiRateLimit: 100
ApiBurstLimit: 50
```

Dùng cho throttling của API Gateway stage/method settings.

---

### 4.9 `LogRetentionDays`

Mặc định:

```yaml
LogRetentionDays: 14
```

Có thể giảm xuống 7 nếu muốn tiết kiệm, nhưng 14 ngày là hợp lý để còn evidence khi làm báo cáo.

---

## 5. Deploy lần đầu

Từ thư mục chứa `template.yaml`:

```bash
cd infra
```

Lấy DynamoDB Prefix List ID:

```bash
export AWS_REGION=$(aws configure get region)
export DDB_PREFIX_LIST_ID=$(aws ec2 describe-managed-prefix-lists \
  --filters Name=prefix-list-name,Values=com.amazonaws.${AWS_REGION}.dynamodb \
  --query 'PrefixLists[0].PrefixListId' \
  --output text)

echo $DDB_PREFIX_LIST_ID
```

Build SAM:

```bash
sam build --template-file template.yaml
```

Deploy guided lần đầu:

```bash
sam deploy --guided
```

Gợi ý giá trị khi SAM hỏi:

```text
Stack Name: task-manager-project2
AWS Region: ap-southeast-1
Parameter ProjectName: task-manager-project2
Parameter AllowedOrigin: https://CHANGE-ME.cloudfront.net
Parameter DynamoDBPrefixListId: <giá trị DDB_PREFIX_LIST_ID>
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Save arguments to configuration file: Y
SAM configuration file: samconfig.toml
SAM configuration environment: default
```

Sau khi lưu `samconfig.toml`, các lần sau thường chỉ cần:

```bash
sam build --template-file template.yaml
sam deploy
```

---

## 6. Deploy bằng một lệnh không dùng guided

Có thể deploy trực tiếp:

```bash
sam build --template-file template.yaml

sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name task-manager-project2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=task-manager-project2 \
    AllowedOrigin=https://CHANGE-ME.cloudfront.net \
    DynamoDBPrefixListId=${DDB_PREFIX_LIST_ID}
```

Nếu template có tạo IAM role đặt tên cụ thể, phải có:

```bash
--capabilities CAPABILITY_NAMED_IAM
```

---

## 7. Lấy output sau khi deploy

Xem outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name task-manager-project2 \
  --query 'Stacks[0].Outputs' \
  --output table
```

Các output cần ghi lại:

| Output | Dùng để làm gì |
|---|---|
| `ApiUrl` | Cấu hình frontend `apiBaseUrl` |
| `UserPoolId` | Cấu hình frontend Cognito |
| `UserPoolClientId` | Cấu hình frontend Cognito |
| `DynamoDBTableName` | Kiểm tra dữ liệu task |
| `DynamoDbGatewayEndpointId` | Evidence NE-1 |
| `VpcId`, `PrivateSubnetAId`, `PrivateSubnetBId`, `LambdaSecurityGroupId` | Evidence NE-2/NE-3 |

---

## 8. Cấu hình frontend sau khi có output

Trong file frontend, ví dụ `frontend/config.js`:

```js
const CONFIG = {
  region: "ap-southeast-1",
  apiBaseUrl: "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/prod",
  userPoolId: "ap-southeast-1_xxxxxxxxx",
  clientId: "xxxxxxxxxxxxxxxxxxxxxxxxxx"
};
```

Lấy các giá trị từ CloudFormation Outputs:

```text
apiBaseUrl     <- ApiUrl
userPoolId     <- UserPoolId
clientId       <- UserPoolClientId
```

Sau đó upload frontend lên S3 private bucket và tạo CloudFront OAC theo `console-guide.md`.

---

## 9. Update CORS sau khi có CloudFront domain

Sau khi tạo CloudFront, lấy domain dạng:

```text
https://dxxxxxxxxxxxxx.cloudfront.net
```

Update stack với `AllowedOrigin` thật:

```bash
sam deploy \
  --stack-name task-manager-project2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=task-manager-project2 \
    AllowedOrigin=https://dxxxxxxxxxxxxx.cloudfront.net \
    DynamoDBPrefixListId=${DDB_PREFIX_LIST_ID}
```

Lưu ý: với cùng `--stack-name`, CloudFormation sẽ **update stack hiện tại**, không tạo lại toàn bộ resource từ đầu. Nó chỉ thay đổi các resource bị ảnh hưởng bởi parameter mới, ví dụ Lambda environment hoặc API CORS.

---

## 10. Kiểm tra API

### 10.1 Test không token

```bash
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/prod/tasks
```

Kỳ vọng:

```text
401 Unauthorized
```

Dùng làm evidence CO-3.

---

### 10.2 Test có token

Sau khi frontend login Cognito và lấy JWT, test:

```bash
curl -i \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  https://<api-id>.execute-api.<region>.amazonaws.com/prod/tasks
```

Kỳ vọng:

```text
200 OK
```

Dùng làm evidence CO-4.

---

### 10.3 Test tạo task

```bash
curl -i -X POST \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo task","description":"Test from curl","priority":"high","dueDate":"2026-06-15"}' \
  https://<api-id>.execute-api.<region>.amazonaws.com/prod/tasks
```

Kỳ vọng:

```text
201 Created
```

---

## 11. Cách chỉnh sửa template an toàn

### Nên chỉnh qua Parameters

Ưu tiên đổi qua `--parameter-overrides` thay vì sửa cứng trong template:

```bash
AllowedOrigin=https://dxxxx.cloudfront.net
LambdaReservedConcurrency=2
LogRetentionDays=7
```

---

### Hạn chế đổi sau khi đã deploy

Không nên đổi tùy tiện:

```text
Logical ID của resource
TableName
DynamoDB key schema
VpcCidr
Subnet CIDR
FunctionName
RoleName
```

Các thay đổi này có thể làm CloudFormation replace resource hoặc gây lỗi update.

---

### Nên xem Change Set trước khi update quan trọng

```bash
sam deploy \
  --stack-name task-manager-project2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=task-manager-project2 \
    AllowedOrigin=https://dxxxx.cloudfront.net \
    DynamoDBPrefixListId=${DDB_PREFIX_LIST_ID} \
  --no-execute-changeset
```

Sau đó vào CloudFormation Console để xem Change Set. Nếu ổn mới execute.

---

## 12. Ghi chú về Cognito trong template

Template hiện tại **tạo Cognito User Pool và App Client bằng IaC**:

```text
TaskManagerUserPool
TaskManagerUserPoolClient
```

Vì vậy không cần tạo Cognito thủ công bằng Console nếu dùng nguyên template này.

Nếu nhóm muốn tạo Cognito bằng Console thay vì IaC, cần chỉnh lại template theo một trong hai hướng:

1. Xóa/comment `TaskManagerUserPool` và `TaskManagerUserPoolClient`, sau đó thêm parameter `CognitoUserPoolArn`, `CognitoUserPoolId`, `CognitoAppClientId`.
2. Hoặc giữ Cognito trong template và chỉ dùng Console để **verify/chụp evidence**, không tạo thêm User Pool khác.

Khuyến nghị: với template hiện tại, hãy để IaC tạo Cognito rồi dùng Console chụp CO-1 và CO-2.

---

## 13. Ghi chú về Lambda code trong template

Template hiện dùng `InlineCode` cho 4 Lambda. Cách này giúp file tự chứa toàn bộ backend, dễ nộp và dễ review.

Nhược điểm:

- file YAML dài;
- sửa code Python trong YAML dễ sai indentation;
- khó test local nếu code lớn.

Nếu muốn chuyên nghiệp hơn, có thể chuyển sang `CodeUri`:

```yaml
GetTasksFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: ../backend/get_tasks/
    Handler: app.lambda_handler
```

Khi đó cấu trúc thư mục nên là:

```text
backend/
  get_tasks/app.py
  create_task/app.py
  update_task/app.py
  delete_task/app.py
infra/
  template.yaml
```

Với đồ án hiện tại, `InlineCode` vẫn chấp nhận được nếu nhóm muốn deploy nhanh và tránh lỗi đóng gói source.

---

## 14. Evidence liên quan trực tiếp đến template

Sau khi deploy template, có thể chụp các evidence sau:

| Evidence | Nơi kiểm tra |
|---|---|
| NE-1 | VPC > Endpoints > DynamoDB Endpoint `Available` |
| NE-2 | Lambda > Configuration > VPC có 2 private subnets + SG |
| NE-3 | VPC > Route Tables có dòng DynamoDB Prefix List -> VPCE |
| NE-4 | VPC > NAT Gateways trống hoặc Deleted |
| NE-5 | CloudWatch Logs Lambda gọi DynamoDB thành công |
| IM-1 | IAM > Roles có 4 role riêng |
| IM-2 | IAM Policy dùng ARN DynamoDB cụ thể |
| IM-3 | Lambda > Permissions gắn role đúng |
| CO-1 | Cognito User Pool đã tạo |
| CO-2 | API Gateway Authorizer gắn với User Pool |
| CO-3 | curl API không token trả 401 |
| CO-4 | curl API có token trả 200 |

SE-1 đến SE-4 thuộc S3/CloudFront, thường làm theo `console-guide.md`.

---

## 15. Troubleshooting nhanh

### Lỗi `DynamoDBPrefixListId` rỗng

Kiểm tra region:

```bash
aws configure get region
```

Chạy lại:

```bash
aws ec2 describe-managed-prefix-lists \
  --filters Name=prefix-list-name,Values=com.amazonaws.ap-southeast-1.dynamodb \
  --query 'PrefixLists[0].PrefixListId' \
  --output text
```

---

### API trả 401 dù đã gửi token

Kiểm tra:

```text
[ ] Token có phải ID token hoặc Access token hợp lệ không?
[ ] Header có đúng dạng Authorization: Bearer <token> không?
[ ] API Gateway method có Cognito Authorizer không?
[ ] Token thuộc đúng User Pool do template tạo không?
```

---

### API bị lỗi CORS

Kiểm tra:

```text
[ ] AllowedOrigin có đúng https://dxxxx.cloudfront.net không?
[ ] Không có dấu / ở cuối domain.
[ ] Đã sam deploy lại sau khi đổi AllowedOrigin chưa?
[ ] Browser đang mở bằng CloudFront URL, không phải file local.
```

Đúng:

```text
https://dxxxx.cloudfront.net
```

Sai:

```text
https://dxxxx.cloudfront.net/
*
http://localhost:3000
```

---

### Lambda timeout hoặc không gọi được DynamoDB

Kiểm tra:

```text
[ ] Lambda có VpcConfig chưa?
[ ] Lambda ở đúng private subnet chưa?
[ ] DynamoDB Gateway Endpoint Available chưa?
[ ] Route table của private subnet có pl-xxx -> vpce-xxx chưa?
[ ] Lambda Security Group outbound TCP 443 tới DynamoDB Prefix List chưa?
[ ] IAM role có quyền DynamoDB đúng action chưa?
```

---

### GET /tasks bị AccessDenied trên GSI

Role của `GetTasksFunction` phải có quyền trên cả table ARN và index ARN:

```text
arn:aws:dynamodb:<region>:<account-id>:table/TasksTable
arn:aws:dynamodb:<region>:<account-id>:table/TasksTable/index/userId-index
```

---

## 16. Cleanup sau khi bảo vệ

Nếu cần xóa stack:

```bash
sam delete --stack-name task-manager-project2
```

Hoặc:

```bash
aws cloudformation delete-stack --stack-name task-manager-project2
```

Trước khi xóa, kiểm tra kỹ:

```text
[ ] Đã nộp đủ screenshot evidence chưa?
[ ] Đã export/report source code chưa?
[ ] Đã quay video demo nếu cần chưa?
[ ] Có cần giữ DynamoDB data để demo lại không?
```

Sau khi xóa stack, vẫn cần xóa thủ công các phần tạo bằng Console nếu có:

```text
S3 bucket objects + bucket
CloudFront distribution
CloudFront OAC
AWS Budget
SNS topic/subscription
CloudWatch dashboard/alarms nếu tạo bằng Console
```

---

## 17. Tóm tắt lệnh thường dùng

```bash
# 1. Set region
aws configure set region ap-southeast-1

# 2. Get DynamoDB Prefix List ID
export AWS_REGION=$(aws configure get region)
export DDB_PREFIX_LIST_ID=$(aws ec2 describe-managed-prefix-lists \
  --filters Name=prefix-list-name,Values=com.amazonaws.${AWS_REGION}.dynamodb \
  --query 'PrefixLists[0].PrefixListId' \
  --output text)

# 3. Build
sam build --template-file template.yaml

# 4. First deploy
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name task-manager-project2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=task-manager-project2 \
    AllowedOrigin=https://CHANGE-ME.cloudfront.net \
    DynamoDBPrefixListId=${DDB_PREFIX_LIST_ID}

# 5. Show outputs
aws cloudformation describe-stacks \
  --stack-name task-manager-project2 \
  --query 'Stacks[0].Outputs' \
  --output table

# 6. Update CORS after CloudFront is ready
sam deploy \
  --stack-name task-manager-project2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    ProjectName=task-manager-project2 \
    AllowedOrigin=https://dxxxxxxxxxxxxx.cloudfront.net \
    DynamoDBPrefixListId=${DDB_PREFIX_LIST_ID}
```

---

## 18. Quan hệ với các file khác

| File | Vai trò |
|---|---|
| `template.yaml` | Mã IaC tạo hạ tầng lõi |
| `README-template.md` | Giải thích cấu trúc và cách cấu hình template |
| `README-deploy.md` | Runbook tổng thể: thứ tự IaC + Console |
| `console-guide.md` | Hướng dẫn thao tác Console cho phần thủ công và evidence |
| `evidence/` | Lưu screenshot/curl output nộp bài |

