const express = require('express');

const getTasks = require('../handlers/getTasks');
const createTask = require('../handlers/createTask');
const updateTask = require('../handlers/updateTask');

const router = express.Router();

router.get('/', getTasks.handler);
router.post('/', createTask.handler);
router.put('/:id', updateTask.handler);

module.exports = router;