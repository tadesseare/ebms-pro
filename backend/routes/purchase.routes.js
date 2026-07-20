import { Router } from "express";
import {
  getPurchases,
  createPurchase,
  getPurchaseById,
  deletePurchase
} from "../controllers/purchase.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize("admin","manager"), getPurchases);
router.post("/", authenticate, authorize("admin","manager"), createPurchase);
router.get("/:id", authenticate, authorize("admin","manager"), getPurchaseById);
router.delete("/:id", authenticate, authorize("admin"), deletePurchase);

export default router;

