'use strict';

const { Router } = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createContractSchema,
  updateContractSchema,
  listContractsQuerySchema,
} = require('../validators/contract.validator');
const controller = require('../controllers/contract.controller');

// Version and audit controllers are required lazily here to avoid circular
// dependency issues during initial wiring; they will be populated in a later step.
const versionController = require('../controllers/version.controller');
const auditController = require('../controllers/audit.controller');

const router = Router();

// All contract routes require authentication
router.use(authenticate);

// ── Contract CRUD ─────────────────────────────────────────────────────────────
router.get('/', validate(listContractsQuerySchema, 'query'), controller.list);
router.post('/', validate(createContractSchema), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', validate(updateContractSchema), controller.update);
router.delete('/:id', controller.softDelete);

// ── Version history ───────────────────────────────────────────────────────────
router.get('/:id/versions', versionController.listVersions);
router.get('/:id/versions/:versionId', versionController.getVersion);

// ── Activity timeline (audit log) ─────────────────────────────────────────────
router.get('/:id/audit', auditController.getContractAudit);

module.exports = router;
