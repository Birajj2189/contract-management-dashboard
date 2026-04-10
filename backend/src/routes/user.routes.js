'use strict';

const { Router } = require('express');
const authenticate = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const {
  listUsersQuerySchema,
  updateUserSchema,
  createUserByAdminSchema,
} = require('../validators/user.validator');
const controller = require('../controllers/user.controller');

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', validate(listUsersQuerySchema, 'query'), controller.list);
router.post('/', validate(createUserByAdminSchema), controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', validate(updateUserSchema), controller.update);

module.exports = router;
