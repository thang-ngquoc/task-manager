const express = require('express');

const getTasks = require('../handlers/getTasks');
const createTask = require('../handlers/createTask');

const router = express.Router();

router.get('/', getTasks.handler);
router.post('/', createTask.handler);

module.exports = router;