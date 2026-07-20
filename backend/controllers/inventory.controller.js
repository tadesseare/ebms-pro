import prisma from "../Lib/prisma.js";

/**
 * GET ALL INVENTORY
 */
export const getInventory = async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(inventory);
  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);

    res.status(500).json({
      message: "Failed to load inventory.",
    });
  }
};

/**
 * CREATE INVENTORY RECORD
 */
export const createInventory = async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        message: "A valid product is required.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "Quantity must be a whole number of zero or greater.",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: {
        productId,
      },
    });

    if (existingInventory) {
      return res.status(409).json({
        message: "Inventory already exists for this product.",
      });
    }

    const item = await prisma.inventory.create({
      data: {
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("CREATE INVENTORY ERROR:", err);

    res.status(500).json({
      message: "Failed to create inventory.",
    });
  }
};

/**
 * UPDATE INVENTORY QUANTITY
 */
export const updateInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid inventory ID.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "Quantity must be a whole number of zero or greater.",
      });
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: {
        id,
      },
    });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory record not found.",
      });
    }

    const item = await prisma.inventory.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });

    res.json(item);
  } catch (err) {
    console.error("UPDATE INVENTORY ERROR:", err);

    res.status(500).json({
      message: "Failed to update inventory.",
    });
  }
};

/**
 * DELETE INVENTORY RECORD
 */
export const deleteInventory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid inventory ID.",
      });
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: {
        id,
      },
    });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory record not found.",
      });
    }

    await prisma.inventory.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Inventory item deleted successfully.",
    });
  } catch (err) {
    console.error("DELETE INVENTORY ERROR:", err);

    res.status(500).json({
      message: "Failed to delete inventory.",
    });
  }
};
