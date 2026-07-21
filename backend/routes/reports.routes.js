import { Router } from "express";

import {
  getDashboardSummary,
  getDailySalesReport,
  getDailyPurchaseReport,
  getInventorySummary,
  getLowStockReport,
  getProfitReport,
} from "../controllers/reports.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

/*
 * Executive report summary
 */
router.get(
  "/dashboard-summary",
  authenticate,
  authorize("admin", "manager"),
  getDashboardSummary
);

/*
 * Daily sales report
 */
router.get(
  "/sales/daily",
  authenticate,
  authorize("admin", "manager"),
  getDailySalesReport
);

/*
 * Daily purchase report
 */
router.get(
  "/purchases/daily",
  authenticate,
  authorize("admin", "manager"),
  getDailyPurchaseReport
);

/*
 * Inventory summary
 */
router.get(
  "/inventory/summary",
  authenticate,
  authorize("admin", "manager", "staff"),
  getInventorySummary
);

/*
 * Low-stock report
 */
router.get(
  "/inventory/low-stock",
  authenticate,
  authorize("admin", "manager", "staff"),
  getLowStockReport
);

/*
 * Revenue, expenses, and profit
 */
router.get(
  "/profit",
  authenticate,
  authorize("admin", "manager"),
  getProfitReport
);

export default router;