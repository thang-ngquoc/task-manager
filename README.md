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
