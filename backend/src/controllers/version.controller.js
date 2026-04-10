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

function _slimVersionRow(v) {
  return {
    id: v.id,
    versionNumber: v.versionNumber,
    createdAt: v.createdAt,
    changedBy: v.changedBy,
  };
}

// GET /api/contracts/:id/versions/compare?from=&to=
async function diffVersions(req, res, next) {
  try {
    const { from, to } = req.validatedQuery;
    const result = await versionService.diffVersions(req.params.id, from, to, req.user);
    sendSuccess(res, {
      data: {
        from: _slimVersionRow(result.from),
        to: _slimVersionRow(result.to),
        changes: result.changes,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listVersions, getVersion, diffVersions };
