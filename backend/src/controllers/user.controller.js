'use strict';

const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

async function list(_req, res, next) {
  try {
    const users = await userService.listUsers();
    sendSuccess(res, { data: users });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
