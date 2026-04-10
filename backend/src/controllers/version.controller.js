'use strict';

const versionService = require('../services/version.service');
const { sendSuccess } = require('../utils/response');

// GET /api/contracts/:id/versions
async function listVersions(req, res, next) {
  try {
    const versions = await versionService.listVersions(req.params.id, req.user);
    sendSuccess(res, { data: { versions } });
  } catch (err) {
    next(err);
  }
}

// GET /api/contracts/:id/versions/:versionId
async function getVersion(req, res, next) {
  try {
    const version = await versionService.getVersion(
      req.params.id,
      req.params.versionId,
      req.user
    );
    sendSuccess(res, { data: { version } });
  } catch (err) {
    next(err);
  }
}

module.exports = { listVersions, getVersion };
