import { Router } from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema } from "../validation/user.validation.js";

const router = Router();

/**
 * Admin-only test route
 * Useful for checking RBAC quickly
 */
router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Admin only content" });
});

/**
 * Create a new user
 * Only admins can create users
 * Includes validation
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createUserSchema),
  createUser
);

/**
 * Get all users
 * Admin-only
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getUsers
);

/**
 * Get a single user by ID
 * Admin-only
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getUserById
);

/**
 * Update a user's role
 * Admin-only
 */
router.put(
  "/:id/role",
  authenticate,
  authorize("admin"),
  updateUserRole
);

/**
 * Delete a user
 * Admin-only
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteUser
);

export default router;



