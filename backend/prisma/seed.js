
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding EBMS PRO database...");

  // Clear existing records in the correct dependency order.
  // Child tables must be deleted before parent tables.
  await prisma.sale.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // ==================================================
  // USERS
  // ==================================================
  const adminPassword = await bcrypt.hash("admin123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@ebms.com",
        password: adminPassword,
        role: Role.admin,
      },
      {
        name: "Manager User",
        email: "manager@ebms.com",
        password: managerPassword,
        role: Role.manager,
      },
      {
        name: "Staff User",
        email: "staff@ebms.com",
        password: staffPassword,
        role: Role.staff,
      },
    ],
  });

  // ==================================================
  // EMPLOYEES
  // ==================================================
  await prisma.employee.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@company.com",
        phone: "555-1001",
        position: "Cashier",
      },
      {
        name: "Sarah Smith",
        email: "sarah@company.com",
        phone: "555-1002",
        position: "Inventory Manager",
      },
      {
        name: "Michael Brown",
        email: "michael@company.com",
        phone: "555-1003",
        position: "Sales Associate",
      },
    ],
  });

  // ==================================================
  // SUPPLIERS
  // ==================================================
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Global Foods Ltd",
      contact: "James",
      phone: "555-2001",
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "FreshMart Distributors",
      contact: "Linda",
      phone: "555-2002",
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "Premium Supplies Co",
      contact: "Robert",
      phone: "555-2003",
    },
  });

  // ==================================================
  // CUSTOMERS
  // ==================================================
  const customer1 = await prisma.customer.create({
    data: {
      name: "Alice Johnson",
      email: "alice@gmail.com",
      phone: "555-3001",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Bob Williams",
      email: "bob@gmail.com",
      phone: "555-3002",
    },
  });

  await prisma.customer.create({
    data: {
      name: "Charlie Davis",
      email: "charlie@gmail.com",
      phone: "555-3003",
    },
  });

  // ==================================================
  // PRODUCTS
  // ==================================================
  const product1 = await prisma.product.create({
    data: {
      name: "Premium Coffee Beans",
      price: 12.99,
      supplierId: supplier1.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Organic Tea Pack",
      price: 8.49,
      supplierId: supplier2.id,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "Fresh Honey Jar",
      price: 6.99,
      supplierId: supplier3.id,
    },
  });

  // ==================================================
  // INVENTORY
  // ==================================================
  await prisma.inventory.createMany({
    data: [
      {
        productId: product1.id,
        quantity: 120,
      },
      {
        productId: product2.id,
        quantity: 80,
      },
      {
        productId: product3.id,
        quantity: 150,
      },
    ],
  });

  // ==================================================
  // PURCHASES
  // ==================================================
  await prisma.purchase.createMany({
    data: [
      {
        productId: product1.id,
        supplierId: supplier1.id,
        quantity: 50,
        costPerUnit: 7.5,
      },
      {
        productId: product2.id,
        supplierId: supplier2.id,
        quantity: 40,
        costPerUnit: 5.0,
      },
    ],
  });

  // ==================================================
  // SALES
  // ==================================================
  await prisma.sale.createMany({
    data: [
      {
        productId: product1.id,
        customerId: customer1.id,
        quantity: 5,
        pricePerUnit: 12.99,
      },
      {
        productId: product2.id,
        customerId: customer2.id,
        quantity: 3,
        pricePerUnit: 8.49,
      },
    ],
  });

  console.log("✅ EBMS PRO database seeded successfully.");
  console.log("");
  console.log("Login accounts:");
  console.log("Admin: admin@ebms.com / admin123");
  console.log("Manager: manager@ebms.com / manager123");
  console.log("Staff: staff@ebms.com / staff123");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

