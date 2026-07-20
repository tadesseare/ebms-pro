import { Router } from "express";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "../controllers/suppliers.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize("admin","manager","staff"), getSuppliers);
router.post("/", authenticate, authorize("admin","manager"), createSupplier);
router.put("/:id", authenticate, authorize("admin","manager"), updateSupplier);
router.delete("/:id", authenticate, authorize("admin"), deleteSupplier);

export default router;

