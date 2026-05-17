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

Setting up DynamoDB locally allows you to develop and test backend APIs without provisioning AWS resources.

---

### 1. Install Docker

Install Docker:

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
```

Start and enable Docker:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

Verify installation:

```bash
docker --version
docker compose version
```

---

### 2. Project Structure

Create the `docker/dynamodb` folder with proper permissions:

```bash
mkdir -p docker/dynamodb
sudo chmod -R 777 docker/dynamodb
```

Make sure your project contains the following structure:

```bash
task-manager/
├── backend/
├── frontend/
├── docker/
│   └── dynamodb/
├── docker-compose.yml
└── .gitignore
```

The `docker/dynamodb` folder is used to persist DynamoDB Local data.

---

### 3. Start DynamoDB Local + Admin UI

Run both containers:

```bash
docker compose up -d
```

Verify containers:

```bash
docker ps
```

You should see:

- `dynamodb-local`
- `dynamodb-admin`

---

### 4. Access DynamoDB

#### DynamoDB Local Endpoint

```txt
http://localhost:8000
```

#### DynamoDB Admin UI

Open in browser:

```txt
http://localhost:8001
```

The admin UI allows you to:

- View tables
- Insert / edit / delete items
- Scan table data
- Inspect records visually

---

### 5. Stop / Restart Containers

#### Stop containers

```bash
docker compose down
```

#### Restart containers

```bash
docker compose up -d
```

---

### 6. Initialize Database Tables

Run the setup scripts:

```bash
cd backend

node src/scripts/createTasksTable.js
node src/scripts/seedTasksData.js
```

These scripts will:

- Create the `TasksTable`
- Create the `userId-index` GSI
- Seed mock task data

---

### 7. Common Commands

#### View running containers

```bash
docker ps
```

#### View container logs

```bash
docker logs dynamodb-local
docker logs dynamodb-admin
```

#### Remove all containers

```bash
docker compose down
```

#### Remove containers + volumes

```bash
docker compose down -v
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