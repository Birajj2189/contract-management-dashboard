'use strict';

const contractService = require('../services/contract.service');
const { sendSuccess } = require('../utils/response');

// ─────────────────────────────────────────────
// GET /api/contracts
// ─────────────────────────────────────────────
async function list(req, res, next) {
  try {
    // req.validatedQuery is set by the validate() middleware when target='query'
    // (Express 5 makes req.query a read-only getter)
    const { contracts, meta } = await contractService.listContracts(req.validatedQuery, req.user);
    sendSuccess(res, { data: { contracts }, meta });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/contracts/:id
// ─────────────────────────────────────────────
async function getOne(req, res, next) {
  try {
    const contract = await contractService.getContract(req.params.id, req.user);
    sendSuccess(res, { data: { contract } });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/contracts
// ─────────────────────────────────────────────
async function create(req, res, next) {
  try {
    const contract = await contractService.createContract(req.body, req.user);
    sendSuccess(res, { data: { contract }, status: 201 });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// PUT /api/contracts/:id
// ─────────────────────────────────────────────
async function update(req, res, next) {
  try {
    const { contract, previousStatus } = await contractService.updateContract(
      req.params.id,
      req.body,
      req.user
    );
    sendSuccess(res, { data: { contract, previousStatus } });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// DELETE /api/contracts/:id
// ─────────────────────────────────────────────
async function softDelete(req, res, next) {
  try {
    await contractService.deleteContract(req.params.id, req.user);
    sendSuccess(res, { data: null });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, softDelete };
