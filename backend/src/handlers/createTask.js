const { docClient } = require('../shared/dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

exports.handler = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { 
            title, 
            description,
            priority = "medium",
            dueDate,
            status = "pending",  
        } = req.body;

        if (!userId || !title) {
            return res.status(400).json({
                message: "userId and title are required fields",
            });
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

        res.status(201).json({
            message: 'Task created successfully',
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
        });
    } catch (error) {
        console.log("Error creating task:", error);
        res.status(500).json({
            message: "Failed to create task",
            error: error.message,
        })
    }
};