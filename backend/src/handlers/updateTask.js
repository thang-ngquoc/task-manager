const { docClient } = require("../shared/dynamodb");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { jsonResponse, parseJsonBody, getUserId } = require("../shared/lambda");

require("dotenv").config();

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === "";
}

function logDynamoStatus(operation, result) {
    console.log(`DynamoDB ${operation} status:`, result?.$metadata?.httpStatusCode);
}

async function updateTask({ userId, taskId, body }) {
    try {
        if (!userId) {
            return {
                statusCode: 400,
                payload: {
                    message: "userId is required",
                },
            };
        }

        if (!taskId) {
            return {
                statusCode: 400,
                payload: {
                    message: "Task ID is required",
                },
            };
        }

        const {
            title,
            description,
            priority,
            dueDate,
            status,
        } = body;

        const updates = [];
        const values = {};
        const names = {};

        if (title !== undefined) {
            if (isBlank(title)) {
                return {
                    statusCode: 400,
                    payload: {
                        message: "title cannot be empty",
                    },
                };
            }

            updates.push("title = :title");
            values[":title"] = title;
        }

        if (description !== undefined) {
            updates.push("description = :description");
            values[":description"] = description;
        }

        if (priority !== undefined) {
            if (isBlank(priority)) {
                return {
                    statusCode: 400,
                    payload: {
                        message: "priority cannot be empty",
                    },
                };
            }

            updates.push("priority = :priority");
            values[":priority"] = priority;
        }

        if (dueDate !== undefined) {
            if (isBlank(dueDate)) {
                return {
                    statusCode: 400,
                    payload: {
                        message: "dueDate cannot be empty",
                    },
                };
            }

            updates.push("dueDate = :dueDate");
            values[":dueDate"] = dueDate;
        }

        if (status !== undefined) {
            updates.push("#status = :status");
            values[":status"] = status;
            names["#status"] = "status";
        }

        if (updates.length === 0) {
            return {
                statusCode: 400,
                payload: {
                    message: "No fields to update",
                },
            };
        }

        values[":uid"] = userId;

        const UpdateExpression = `SET ${updates.join(", ")}`;

        const result = await docClient.send(
            new UpdateCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    taskId,
                },
                UpdateExpression,
                ExpressionAttributeValues: values,
                ExpressionAttributeNames:
                    Object.keys(names).length > 0
                        ? names
                        : undefined,
                ConditionExpression: "userId = :uid",
                ReturnValues: "ALL_NEW",
            })
        );
        logDynamoStatus("UpdateItem", result);

        return {
            statusCode: 200,
            payload: {
                message: "Task updated successfully",
                data: result.Attributes,
            },
        };
    } catch (error) {
        console.error(error);

        if (error.name === "ConditionalCheckFailedException") {
            return {
                statusCode: 403,
                payload: {
                    message: "You do not have permission to update this task",
                },
            };
        }

        return {
            statusCode: 500,
            payload: {
                message: "Failed to update task",
                error: error.message,
            },
        };
    }
}

exports.handler = async (req, res) => {
    const result = await updateTask({
        userId: req.user?.sub,
        taskId: req.params.id,
        body: req.body || {},
    });

    return res.status(result.statusCode).json(result.payload);
};

exports.lambdaHandler = async (event) => {
    const result = await updateTask({
        userId: getUserId(event),
        taskId: event?.pathParameters?.id,
        body: parseJsonBody(event),
    });

    return jsonResponse(result.statusCode, result.payload);
};
