import prisma from "../Lib/prisma.js";

const LOW_STOCK_LIMIT = 10;

const getTodayRange = () => {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  return { start, end };
};

const getSalePrice = (sale) => {
  return Number(
    sale.pricePerUnit ??
      sale.price ??
      sale.product?.price ??
      0
  );
};

const getPurchaseCost = (purchase) => {
  return Number(
    purchase.costPerUnit ??
      purchase.price ??
      0
  );
};

/**
 * DASHBOARD SUMMARY
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const [
      dailySales,
      dailyPurchases,
      inventory,
      lowStockCount,
      outOfStockCount,
      totalSalesCount,
      totalPurchasesCount,
    ] = await Promise.all([
      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          product: true,
        },
      }),

      prisma.purchase.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),

      prisma.inventory.findMany({
        include: {
          product: true,
        },
      }),

      prisma.inventory.count({
        where: {
          quantity: {
            gt: 0,
            lte: LOW_STOCK_LIMIT,
          },
        },
      }),

      prisma.inventory.count({
        where: {
          quantity: 0,
        },
      }),

      prisma.sale.count(),

      prisma.purchase.count(),
    ]);

    const dailySalesTotal = dailySales.reduce(
      (sum, sale) =>
        sum +
        Number(sale.quantity) *
          getSalePrice(sale),
      0
    );

    const dailyPurchaseTotal =
      dailyPurchases.reduce(
        (sum, purchase) =>
          sum +
          Number(purchase.quantity) *
            getPurchaseCost(purchase),
        0
      );

    const totalInventoryUnits = inventory.reduce(
      (sum, item) =>
        sum + Number(item.quantity),
      0
    );

    const inventoryValue = inventory.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity) *
          Number(item.product?.price || 0),
      0
    );

    res.json({
      dailySalesTotal,
      dailyPurchaseTotal,
      dailyProfit:
        dailySalesTotal - dailyPurchaseTotal,

      inventoryCount: inventory.length,
      totalInventoryUnits,
      inventoryValue,

      lowStockCount,
      outOfStockCount,

      totalSalesCount,
      totalPurchasesCount,
    });
  } catch (err) {
    console.error(
      "REPORT DASHBOARD SUMMARY ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to load report summary.",
    });
  }
};

/**
 * DAILY SALES REPORT
 */
export const getDailySalesReport = async (
  req,
  res
) => {
  try {
    const { start, end } = getTodayRange();

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        product: true,
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedSales = sales.map((sale) => {
      const pricePerUnit = getSalePrice(sale);

      return {
        ...sale,
        pricePerUnit,
        total:
          Number(sale.quantity) *
          pricePerUnit,
      };
    });

    res.json(formattedSales);
  } catch (err) {
    console.error(
      "DAILY SALES REPORT ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to load daily sales report.",
    });
  }
};

/**
 * DAILY PURCHASE REPORT
 */
export const getDailyPurchaseReport = async (
  req,
  res
) => {
  try {
    const { start, end } = getTodayRange();

    const purchases =
      await prisma.purchase.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          product: true,
          supplier: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const formattedPurchases = purchases.map(
      (purchase) => {
        const costPerUnit =
          getPurchaseCost(purchase);

        return {
          ...purchase,
          costPerUnit,
          total:
            Number(purchase.quantity) *
            costPerUnit,
        };
      }
    );

    res.json(formattedPurchases);
  } catch (err) {
    console.error(
      "DAILY PURCHASE REPORT ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to load daily purchase report.",
    });
  }
};

/**
 * INVENTORY SUMMARY
 */
export const getInventorySummary = async (
  req,
  res
) => {
  try {
    const inventory =
      await prisma.inventory.findMany({
        include: {
          product: true,
        },
        orderBy: {
          quantity: "asc",
        },
      });

    const report = inventory.map((item) => {
      const quantity = Number(item.quantity);
      const productPrice = Number(
        item.product?.price || 0
      );

      let stockStatus = "In Stock";

      if (quantity === 0) {
        stockStatus = "Out of Stock";
      } else if (
        quantity <= LOW_STOCK_LIMIT
      ) {
        stockStatus = "Low Stock";
      }

      return {
        ...item,
        stockStatus,
        inventoryValue:
          quantity * productPrice,
      };
    });

    res.json(report);
  } catch (err) {
    console.error(
      "INVENTORY SUMMARY REPORT ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to load inventory summary.",
    });
  }
};

/**
 * LOW-STOCK REPORT
 */
export const getLowStockReport = async (
  req,
  res
) => {
  try {
    const lowStock =
      await prisma.inventory.findMany({
        where: {
          quantity: {
            lte: LOW_STOCK_LIMIT,
          },
        },
        include: {
          product: true,
        },
        orderBy: {
          quantity: "asc",
        },
      });

    const report = lowStock.map((item) => ({
      ...item,
      stockStatus:
        item.quantity === 0
          ? "Out of Stock"
          : "Low Stock",
    }));

    res.json(report);
  } catch (err) {
    console.error(
      "LOW-STOCK REPORT ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to load low-stock report.",
    });
  }
};

/**
 * PROFIT REPORT
 *
 * This is a business cash-flow estimate:
 * revenue minus total purchase expenses.
 */
export const getProfitReport = async (
  req,
  res
) => {
  try {
    const [sales, purchases] =
      await Promise.all([
        prisma.sale.findMany({
          include: {
            product: true,
          },
        }),

        prisma.purchase.findMany(),
      ]);

    const revenue = sales.reduce(
      (sum, sale) =>
        sum +
        Number(sale.quantity) *
          getSalePrice(sale),
      0
    );

    const cost = purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(purchase.quantity) *
          getPurchaseCost(purchase),
      0
    );

    const profit = revenue - cost;

    const profitMargin =
      revenue > 0
        ? (profit / revenue) * 100
        : 0;

    res.json({
      revenue,
      cost,
      profit,
      profitMargin,
      salesTransactions: sales.length,
      purchaseTransactions:
        purchases.length,
    });
  } catch (err) {
    console.error(
      "PROFIT REPORT ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to calculate profit report.",
    });
  }
};
