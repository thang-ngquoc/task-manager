# 1. Project Structure

```bash
task-manager/
├── frontend/                     # Frontend React + Vite app
│   ├── public/                   # Public static files
│   │   └── favicon.ico           # Website favicon
│   │
│   ├── src/                      # Main frontend source code
│   │   ├── api/                  # Backend API calls
│   │   │   └── tasksApi.js       # Axios wrapper for calling API Gateway
│   │   │
│   │   ├── auth/                 # Authentication handling with Cognito
│   │   │   ├── AuthContext.jsx   # Global auth state + JWT context
│   │   │   └── cognito.js        # Cognito / Amplify configuration
│   │   │
│   │   ├── components/           # Reusable UI components
│   │   │   ├── TaskList.jsx      # Displays the list of tasks
│   │   │   ├── TaskCard.jsx      # UI for individual task items
│   │   │   ├── TaskForm.jsx      # Form for creating / editing tasks
│   │   │   ├── FilterBar.jsx     # Filters by priority / due date
│   │   │   ├── LoginForm.jsx     # Login form
│   │   │   └── SignUpForm.jsx    # Account registration form
│   │   │
│   │   ├── pages/                # Page components for routing
│   │   │   ├── HomePage.jsx      # Main task management page
│   │   │   └── AuthPage.jsx      # Login / signup page
│   │   │
│   │   ├── App.jsx               # Root component + routing setup
│   │   ├── main.jsx              # Entry point for rendering the React app
│   │   └── index.css             # Global CSS styles
│   │
│   ├── .env.example              # Environment variables template (API URL, Cognito IDs...)
│   ├── vite.config.js            # Vite configuration
│   └── package.json              # Dependencies + npm scripts
│
└── backend/                      # Backend Node.js app
    ├── src/                      # Main backend source code
    │   ├── shared/               # Shared helper functions
    │   │   ├── dynamodb.js       # DynamoDB DocumentClient initialization
    │   │   ├── response.js       # Helper for creating standard JSON responses
    │   │   └── auth.js           # JWT/Cognito processing helper (if needed)
    │   │
    │   ├── handlers/             # Main Lambda handlers
    │   │   ├── getTasks.js       # GET /tasks
    │   │   ├── createTask.js     # POST /tasks
    │   │   ├── updateTask.js     # PUT /tasks/:id
    │   │   └── deleteTask.js     # DELETE /tasks/:id
    │   │
    │   ├── routes/               # Express local server routes
    │   │   └── tasks.js          # URL mapping to handlers
    │   │
    │   └── local-server.js       # Express server for local development
    │
    ├── package.json              # Dependencies + npm scripts
    ├── .env                      # Local environment variables
    └── template.yaml             # AWS SAM/IaC configuration (optional)
```

# 2. Setup and Run

## DynamoDB Local Setup (Linux / WSL)

Setting up DynamoDB locally allows you to test database interactions without provisioning resources on AWS.

### 1. Install Docker

If you haven't installed Docker yet, run the following commands:

```bash
sudo apt update
sudo apt install docker.io -y

sudo systemctl start docker
sudo systemctl enable docker
```

Verify the installation:

```bash
docker --version
```

### 2. Run DynamoDB Local

Launch a DynamoDB local container in the background (first time):

```bash
docker run -d \
  --name dynamodb-local \
  -p 8000:8000 \
  amazon/dynamodb-local
```

Verify that the container is running:

```bash
docker ps
```

### 3. Install & Run DynamoDB Admin UI

To easily visualize and manage your local database, install the dynamodb-admin tool.

```bash
npm install -g dynamodb-admin
```

Start the admin interface:

```bash
DYNAMO_ENDPOINT=http://localhost:8000 \
AWS_REGION=local \
AWS_ACCESS_KEY_ID=fake \
AWS_SECRET_ACCESS_KEY=fake \
dynamodb-admin
```

Once running, open your browser and navigate to: `http://localhost:8001`

### 4. Managing the Database Container

If you need to stop or start the database later on:

- **Stop:**
  ```bash
  docker stop dynamodb-local
  ```

- **Start (after PC restart):**
  ```bash
  sudo systemctl start docker
  docker start dynamodb-local
  ```

### 5. Initialize DynamoDB Table

First, navigate to the backend directory, then run the database setup script to create the necessary tables for tasks:

```bash
cd backend
node src/scripts/db.js
```

## Running the Backend 
Before running the backend, ensure that your `.env` file is properly configured with the correct DynamoDB endpoint and credentials (as shown in the example above).

```bash
PORT=3000
AWS_REGION="local"
DYNAMODB_ENDPOINT="http://localhost:8000"
ACCESS_KEY_ID="fake"
SECRET_ACCESS_KEY="fake"
TABLE_NAME="TasksTable"
```

To run the backend locally, use the following command in the root directory:

```bash
cd backend
npm install
npm run dev
```