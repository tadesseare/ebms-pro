import { prisma } from "../prisma/client.js";import prisma from "../Lib/prisma.js";

/**
 * DASHBOARD SUMMARY (KPIs)
 * - Total Sales Today
 * - Total Purchases Today
 * - Total Inventory Items
 * - Low Stock Count
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Daily Sales
    const dailySales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } }
    });

    const dailySalesTotal = dailySales.reduce(
      (sum, s) => sum + s.quantity * s.pricePerUnit,
      0
    );

    // Daily Purchases
    const dailyPurchases = await prisma.purchase.findMany({
      where: { createdAt: { gte: start, lte: end } }
    });

    const dailyPurchaseTotal = dailyPurchases.reduce(
      (sum, p) => sum + p.quantity * p.costPerUnit,
      0
    );

    // Inventory Summary
    const inventory = await prisma.inventory.count();

    // Low Stock
    const lowStockCount = await prisma.inventory.count({
      where: { quantity: { lt: 5 } }
    });

    res.json({
      dailySalesTotal,
      dailyPurchaseTotal,
      inventoryCount: inventory,
      lowStockCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DAILY SALES REPORT
 */
export const getDailySalesReport = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { product: true, customer: true }
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DAILY PURCHASE REPORT
 */
export const getDailyPurchaseReport = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const purchases = await prisma.purchase.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { product: true, supplier: true }
    });

    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * INVENTORY SUMMARY
 */
export const getInventorySummary = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: { product: true }
    });

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * LOW STOCK REPORT
 */
export const getLowStockReport = async (req, res) => {
  try {
    const lowStock = await prisma.inventory.findMany({
      where: { quantity: { lt: 5 } },
      include: { product: true }
    });

    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PROFIT REPORT
 * Revenue = sum(sales)
 * Cost = sum(purchases)
 * Profit = Revenue - Cost
 */
export const getProfitReport = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany();
    const purchases = await prisma.purchase.findMany();

    const revenue = sales.reduce(
      (sum, s) => sum + s.quantity * s.pricePerUnit,
      0
    );

    const cost = purchases.reduce(
      (sum, p) => sum + p.quantity * p.costPerUnit,
      0
    );

    const profit = revenue - cost;

    res.json({ revenue, cost, profit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

