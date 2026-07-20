import { Router } from "express";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customers.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "staff"),
  getCustomers
);

router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  createCustomer
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  updateCustomer
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteCustomer
);

export default router;
