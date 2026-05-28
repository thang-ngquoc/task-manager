# Setup and Run

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

## Running the Frontend
To run the frontend, use the following command in the root directory:

```bash
cd frontend
npm install
npm run dev
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

## Testing the Backend Locally via cURL

You can test the backend API using `curl`. Here are some examples:

### Get all tasks

```bash
curl http://localhost:3000/tasks
```

### Create a new task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "This is a test task from curl", "userId": "user123"}'
```

### Update a task

```bash
curl -X PUT http://localhost:3000/tasks/<task-id> \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Task", "status": "completed"}'
```

### Delete a task

```bash
curl -X DELETE http://localhost:3000/tasks/<task-id>
```