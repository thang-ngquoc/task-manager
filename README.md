# 1. Project Structure

```bash
task-manager/
├── backend/                      # Backend Node.js app
│   ├── package.json
│   └── src/                      # Main backend source code
│       ├── handlers/             # Lambda handlers
│       ├── middleware/           # Express middlewares
│       ├── routes/               # Express routes
│       ├── scripts/              # DB setup scripts
│       ├── shared/               # Shared utilities
│       └── server.js             # Local express server
├── frontend/                     # Frontend React + Vite app
│   ├── public/                   # Public static files
│   ├── src/                      # Main frontend source code
│   │   ├── api/                  # API integrations
│   │   ├── auth/                 # AWS Cognito / Amplify auth setup
│   │   ├── components/           # Reusable UI components
│   │   ├── data/                 # Mock data for UI testing
│   │   ├── hooks/                # Custom React hooks (e.g. useAuth, useTasks)
│   │   ├── layouts/              # Shared layouts (AppLayout, AuthLayout, Header)
│   │   ├── lib/                  # Utility functions & constants
│   │   ├── pages/                # App views (Dashboard, Login, Confirm, etc.)
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   └── vite.config.js            # Vite configuration
├── infra/                        # Infrastructure-as-code & AWS setup
│   ├── console/                  # Console deployment guide
│   └── iac/                      # SAM/CloudFormation templates
├── docker-compose.yml            # Local development orchestration
└── README.md                     # Project overview and instructions
```

# 2. Setup and Run (Linux)

Follow these steps to set up and run the complete stack (Frontend, Backend, and DynamoDB Local) on your machine.

## Prerequisites
- **Node.js** (v18 or higher recommended)
- **Docker** & **Docker Compose** (for running DynamoDB locally)

---

## Step 1: Environment Variables Setup

You need to set up environment variables for both the backend and frontend from their respective `.env.example` templates. Replace the Cognito values with your actual user pool and app client IDs.

**Backend:**
```bash
cd backend
cp .env.example .env
```

```env
# Backend server configuration

PORT=3000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGIN=http://localhost:5173
AWS_REGION=ap-southeast-1

DYNAMODB_ENDPOINT=http://localhost:8000
ACCESS_KEY_ID=fake
SECRET_ACCESS_KEY=fake
TABLE_NAME=TasksTable

COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_CLIENT_ID=your-cognito-app-client-id
```

**Frontend:**
Open a new terminal or go back to the root, then set up the frontend env file:
```bash
cd frontend
cp .env.example .env
```

```env
# Frontend configuration

VITE_API_ENDPOINT=http://localhost:3000
VITE_COGNITO_POOL_ID=your-cognito-user-pool-id
VITE_COGNITO_CLIENT_ID=your-cognito-app-client-id
VITE_AWS_REGION=ap-southeast-1
```
---

## Step 2: Start DynamoDB Local

We use Docker to run DynamoDB locally. Make sure the data directory exists and has the correct permissions:

```bash
# From the project root

mkdir -p docker/dynamodb
sudo chmod -R 777 docker/dynamodb
```

Start the `dynamodb-local` and `dynamodb-admin` containers in the background:

```bash
docker compose up -d
```

- **DynamoDB Local API:** `http://localhost:8000`
- **DynamoDB Admin UI:** `http://localhost:8001` (Open in your browser to view tables and data visually)

### Docker Cheatsheet

Here are some helpful commands for managing your local DynamoDB setup:
- **View logs:** `docker logs dynamodb-local` (or `dynamodb-admin`)
- **Stop containers:** `docker compose down`
- **Stop and wipe database data:** `docker compose down -v`

---

## Step 3: Initialize Database & Run Backend

Next, install backend dependencies, create the database tables, and start the backend server.

```bash
cd backend
npm install

# Initialize table 
node src/scripts/createTasksTable.js

# Start the development server
npm run dev
```

The backend server will start listening at `http://localhost:3000` (or the port defined in your `.env`).

---

## Step 4: Run the Frontend

In a separate terminal window, navigate to the frontend directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port defined in your `.env`).

---

# 3. Infrastructure as Code and AWS Deployment

This project uses Infrastructure as Code (IaC) with **AWS SAM** and **AWS CloudFormation**. The main template is located at:

```bash
infra/iac/template.yaml
```

The SAM configuration file is located at:

```bash
infra/iac/samconfig.toml
```

## IaC Overview

The IaC stack provisions the core AWS infrastructure for the serverless Task Manager application:

- **VPC networking:** custom VPC, two private subnets, private route table, Lambda security group
- **Private AWS service access:** DynamoDB Gateway VPC Endpoint
- **Database:** DynamoDB table `TasksTable` with `userId-index` GSI
- **Authentication:** Amazon Cognito User Pool and web App Client
- **Backend API:** API Gateway REST API with Cognito Authorizer and CORS
- **Compute:** four AWS Lambda functions for task CRUD operations
  - `GET /tasks`
  - `POST /tasks`
  - `PUT /tasks/{id}`
  - `DELETE /tasks/{id}`
- **Security and operations:** least-privilege IAM roles, CloudWatch Log Groups, API throttling, optional Lambda reserved concurrency

The Lambda source code is packaged from `backend/` through the `CodeUri` values in the SAM template.

## Prerequisites

Install and configure the following tools before deploying:

- **AWS CLI**
- **AWS SAM CLI**
- **Node.js** v18 or higher
- An AWS account with permissions to create VPC, DynamoDB, Cognito, API Gateway, Lambda, IAM, and CloudWatch resources

Configure AWS credentials:

```bash
aws configure
```

Or use a named profile:

```bash
aws configure --profile your-profile-name
```

Verify the active identity:

```bash
aws sts get-caller-identity
```

With a named profile:

```bash
aws sts get-caller-identity --profile your-profile-name
```

## Step 1: Get DynamoDB Prefix List ID

The template restricts Lambda outbound traffic to the AWS-managed DynamoDB prefix list. Get the prefix list ID for your deployment region:

```bash
aws ec2 describe-managed-prefix-lists \
  --filters "Name=prefix-list-name,Values=com.amazonaws.ap-southeast-1.dynamodb" \
  --query "PrefixLists[0].PrefixListId" \
  --output text \
  --region ap-southeast-1
```

With a named profile:

```bash
aws ec2 describe-managed-prefix-lists \
  --profile your-profile-name \
  --filters "Name=prefix-list-name,Values=com.amazonaws.ap-southeast-1.dynamodb" \
  --query "PrefixLists[0].PrefixListId" \
  --output text \
  --region ap-southeast-1
```

Use the returned value for the `DynamoDBPrefixListId` parameter in `infra/iac/samconfig.toml` or in the deploy command.

## Step 2: Review Deployment Parameters

Open `infra/iac/samconfig.toml` and review the default deployment values:

```toml
stack_name = "task-manager-project2"
region = "ap-southeast-1"
capabilities = "CAPABILITY_IAM CAPABILITY_NAMED_IAM"
```

Important parameters:

- `ProjectName`: prefix for AWS resource names
- `AllowedOrigin`: frontend origin allowed by API Gateway CORS
- `DynamoDBPrefixListId`: AWS-managed DynamoDB prefix list ID for the selected region
- `TableName`: DynamoDB table name
- `EnableReservedConcurrency`: keep `false` if the AWS account has limited Lambda concurrency quota
- `ApiRateLimit` and `ApiBurstLimit`: API Gateway throttling settings

If the CloudFront or frontend URL changes, update `AllowedOrigin` and redeploy the stack.

## Step 3: Build the SAM Application

From the project root:

```bash
cd infra/iac
sam build
```

## Step 4: Deploy to AWS

Deploy using the saved configuration in `samconfig.toml`:

```bash
sam deploy
```

For the first deployment or when changing parameters interactively:

```bash
sam deploy --guided
```

If using a named AWS profile:

```bash
sam deploy --profile your-profile-name
```

SAM will create or update a CloudFormation stack and print the stack outputs after deployment.

## Step 5: Read Stack Outputs

After deployment, get the outputs with AWS CLI:

```bash
aws cloudformation describe-stacks \
  --stack-name task-manager-project2 \
  --query "Stacks[0].Outputs" \
  --output table \
  --region ap-southeast-1
```

With a named profile:

```bash
aws cloudformation describe-stacks \
  --profile your-profile-name \
  --stack-name task-manager-project2 \
  --query "Stacks[0].Outputs" \
  --output table \
  --region ap-southeast-1
```

Important outputs:

- `ApiUrl`: API Gateway endpoint for `VITE_API_ENDPOINT`
- `UserPoolId`: Cognito User Pool ID for frontend config
- `UserPoolClientId`: Cognito App Client ID for frontend config
- `DynamoDBTableName`: DynamoDB table name
- `VpcId`, `PrivateSubnetAId`, `PrivateSubnetBId`, `LambdaSecurityGroupId`: networking evidence for deployment reports

## Step 6: Configure Frontend for AWS Backend

Update `frontend/.env` with the deployed values:

```env
VITE_API_ENDPOINT=your-api-url
VITE_COGNITO_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-user-pool-client-id
VITE_AWS_REGION=ap-southeast-1
```

Then rebuild the frontend:

```bash
cd frontend
npm install
npm run build
```

Deploy the generated `frontend/dist` directory to the selected static hosting target, such as S3 + CloudFront:

```bash
aws s3 sync dist s3://your-frontend-bucket-name --delete
```

If the frontend is served through CloudFront and the browser still receives old files after uploading a new build, create a CloudFront invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id your-cloudfront-distribution-id \
  --paths "/*"
```

With a named profile:

```bash
aws cloudfront create-invalidation \
  --profile your-profile-name \
  --distribution-id your-cloudfront-distribution-id \
  --paths "/*"
```

After the CloudFront domain changes, update `AllowedOrigin` in the SAM stack and redeploy the backend stack.

## Useful AWS CLI Commands

Check CloudFormation stack events:

```bash
aws cloudformation describe-stack-events \
  --stack-name task-manager-project2 \
  --region ap-southeast-1
```

Check failed stack events:

```bash
aws cloudformation describe-stack-events \
  --stack-name task-manager-project2 \
  --query "StackEvents[?contains(ResourceStatus, 'FAILED')].[Timestamp,LogicalResourceId,ResourceType,ResourceStatus,ResourceStatusReason]" \
  --output table \
  --region ap-southeast-1
```

Delete the stack:

```bash
aws cloudformation delete-stack \
  --stack-name task-manager-project2 \
  --region ap-southeast-1

aws cloudformation wait stack-delete-complete \
  --stack-name task-manager-project2 \
  --region ap-southeast-1
```
