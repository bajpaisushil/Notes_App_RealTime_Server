import express from 'express';
import { check } from 'express-validator';
import { updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Update user profile
router.put(
  '/profile',
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 })
  ],
  protect,
  updateUserProfile
);

export default router;