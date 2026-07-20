import prisma from "../Lib/prisma.js";


/**
 * GET ALL SUPPLIERS
 */
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { id: "desc" }
    });

    res.json(suppliers);
  } catch (err) {
    console.error("GET SUPPLIERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE SUPPLIER
 */
export const createSupplier = async (req, res) => {
  try {
    const { name, contact, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await prisma.supplier.create({
      data: { name, contact, phone }
    });

    res.status(201).json(supplier);
  } catch (err) {
    console.error("CREATE SUPPLIER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE SUPPLIER
 */
export const updateSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, contact, phone } = req.body;

    const updated = await prisma.supplier.update({
      where: { id },
      data: { name, contact, phone }
    });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE SUPPLIER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE SUPPLIER
 */
export const deleteSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.supplier.delete({
      where: { id }
    });

    res.json({ message: "Supplier deleted" });
  } catch (err) {
    console.error("DELETE SUPPLIER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};




