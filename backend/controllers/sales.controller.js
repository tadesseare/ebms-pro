import prisma from "../Lib/prisma.js";


/**
 * GET ALL SALES
 */
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { product: true, customer: true },
      orderBy: { id: "desc" }
    });

    res.json(sales);
  } catch (err) {
    console.error("GET SALES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE SALE
 */
export const createSale = async (req, res) => {
  try {
    const { productId, customerId, quantity, pricePerUnit } = req.body;

    if (!productId || !customerId || !quantity || !pricePerUnit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    if (pricePerUnit <= 0) {
      return res.status(400).json({ message: "Price per unit must be greater than zero" });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: Number(customerId) }
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    let inventory = await prisma.inventory.findUnique({
      where: { productId: Number(productId) }
    });

    if (!inventory) {
      return res.status(400).json({ message: "Inventory record not found for this product" });
    }

    if (inventory.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        productId: Number(productId),
        customerId: Number(customerId),
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit)
      }
    });

    // Decrease inventory
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: Number(quantity) } }
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error("CREATE SALE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET SALE BY ID
 */
export const getSaleById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { product: true, customer: true }
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (err) {
    console.error("GET SALE BY ID ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE SALE
 */
export const deleteSale = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const sale = await prisma.sale.findUnique({ where: { id } });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Reverse inventory decrease
    await prisma.inventory.update({
      where: { productId: sale.productId },
      data: { quantity: { increment: sale.quantity } }
    });

    await prisma.sale.delete({ where: { id } });

    res.json({ message: "Sale deleted" });
  } catch (err) {
    console.error("DELETE SALE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
