const { docClient } = require('../shared/dynamodb');
const { UpdateCommand } =  require('@aws-sdk/lib-dynamodb')

require('dotenv').config();

exports.handler = async (req, res) => {
    try {
        const taskId = req.params.id;
        const {
            title,
            description,
            priority,
            dueDate,
            status
        } = req.body;

        if (!taskId) {
            return res.status(400).json({
                message: "taskId is required",
            })
        }

        await docClient.send(
            new UpdateCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    taskId: taskId,
                },

                UpdateExpression: `
                    SET
                        title = :title,
                        description = :description,
                        priority = :priority,
                        dueDate = :dueDate,
                        #status = :status
                `,

                ExpressionAttributeValues: {
                    ":title": title,
                    ":description": description,
                    ":priority": priority,
                    ":dueDate": dueDate,
                    ":status": status,
                },

                ExpressionAttributeNames: {
                    "#status": "status",
                },

                ReturnValues: "ALL_NEW",
            })
        )

        return res.status(200).json({
            message: "Task updated successfully"
        })

    } catch (error) {
        console.log(`Error updating task: ${error}`);
        
        res.status(500).json({
            message: "Failed to update task",
            error: error.message
        });
    }
}