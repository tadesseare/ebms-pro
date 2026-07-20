import prisma from "../Lib/prisma.js";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        supplier: true,
        inventory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load products",
      error: error.message,
    });
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const { name, price, supplierId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    const numericPrice = Number(price);
    const numericSupplierId = Number(supplierId);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "A valid product price is required",
      });
    }

    if (!Number.isInteger(numericSupplierId)) {
      return res.status(400).json({
        message: "A valid supplier is required",
      });
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id: numericSupplierId,
      },
    });

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: numericPrice,
        supplierId: numericSupplierId,
      },
      include: {
        supplier: true,
        inventory: true,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, price, supplierId } = req.body;

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    const numericPrice = Number(price);
    const numericSupplierId = Number(supplierId);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "A valid product price is required",
      });
    }

    if (!Number.isInteger(numericSupplierId)) {
      return res.status(400).json({
        message: "A valid supplier is required",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id: numericSupplierId,
      },
    });

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: name.trim(),
        price: numericPrice,
        supplierId: numericSupplierId,
      },
      include: {
        supplier: true,
        inventory: true,
      },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        inventory: true,
        purchases: true,
        sales: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (
      product.inventory ||
      product.purchases.length > 0 ||
      product.sales.length > 0
    ) {
      return res.status(409).json({
        message:
          "This product cannot be deleted because it has inventory, purchase, or sales records.",
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
