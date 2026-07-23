import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const daysAgo = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  console.log("🌱 Seeding EBMS PRO Enterprise Database...");

  // ======================================
  // DELETE OLD DATA
  // ======================================

  await prisma.sale.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // ======================================
  // USERS
  // ======================================

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

  // ======================================
  // EMPLOYEES
  // ======================================

  const employees = [
    {
      name: "Abebe Bochu",
      email: "abebe.bochu@ebms.com",
      phone: "555-1101",
      position: "Chief Executive Officer",
      salary: 165000,
      status: "Active",
    },
    {
      name: "Almaz Kudo",
      email: "almaz.kudo@ebms.com",
      phone: "555-1102",
      position: "Finance Manager",
      salary: 125000,
      status: "Active",
    },
    {
      name: "Selam Nato",
      email: "selam.nato@ebms.com",
      phone: "555-1103",
      position: "HR Manager",
      salary: 118000,
      status: "Active",
    },
    {
      name: "Hurgesa Shuto",
      email: "hurgesa.shuto@ebms.com",
      phone: "555-1104",
      position: "Inventory Supervisor",
      salary: 98000,
      status: "Active",
    },
    {
      name: "Tesfaye Bekele",
      email: "tesfaye.bekele@ebms.com",
      phone: "555-1105",
      position: "Sales Manager",
      salary: 110000,
      status: "Active",
    },
    {
      name: "Hana Tadesse",
      email: "hana.tadesse@ebms.com",
      phone: "555-1106",
      position: "Senior Accountant",
      salary: 92000,
      status: "Active",
    },
    {
      name: "Dawit Alemu",
      email: "dawit.alemu@ebms.com",
      phone: "555-1107",
      position: "Cashier",
      salary: 62000,
      status: "Active",
    },
    {
      name: "Meron Fikru",
      email: "meron.fikru@ebms.com",
      phone: "555-1108",
      position: "Sales Associate",
      salary: 68000,
      status: "Active",
    },
    {
      name: "Biruk Kebede",
      email: "biruk.kebede@ebms.com",
      phone: "555-1109",
      position: "Warehouse Officer",
      salary: 65000,
      status: "Active",
    },
    {
      name: "Rahel Girma",
      email: "rahel.girma@ebms.com",
      phone: "555-1110",
      position: "Customer Service Officer",
      salary: 64000,
      status: "Active",
    },
    {
      name: "Yonas Desta",
      email: "yonas.desta@ebms.com",
      phone: "555-1111",
      position: "Delivery Coordinator",
      salary: 66000,
      status: "On Leave",
    },
    {
      name: "Kalkidan Assefa",
      email: "kalkidan.assefa@ebms.com",
      phone: "555-1112",
      position: "Procurement Officer",
      salary: 79000,
      status: "Active",
    },
    {
      name: "Mekdes Alemu",
      email: "mekdes.alemu@ebms.com",
      phone: "555-1113",
      position: "Marketing Officer",
      salary: 76000,
      status: "Active",
    },
    {
      name: "Samuel Habte",
      email: "samuel.habte@ebms.com",
      phone: "555-1114",
      position: "IT Support Specialist",
      salary: 85000,
      status: "Active",
    },
    {
      name: "Liya Tesfaye",
      email: "liya.tesfaye@ebms.com",
      phone: "555-1115",
      position: "Administrative Assistant",
      salary: 58000,
      status: "Active",
    },
    {
      name: "Natnael Gashaw",
      email: "natnael.gashaw@ebms.com",
      phone: "555-1116",
      position: "Storekeeper",
      salary: 60000,
      status: "Active",
    },
    {
      name: "Bethlehem Haile",
      email: "bethlehem.haile@ebms.com",
      phone: "555-1117",
      position: "Sales Associate",
      salary: 67000,
      status: "Active",
    },
    {
      name: "Fitsum Mulugeta",
      email: "fitsum.mulugeta@ebms.com",
      phone: "555-1118",
      position: "Junior Accountant",
      salary: 70000,
      status: "Active",
    },
    {
      name: "Tigist Worku",
      email: "tigist.worku@ebms.com",
      phone: "555-1119",
      position: "Receptionist",
      salary: 55000,
      status: "Active",
    },
    {
      name: "Amanuel Hailu",
      email: "amanuel.hailu@ebms.com",
      phone: "555-1120",
      position: "Driver",
      salary: 57000,
      status: "Inactive",
    },
  ];

  for (let i = 0; i < employees.length; i++) {
    await prisma.employee.create({
      data: {
        ...employees[i],
        createdAt: daysAgo(360 - i * 14),
      },
    });
  }
    // ======================================
  // SUPPLIERS
  // ======================================

  const suppliers = [
    { name: "Addis Trading PLC", contact: "Mekdes Alemu", phone: "555-2101" },
    { name: "Blue Nile Distributors", contact: "Dawit Girma", phone: "555-2102" },
    { name: "Ethio Fresh Foods", contact: "Hirut Bekele", phone: "555-2103" },
    { name: "Habesha Wholesale", contact: "Samuel Desta", phone: "555-2104" },
    { name: "Selam Import & Export", contact: "Rahel Worku", phone: "555-2105" },
    { name: "Abay General Trading", contact: "Bereket Haile", phone: "555-2106" },
    { name: "Sheger Suppliers", contact: "Liya Tesfaye", phone: "555-2107" },
    { name: "Awash Distribution", contact: "Natnael Fikru", phone: "555-2108" },
    { name: "Unity Food Supply", contact: "Eden Solomon", phone: "555-2109" },
    { name: "Tana Trading PLC", contact: "Fitsum Abate", phone: "555-2110" },
    { name: "Rift Valley Beverages", contact: "Amanuel Kebede", phone: "555-2111" },
    { name: "Highland Dairy Supply", contact: "Mahlet Girma", phone: "555-2112" },
    { name: "Merkato Office Supply", contact: "Henok Tadesse", phone: "555-2113" },
    { name: "Nile Cleaning Products", contact: "Kidist Workneh", phone: "555-2114" },
    { name: "Sunrise Household Goods", contact: "Nahom Desta", phone: "555-2115" },
  ];

  for (let i = 0; i < suppliers.length; i++) {
    await prisma.supplier.create({
      data: {
        ...suppliers[i],
        createdAt: daysAgo(300 - i * 8),
      },
    });
  }

  const supplierRecords = await prisma.supplier.findMany({
    orderBy: { id: "asc" },
  });

  const supplierMap = {};

  supplierRecords.forEach((supplier) => {
    supplierMap[supplier.name] = supplier.id;
  });

  // ======================================
  // CUSTOMERS
  // ======================================

  const customerNames = [
    "Mulugeta Assefa",
    "Tigist Worku",
    "Getachew Abate",
    "Fitsum Mulugeta",
    "Samuel Habte",
    "Bethlehem Haile",
    "Natnael Gashaw",
    "Ruth Bekele",
    "Eden Solomon",
    "Liya Tesfaye",
    "Mekdes Alemu",
    "Bereket Desta",
    "Saron Fikre",
    "Nahom Girma",
    "Mahlet Kebede",
    "Henok Tadesse",
    "Kidist Workneh",
    "Amanuel Hailu",
    "Yared Bekele",
    "Marta Solomon",
    "Eyob Alemu",
    "Helen Girma",
    "Biniyam Desta",
    "Sena Kebede",
    "Abel Worku",
    "Feven Haile",
    "Robel Fikru",
    "Mimi Assefa",
    "Daniel Tesfaye",
    "Selamawit Abate",
    "Nahome Tadesse",
    "Rahel Bekele",
    "Solomon Girma",
    "Hiwot Desta",
    "Ephrem Haile",
    "Mahi Solomon",
    "Rediet Kebede",
    "Birtukan Worku",
    "Endalkachew Alemu",
    "Lemlem Tadesse",
  ];

  for (let i = 0; i < customerNames.length; i++) {
    const email = customerNames[i]
      .toLowerCase()
      .replace(/\s+/g, ".");

    await prisma.customer.create({
      data: {
        name: customerNames[i],
        email: `${email}@gmail.com`,
        phone: `555-${3101 + i}`,
        createdAt: daysAgo(150 - i * 2),
      },
    });
  }

  const customerRecords = await prisma.customer.findMany({
    orderBy: { id: "asc" },
  });

  // ======================================
  // PRODUCTS
  // ======================================

  const products = [
    ["Ethiopian Coffee Beans",18.99,10.50,"Tana Trading PLC",100],
    ["Sidamo Coffee",16.49,9.00,"Tana Trading PLC",90],
    ["Yirgacheffe Coffee",19.99,11.50,"Tana Trading PLC",85],
    ["Harar Coffee",17.75,9.80,"Tana Trading PLC",80],
    ["Organic Tea Pack",8.49,5.00,"Addis Trading PLC",75],
    ["Pure Honey Jar",11.99,7.00,"Ethio Fresh Foods",65],
    ["Teff Flour",14.50,8.25,"Habesha Wholesale",120],
    ["Wheat Flour",7.99,4.30,"Habesha Wholesale",140],
    ["White Rice",12.75,7.20,"Unity Food Supply",130],
    ["Pasta Pack",3.99,2.10,"Unity Food Supply",160],
    ["Macaroni Pack",4.25,2.30,"Unity Food Supply",150],
    ["Cooking Oil",13.99,8.40,"Awash Distribution",110],
    ["Sugar",6.75,3.80,"Abay General Trading",125],
    ["Iodized Salt",2.49,1.10,"Abay General Trading",180],
    ["Red Lentils",8.99,5.20,"Habesha Wholesale",100],
    ["Chickpeas",9.49,5.60,"Habesha Wholesale",95],
    ["Fresh Milk",4.25,2.40,"Highland Dairy Supply",90],
    ["Butter",7.50,4.25,"Highland Dairy Supply",70],
    ["Cheese",8.99,5.10,"Highland Dairy Supply",60],
    ["Yogurt",3.75,2.00,"Highland Dairy Supply",80],
    ["Ambo Mineral Water",2.25,1.00,"Blue Nile Distributors",200],
    ["Bottled Water",1.50,0.65,"Blue Nile Distributors",220],
    ["Mango Juice",3.99,2.15,"Blue Nile Distributors",120],
    ["Orange Juice",3.75,2.00,"Blue Nile Distributors",120],
    ["Coca-Cola",2.50,1.25,"Rift Valley Beverages",200],
        ["Pepsi",2.50,1.25,"Rift Valley Beverages",190],
    ["Fanta Orange",2.50,1.20,"Rift Valley Beverages",170],
    ["Sprite",2.50,1.20,"Rift Valley Beverages",165],
    ["Laundry Detergent",10.99,6.30,"Nile Cleaning Products",75],
    ["Dishwashing Liquid",6.49,3.60,"Nile Cleaning Products",90],
    ["Floor Cleaner",7.99,4.40,"Nile Cleaning Products",70],
    ["Bleach",4.99,2.50,"Nile Cleaning Products",80],
    ["Bath Soap",3.25,1.65,"Sunrise Household Goods",130],
    ["Tissue Paper",5.99,3.10,"Sunrise Household Goods",100],
    ["Paper Towels",6.50,3.40,"Sunrise Household Goods",90],
    ["Toothpaste",4.75,2.50,"Sunrise Household Goods",110],
    ["Toothbrush",2.99,1.35,"Sunrise Household Goods",120],
    ["Shampoo",8.75,4.90,"Selam Import & Export",85],
    ["Body Lotion",9.25,5.20,"Selam Import & Export",80],
    ["Notebook",3.50,1.70,"Merkato Office Supply",140],
    ["Ballpoint Pen Pack",2.99,1.25,"Merkato Office Supply",160],
    ["Printer Paper Ream",8.99,5.00,"Merkato Office Supply",100],
    ["Stapler",6.75,3.50,"Merkato Office Supply",75],
    ["File Folder Pack",5.25,2.80,"Merkato Office Supply",90],
    ["Marker Set",4.99,2.40,"Merkato Office Supply",85],
    ["Biscuits Pack",3.25,1.60,"Addis Trading PLC",130],
    ["Chocolate Bar",2.75,1.30,"Addis Trading PLC",120],
    ["Potato Chips",2.99,1.45,"Addis Trading PLC",115],
    ["Tomato Sauce",4.49,2.30,"Ethio Fresh Foods",95],
    ["Peanut Butter",7.99,4.20,"Ethio Fresh Foods",75],
  ];

  const productRecords = [];

  for (let i = 0; i < products.length; i++) {
    const [
      name,
      sellingPrice,
      costPrice,
      supplierName,
      openingStock,
    ] = products[i];

    const supplierId = supplierMap[supplierName];

    if (!supplierId) {
      throw new Error(
        `Supplier "${supplierName}" was not found for product "${name}".`
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: sellingPrice,
        supplierId,
        createdAt: daysAgo(100 - i),
      },
    });

    productRecords.push({
      ...product,
      costPrice,
      openingStock,
    });
  }

  // ======================================
  // PURCHASES — 80 RECORDS
  // ======================================

  const purchaseData = [];

  for (let i = 0; i < 80; i++) {
    const product = productRecords[i % productRecords.length];

    const quantity = 20 + ((i * 13) % 81);

    const costAdjustment = 0.96 + (i % 5) * 0.02;

    purchaseData.push({
      productId: product.id,
      supplierId: product.supplierId,
      quantity,
      costPerUnit: Number(
        (product.costPrice * costAdjustment).toFixed(2)
      ),
      createdAt: daysAgo(i % 30, 8 + (i % 8)),
    });
  }

  await prisma.purchase.createMany({
    data: purchaseData,
  });

  // ======================================
  // SALES — 150 RECORDS
  // ======================================

  const saleData = [];

  for (let i = 0; i < 150; i++) {
    const product =
      productRecords[(i * 7) % productRecords.length];

    const customer =
      customerRecords[(i * 11) % customerRecords.length];

    const quantity = 1 + ((i * 3) % 8);

    const sellingAdjustment = 0.98 + (i % 4) * 0.01;

    saleData.push({
      productId: product.id,
      customerId: customer.id,
      quantity,
      pricePerUnit: Number(
        (product.price * sellingAdjustment).toFixed(2)
      ),
      createdAt: daysAgo(i % 30, 9 + (i % 9)),
    });
  }

  await prisma.sale.createMany({
    data: saleData,
  });
    // ======================================
  // INVENTORY — 50 RECORDS
  // opening stock + purchases - sales
  // ======================================

  const inventoryData = [];

  for (let i = 0; i < productRecords.length; i++) {
    const product = productRecords[i];

    const purchasedQuantity = purchaseData
      .filter((purchase) => purchase.productId === product.id)
      .reduce((total, purchase) => total + purchase.quantity, 0);

    const soldQuantity = saleData
      .filter((sale) => sale.productId === product.id)
      .reduce((total, sale) => total + sale.quantity, 0);

    const currentQuantity = Math.max(
      product.openingStock + purchasedQuantity - soldQuantity,
      0
    );

    inventoryData.push({
      productId: product.id,
      quantity: currentQuantity,
      createdAt: daysAgo(2),
    });
  }

  // Create a few intentional low-stock products
  // so the Dashboard alert section is not empty.
  inventoryData[47].quantity = 9;
  inventoryData[48].quantity = 6;
  inventoryData[49].quantity = 4;

  await prisma.inventory.createMany({
    data: inventoryData,
  });

  // ======================================
  // SUCCESS MESSAGE
  // ======================================

  console.log("");
  console.log("✅ EBMS PRO database seeded successfully.");
  console.log("");
  console.log("Created records:");
  console.log("  Users:       3");
  console.log("  Employees:  20");
  console.log("  Customers:  40");
  console.log("  Suppliers:  15");
  console.log("  Products:   50");
  console.log("  Inventory:  50");
  console.log("  Purchases:  80");
  console.log("  Sales:      150");
  console.log("");
  console.log("Demo login accounts:");
  console.log("  Admin:   admin@ebms.com / admin123");
  console.log("  Manager: manager@ebms.com / manager123");
  console.log("  Staff:   staff@ebms.com / staff123");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Database seeding failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });