import prisma from "../lib/prisma.js";

export const DashboardService = {
  async getStats() {
    const [
      employeesCount,
      customersCount,
      suppliersCount,
      productsCount,
      salesCount,
      purchasesCount
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.product.count(),
      prisma.sale.count(),
      prisma.purchase.count()
    ]);

    return {
      employeesCount,
      customersCount,
      suppliersCount,
      productsCount,
      salesCount,
      purchasesCount
    };
  }
};
