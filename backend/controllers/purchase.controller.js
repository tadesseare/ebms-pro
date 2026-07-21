import prisma from "../Lib/prisma.js";

/**
 * GET ALL PURCHASES
 */
export const getPurchases = async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        product: true,
        supplier: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(purchases);
  } catch (err) {
    console.error("GET PURCHASES ERROR:", err);

    res.status(500).json({
      message: "Failed to load purchases.",
    });
  }
};

/**
 * CREATE PURCHASE
 */
export const createPurchase = async (req, res) => {
  try {
    const productId = Number(req.body.productId);
    const supplierId = Number(req.body.supplierId);
    const quantity = Number(req.body.quantity);
    const costPerUnit = Number(req.body.costPerUnit);

    if (
      !Number.isInteger(productId) ||
      !Number.isInteger(supplierId) ||
      !Number.isInteger(quantity)
    ) {
      return res.status(400).json({
        message:
          "Product, supplier, and quantity are required.",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero.",
      });
    }

    if (
      !Number.isFinite(costPerUnit) ||
      costPerUnit <= 0
    ) {
      return res.status(400).json({
        message:
          "Cost per unit must be greater than zero.",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
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

        const supplier = await tx.supplier.findUnique({
          where: {
            id: supplierId,
          },
        });

        if (!supplier) {
          const error = new Error("Supplier not found.");
          error.statusCode = 404;
          throw error;
        }

        const purchase = await tx.purchase.create({
          data: {
            productId,
            supplierId,
            quantity,
            costPerUnit,
          },
          include: {
            product: true,
            supplier: true,
          },
        });

        const inventory =
          await tx.inventory.upsert({
            where: {
              productId,
            },
            update: {
              quantity: {
                increment: quantity,
              },
            },
            create: {
              productId,
              quantity,
            },
            include: {
              product: true,
            },
          });

        return {
          purchase,
          inventory,
        };
      }
    );

    res.status(201).json({
      message: "Purchase recorded successfully.",
      purchase: result.purchase,
      inventory: result.inventory,
    });
  } catch (err) {
    console.error("CREATE PURCHASE ERROR:", err);

    res.status(err.statusCode || 500).json({
      message:
        err.message || "Failed to record purchase.",
    });
  }
};

/**
 * GET PURCHASE BY ID
 */
export const getPurchaseById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID.",
      });
    }

    const purchase =
      await prisma.purchase.findUnique({
        where: {
          id,
        },
        include: {
          product: true,
          supplier: true,
        },
      });

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found.",
      });
    }

    res.json(purchase);
  } catch (err) {
    console.error(
      "GET PURCHASE BY ID ERROR:",
      err
    );

    res.status(500).json({
      message: "Failed to load the purchase.",
    });
  }
};

/**
 * DELETE PURCHASE
 */
export const deletePurchase = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid purchase ID.",
      });
    }

    await prisma.$transaction(async (tx) => {
      const purchase =
        await tx.purchase.findUnique({
          where: {
            id,
          },
        });

      if (!purchase) {
        const error = new Error(
          "Purchase not found."
        );
        error.statusCode = 404;
        throw error;
      }

      const inventory =
        await tx.inventory.findUnique({
          where: {
            productId: purchase.productId,
          },
        });

      if (!inventory) {
        const error = new Error(
          "The related inventory record was not found."
        );
        error.statusCode = 400;
        throw error;
      }

      /*
       * Prevent negative stock when purchased units
       * have already been sold or otherwise removed.
       */
      if (inventory.quantity < purchase.quantity) {
        const error = new Error(
          "This purchase cannot be deleted because some of its units have already been sold or removed from inventory."
        );
        error.statusCode = 400;
        throw error;
      }

      await tx.inventory.update({
        where: {
          productId: purchase.productId,
        },
        data: {
          quantity: {
            decrement: purchase.quantity,
          },
        },
      });

      await tx.purchase.delete({
        where: {
          id,
        },
      });
    });

    res.json({
      message:
        "Purchase deleted and inventory adjusted.",
    });
  } catch (err) {
    console.error("DELETE PURCHASE ERROR:", err);

    res.status(err.statusCode || 500).json({
      message:
        err.message || "Failed to delete purchase.",
    });
  }
};
