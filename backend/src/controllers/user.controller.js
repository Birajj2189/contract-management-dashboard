'use strict';

const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const { users, meta } = await userService.listUsers(req.validatedQuery);
    sendSuccess(res, { data: { users }, meta });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.createUserByAdmin(req.body, req.user);
    sendSuccess(res, { data: { user }, status: 201 });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, update, create };
