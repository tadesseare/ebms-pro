import { Router } from "express";
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize("admin","manager","staff"), getInventory);
router.post("/", authenticate, authorize("admin","manager"), createInventory);
router.put("/:id", authenticate, authorize("admin","manager"), updateInventory);
router.delete("/:id", authenticate, authorize("admin"), deleteInventory);

export default router;

