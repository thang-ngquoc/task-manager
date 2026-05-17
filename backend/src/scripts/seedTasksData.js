const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const { docClient } = require("../shared/dynamodb");

const users = [
    "user01",
    "user02",
    "user03"
];

const titles = [
    "Finish cloud report",
    "Deploy frontend",
    "Fix Lambda timeout",
    "Update API Gateway routes",
    "Configure Cognito",
    "Write project documentation",
    "Optimize DynamoDB query",
    "Create architecture diagram",
    "Implement task filtering",
    "Fix CORS issue",
    "Add loading spinner",
    "Test CRUD endpoints",
    "Configure CloudWatch alarms",
    "Create IAM roles",
    "Seed DynamoDB data",
    "Refactor backend structure",
    "Prepare presentation slides",
    "Review teammate code",
    "Debug authentication flow",
    "Implement task status update"
];

const priorities = ["low", "medium", "high"];

const statuses = ["pending", "done"];

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomFutureDate() {
    const today = new Date();

    const future = new Date(
        today.getTime() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000
    );

    return future.toISOString().split("T")[0];
}

function createMockTask() {
    const title = randomItem(titles);

    return {
        taskId: uuidv4(),

        userId: randomItem(users),

        title,

        description: `${title} description`,

        priority: randomItem(priorities),

        dueDate: randomFutureDate(),

        status: randomItem(statuses),

        createdAt: new Date().toISOString()
    };
}

async function seedData() {
    try {
        const totalTasks = 50;

        for (let i = 0; i < totalTasks; i++) {
            const task = createMockTask();

            const command = new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: task
            });

            await docClient.send(command);

            console.log(
                `[${i + 1}/${totalTasks}] Seeded: ${task.title}`
            );
        }

        console.log("Seed data completed");
    } catch (error) {
        console.error("Seed error:", error);
    }
}

seedData();