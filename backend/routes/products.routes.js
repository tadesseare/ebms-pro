import { Router } from "express";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "staff"),
  getProducts
);

router.post(
  "/",
  authenticate,
  authorize("admin", "manager"),
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteProduct
);

export default router;
