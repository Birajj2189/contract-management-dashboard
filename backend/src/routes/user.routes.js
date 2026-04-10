'use strict';

const { Router } = require('express');
const authenticate = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const controller = require('../controllers/user.controller');

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', controller.list);

module.exports = router;
