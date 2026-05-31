const { docClient } = require('../shared/dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { jsonResponse, parseJsonBody, getUserId } = require("../shared/lambda");

require("dotenv").config();

async function createTask({ userId, body }) {
    try {
        const {
            title,
            description,
            priority = "medium",
            dueDate,
            status = "pending",
        } = body;

        if (!userId || !title) {
            return {
                statusCode: 400,
                payload: {
                    message: "userId and title are required fields",
                },
            };
        }

        const taskId = uuidv4();
        const createdAt = new Date().toISOString();

        await docClient.send(
            new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: {
                    taskId: taskId,
                    userId: userId,
                    title: title,
                    description: description,
                    priority: priority,
                    dueDate: dueDate,
                    status: status,
                    createdAt: createdAt,
                },
            })
        );

        return {
            statusCode: 201,
            payload: {
                message: "Task created successfully",
                data: {
                    taskId,
                    userId,
                    title,
                    description,
                    priority,
                    dueDate,
                    status,
                    createdAt,
                },
            },
        };
    } catch (error) {
        console.log("Error creating task:", error);
        return {
            statusCode: 500,
            payload: {
                message: "Failed to create task",
                error: error.message,
            },
        };
    }
}

exports.handler = async (req, res) => {
    const result = await createTask({
        userId: req.user?.sub,
        body: req.body || {},
    });

    return res.status(result.statusCode).json(result.payload);
};

exports.lambdaHandler = async (event) => {
    const result = await createTask({
        userId: getUserId(event),
        body: parseJsonBody(event),
    });

    return jsonResponse(result.statusCode, result.payload);
};