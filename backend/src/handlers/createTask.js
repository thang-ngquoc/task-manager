const { docClient } = require('../shared/dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');
const { jsonResponse, parseJsonBody, getUserId } = require("../shared/lambda");

require("dotenv").config();

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === "";
}

function logDynamoStatus(operation, result) {
    console.log(`DynamoDB ${operation} status:`, result?.$metadata?.httpStatusCode);
}

function logValidationFailure(reason, details = {}) {
    console.error(new Error(`Validation failed in createTask: ${reason}`), details);
}

async function createTask({ userId, body }) {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            status = "pending",
        } = body;

        if (!userId) {
            logValidationFailure("missing userId");
            return {
                statusCode: 400,
                payload: {
                    message: "userId is required",
                },
            };
        }

        if (isBlank(title) || isBlank(priority) || isBlank(dueDate)) {
            logValidationFailure("missing required fields", {
                hasTitle: !isBlank(title),
                hasPriority: !isBlank(priority),
                hasDueDate: !isBlank(dueDate),
            });
            return {
                statusCode: 400,
                payload: {
                    message: "Title, priority and dueDate are required",
                },
            };
        }

        const taskId = randomUUID();
        const createdAt = new Date().toISOString();

        const result = await docClient.send(
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
        logDynamoStatus("PutItem", result);

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
        console.error("Error creating task:", error);
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
