import { Router } from "express";
import {
  getSales,
  createSale,
  getSaleById,
  deleteSale
} from "../controllers/sales.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize("admin","manager","staff"), getSales);
router.post("/", authenticate, authorize("admin","manager","staff"), createSale);
router.get("/:id", authenticate, authorize("admin","manager","staff"), getSaleById);
router.delete("/:id", authenticate, authorize("admin"), deleteSale);

export default router;


