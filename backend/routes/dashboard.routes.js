import express from "express";
import prisma from "../Lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/stats", authenticate, async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    /*
      Load the dashboard information in parallel.
      This is faster than waiting for every query separately.
    */
    const [
      totalUsers,
      totalEmployees,
      totalCustomers,
      totalSuppliers,
      totalProducts,
      employees,
      newestEmployee,
      todaySales,
      todayPurchases,
      weeklySales,
      inventories,
      recentSales,
      recentPurchases,
      recentEmployees,
      recentCustomers,
      recentProducts,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.employee.count(),

      prisma.customer.count(),

      prisma.supplier.count(),

      prisma.product.count(),

      prisma.employee.findMany({
        select: {
          id: true,
          name: true,
          position: true,
          salary: true,
          status: true,
          createdAt: true,
        },
      }),

      prisma.employee.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          position: true,
          createdAt: true,
        },
      }),

      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
     select: {
     quantity: true,
     pricePerUnit: true,
   },
      }),

    prisma.purchase.findMany({
  where: {
    createdAt: {
      gte: startOfToday,
      lt: startOfTomorrow,
    },
  },
  select: {
    quantity: true,
    costPerUnit: true,
  },
}),

      prisma.sale.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
            lt: startOfTomorrow,
          },
        },
      select: {
      quantity: true,
      pricePerUnit: true,
      createdAt: true,
    },
        orderBy: {
          createdAt: "asc",
        },
      }),

      prisma.inventory.findMany({
        include: {
          product: true,
        },
      }),

      prisma.sale.findMany({
        take: 4,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
          customer: true,
        },
      }),

      prisma.purchase.findMany({
        take: 4,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          product: true,
          supplier: true,
        },
      }),

      prisma.employee.findMany({
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          position: true,
          createdAt: true,
        },
      }),

      prisma.customer.findMany({
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),

      prisma.product.findMany({
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
      }),
    ]);

    /*
      Financial calculations
    */
  const salesToday = todaySales.reduce(
  (total, sale) =>
    total +
    Number(sale.quantity) *
      Number(sale.pricePerUnit),
  0
);

const purchasesToday = todayPurchases.reduce(
  (total, purchase) =>
    total +
    Number(purchase.quantity) *
      Number(purchase.costPerUnit),
  0
);

    const profitToday = salesToday - purchasesToday;

   const weeklyRevenue = weeklySales.reduce(
  (total, sale) =>
    total +
    Number(sale.quantity) *
      Number(sale.pricePerUnit),
  0
);

    const weeklyQuantity = weeklySales.reduce(
      (total, sale) => total + Number(sale.quantity),
      0
    );

    /*
      Inventory calculations
    */
    const inventoryTotal = inventories.reduce(
      (total, inventory) => {
        const quantity = Number(inventory.quantity ?? 0);
        const productPrice = Number(
          inventory.product?.price ?? 0
        );

        return total + quantity * productPrice;
      },
      0
    );

    const lowStock = inventories
      .filter(
        (inventory) =>
          Number(inventory.quantity ?? 0) <= 10
      )
      .map((inventory) => ({
        id: inventory.product?.id ?? inventory.id,
        name:
          inventory.product?.name ??
          "Unnamed product",
        quantity: Number(inventory.quantity ?? 0),
        inventory: {
          quantity: Number(inventory.quantity ?? 0),
        },
      }))
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 8);

    /*
      Workforce calculations
    */
    const activeEmployees = employees.filter(
      (employee) =>
        normalizeStatus(employee.status) === "active"
    ).length;

    const onLeaveEmployees = employees.filter(
      (employee) => {
        const status = normalizeStatus(employee.status);

        return (
          status === "on leave" ||
          status === "leave"
        );
      }
    ).length;

    const inactiveEmployees = employees.filter(
      (employee) =>
        normalizeStatus(employee.status) === "inactive"
    ).length;

    const employeesWithSalary = employees.filter(
      (employee) =>
        employee.salary !== null &&
        employee.salary !== undefined
    );

    const totalSalary = employeesWithSalary.reduce(
      (total, employee) =>
        total + Number(employee.salary ?? 0),
      0
    );

    const averageSalary =
      employeesWithSalary.length > 0
        ? totalSalary / employeesWithSalary.length
        : 0;

    /*
      The Employee model currently has position but no department.
      We temporarily calculate the most common position and send it
      using largestDepartment so your existing frontend works.
    */
    const positionCounts = employees.reduce(
      (result, employee) => {
        const position =
          employee.position?.trim() || "Unassigned";

        result[position] = (result[position] ?? 0) + 1;

        return result;
      },
      {}
    );

    const mostCommonPosition =
      Object.entries(positionCounts).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? null;

    /*
      Daily sales for the last seven days
    */
    const dailySalesMap = new Map();

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + index);

      const key = formatDateKey(date);

      dailySalesMap.set(key, {
        date: key,
        quantity: 0,
        revenue: 0,
      });
    }

    weeklySales.forEach((sale) => {
      const key = formatDateKey(sale.createdAt);

      const current = dailySalesMap.get(key);

      if (!current) {
        return;
      }

      current.quantity += Number(sale.quantity ?? 0);
      current.revenue +=
     Number(sale.quantity ?? 0) *
     Number(sale.pricePerUnit ?? 0);
    });

    const dailySales = Array.from(
      dailySalesMap.values()
    );

    /*
      Recent activity
    */
  const saleActivities = recentSales.map((sale) => ({
  id: `sale-${sale.id}`,
  type: "sale",
  title: "Sale recorded",
  description: `${sale.quantity} unit${
    Number(sale.quantity) === 1 ? "" : "s"
  } of ${
    sale.product?.name ?? "a product"
  } sold for ${formatMoney(
    Number(sale.quantity) *
      Number(sale.pricePerUnit)
  )}${
    sale.customer?.name
      ? ` to ${sale.customer.name}`
      : ""
  }.`,
  createdAt: sale.createdAt,
}));
    const purchaseActivities = recentPurchases.map(
  (purchase) => ({
    id: `purchase-${purchase.id}`,
    type: "purchase",
    title: "Purchase recorded",
    description: `${purchase.quantity} unit${
      Number(purchase.quantity) === 1 ? "" : "s"
    } of ${
      purchase.product?.name ?? "a product"
    } purchased for ${formatMoney(
      Number(purchase.quantity) *
        Number(purchase.costPerUnit ?? 0)
    )}${
      purchase.supplier?.name
        ? ` from ${purchase.supplier.name}`
        : ""
    }.`,
    createdAt: purchase.createdAt,
  })
);
    const employeeActivities = recentEmployees.map(
      (employee) => ({
        id: `employee-${employee.id}`,
        type: "employee",
        title: "Employee added",
        description: `${employee.name}${
          employee.position
            ? ` joined as ${employee.position}`
            : " was added to the workforce"
        }.`,
        createdAt: employee.createdAt,
      })
    );

    const customerActivities = recentCustomers.map(
      (customer) => ({
        id: `customer-${customer.id}`,
        type: "customer",
        title: "Customer registered",
        description: `${customer.name} was added as a customer.`,
        createdAt: customer.createdAt,
      })
    );

    const productActivities = recentProducts.map(
      (product) => ({
        id: `product-${product.id}`,
        type: "product",
        title: "Product added",
        description: `${
          product.name
        } was added to the product catalog at ${formatMoney(
          product.price
        )}.`,
        createdAt: product.createdAt,
      })
    );

    const recentActivities = [
      ...saleActivities,
      ...purchaseActivities,
      ...employeeActivities,
      ...customerActivities,
      ...productActivities,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    return res.status(200).json({
      counts: {
        users: totalUsers,
        employees: totalEmployees,
        customers: totalCustomers,
        suppliers: totalSuppliers,
        products: totalProducts,
      },

      salesToday: roundMoney(salesToday),
      purchasesToday: roundMoney(purchasesToday),
      profitToday: roundMoney(profitToday),
      inventoryTotal: roundMoney(inventoryTotal),
      weeklyRevenue: roundMoney(weeklyRevenue),
      weeklyQuantity,

      workforce: {
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        inactive: inactiveEmployees,
        averageSalary: roundMoney(averageSalary),

        newestEmployee: newestEmployee
          ? {
              id: newestEmployee.id,
              name: newestEmployee.name,
              position: newestEmployee.position,
              createdAt: newestEmployee.createdAt,
            }
          : null,

        largestDepartment: mostCommonPosition
          ? {
              name: mostCommonPosition,
            }
          : null,
      },

      lowStock,
      dailySales,
      recentActivities,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      message: "Failed to load dashboard statistics.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
});

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function formatDateKey(dateValue) {
  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function roundMoney(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

export default router;