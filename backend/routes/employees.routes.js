import express from "express";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employees.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Admin, Manager, and Staff can view employees
router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "staff"),
  getEmployees
);

// Only Admin and Manager can create employees
router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  createEmployee
);

// Only Admin and Manager can edit employees
router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  updateEmployee
);

// Only Admin can delete employees
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteEmployee
);

export default router;
