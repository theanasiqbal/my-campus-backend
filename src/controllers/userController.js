const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  // Register new user
  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await userService.register(req.body);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Login with phone
  async loginWithPhone(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone } = req.body;
      const user = await userService.loginWithPhone(phone);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Login with email
  async loginWithEmail(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const user = await userService.loginWithEmail(email);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Check if phone exists
  async checkPhone(req, res, next) {
    try {
      const { phone } = req.params;
      const result = await userService.checkPhoneExists(phone);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.updateProfile(id, req.body);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();