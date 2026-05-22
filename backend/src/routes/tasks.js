const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const getTasks = require('../handlers/getTasks');
const createTask = require('../handlers/createTask');
const updateTask = require('../handlers/updateTask');
const deleteTask = require('../handlers/deleteTask');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getTasks.handler);
router.post('/', createTask.handler);
router.put('/:id', updateTask.handler);
router.delete('/:id', deleteTask.handler);

module.exports = router;