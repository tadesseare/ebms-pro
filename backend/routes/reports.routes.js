import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getDailySalesReport,
  getDailyPurchaseReport,
  getInventorySummary,
  getLowStockReport,
  getProfitReport,
  getDashboardSummary
} from "../controllers/reports.controller.js";

const router = Router();

// Dashboard KPIs
router.get(
  "/dashboard-summary",
  authenticate,
  authorize("admin", "manager"),
  getDashboardSummary
);

// Sales Reports
router.get(
  "/sales/daily",
  authenticate,
  authorize("admin", "manager"),
  getDailySalesReport
);

// Purchase Reports
router.get(
  "/purchases/daily",
  authenticate,
  authorize("admin", "manager"),
  getDailyPurchaseReport
);

// Inventory Reports
router.get(
  "/inventory/summary",
  authenticate,
  authorize("admin", "manager", "staff"),
  getInventorySummary
);

router.get(
  "/inventory/low-stock",
  authenticate,
  authorize("admin", "manager", "staff"),
  getLowStockReport
);

// Profit Report
router.get(
  "/profit",
  authenticate,
  authorize("admin", "manager"),
  getProfitReport
);

export default router;

