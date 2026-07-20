import prisma from "../Lib/prisma.js";

/**
 * GET ALL PURCHASES
 */
export const getPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: { product: true, supplier: true },
      orderBy: { id: "desc" }
    });

    res.json(purchases);
  } catch (err) {
    console.error("GET PURCHASES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE PURCHASE
 */
export const createPurchase = async (req, res) => {
  try {
    const { productId, supplierId, quantity, costPerUnit } = req.body;

    if (!productId || !supplierId || !quantity || !costPerUnit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than zero" });
    }

    if (costPerUnit <= 0) {
      return res.status(400).json({ message: "Cost per unit must be greater than zero" });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(supplierId) }
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Ensure inventory record exists
    let inventory = await prisma.inventory.findUnique({
      where: { productId: Number(productId) }
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: { productId: Number(productId), quantity: 0 }
      });
    }

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        productId: Number(productId),
        supplierId: Number(supplierId),
        quantity: Number(quantity),
        costPerUnit: Number(costPerUnit)
      }
    });

    // Increase inventory
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: { increment: Number(quantity) } }
    });

    res.status(201).json(purchase);
  } catch (err) {
    console.error("CREATE PURCHASE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET PURCHASE BY ID
 */
export const getPurchaseById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { product: true, supplier: true }
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json(purchase);
  } catch (err) {
    console.error("GET PURCHASE BY ID ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE PURCHASE
 */
export const deletePurchase = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const purchase = await prisma.purchase.findUnique({ where: { id } });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Reverse inventory increase
    await prisma.inventory.update({
      where: { productId: purchase.productId },
      data: { quantity: { decrement: purchase.quantity } }
    });

    await prisma.purchase.delete({ where: { id } });

    res.json({ message: "Purchase deleted" });
  } catch (err) {
    console.error("DELETE PURCHASE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

