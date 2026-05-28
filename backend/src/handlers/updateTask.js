const { docClient } = require("../shared/dynamodb");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");

require("dotenv").config();

exports.handler = async (req, res) => {
    try {
        const taskId = req.params.id;

        const {
            title,
            description,
            priority,
            dueDate,
            status,
        } = req.body;

        const updates = [];
        const values = {};
        const names = {};

        if (title !== undefined) {
            updates.push("title = :title");
            values[":title"] = title;
        }

        if (description !== undefined) {
            updates.push("description = :description");
            values[":description"] = description;
        }

        if (priority !== undefined) {
            updates.push("priority = :priority");
            values[":priority"] = priority;
        }

        if (dueDate !== undefined) {
            updates.push("dueDate = :dueDate");
            values[":dueDate"] = dueDate;
        }

        if (status !== undefined) {
            updates.push("#status = :status");
            values[":status"] = status;
            names["#status"] = "status";
        }

        if (updates.length === 0) {
            return res.status(400).json({
                message: "No fields to update",
            });
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

        return res.status(200).json({
            message: "Task updated successfully",
            data: result.Attributes,
        });

    } catch (error) {

        console.error(error);

        if (error.name === "ConditionalCheckFailedException") {
            return res.status(403).json({
                message: "You do not have permission to update this task",
            });
        }

        return res.status(500).json({
            message: "Failed to update task",
            error: error.message,
        });
    }
};