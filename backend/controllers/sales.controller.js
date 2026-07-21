import prisma from "../Lib/prisma.js";

/**
 * GET ALL SALES
 */
export const getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: true,
        customer: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(sales);
  } catch (err) {
    console.error("GET SALES ERROR:", err);

    res.status(500).json({
      message: "Failed to load sales.",
    });
  }
};

/**
 * CREATE SALE
 */
export const createSale = async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const customerId = Number(req.body.customerId);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(customerId) ||
      !Number.isInteger(quantity)
    ) {
      return res.status(400).json({
        message: "Product, customer, and quantity are required.",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      const customer = await tx.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!customer) {
        const error = new Error("Customer not found.");
        error.statusCode = 404;
        throw error;
      }

      const inventory = await tx.inventory.findUnique({
        where: {
          productId,
        },
      });

      if (!inventory) {
        const error = new Error(
          "Inventory record not found for this product."
        );
        error.statusCode = 400;
        throw error;
      }

      if (inventory.quantity < quantity) {
        const error = new Error(
          `Not enough stock. Only ${inventory.quantity} unit(s) are available.`
        );
        error.statusCode = 400;
        throw error;
      }

      const sale = await tx.sale.create({
        data: {
          productId,
          customerId,
          quantity,

          // The backend controls the official selling price.
          pricePerUnit: Number(product.price),
        },
        include: {
          product: true,
          customer: true,
        },
      });

      const updatedInventory = await tx.inventory.update({
        where: {
          productId,
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
        include: {
          product: true,
        },
      });

      return {
        sale,
        updatedInventory,
      };
    });

    res.status(201).json({
      message: "Sale completed successfully.",
      sale: result.sale,
      inventory: result.updatedInventory,
    });
  } catch (err) {
    console.error("CREATE SALE ERROR:", err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to complete sale.",
    });
  }
};

/**
 * GET SALE BY ID
 */
export const getSaleById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid sale ID.",
      });
    }

    const sale = await prisma.sale.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
        customer: true,
      },
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found.",
      });
    }

    res.json(sale);
  } catch (err) {
    console.error("GET SALE BY ID ERROR:", err);

    res.status(500).json({
      message: "Failed to load the sale.",
    });
  }
};

/**
 * DELETE SALE
 */
export const deleteSale = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid sale ID.",
      });
    }

    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: {
          id,
        },
      });

      if (!sale) {
        const error = new Error("Sale not found.");
        error.statusCode = 404;
        throw error;
      }

      const inventory = await tx.inventory.findUnique({
        where: {
          productId: sale.productId,
        },
      });

      if (!inventory) {
        const error = new Error(
          "The related inventory record was not found."
        );
        error.statusCode = 400;
        throw error;
      }

      await tx.inventory.update({
        where: {
          productId: sale.productId,
        },
        data: {
          quantity: {
            increment: sale.quantity,
          },
        },
      });

      await tx.sale.delete({
        where: {
          id,
        },
      });
    });

    res.json({
      message: "Sale deleted and inventory restored.",
    });
  } catch (err) {
    console.error("DELETE SALE ERROR:", err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to delete the sale.",
    });
  }
};