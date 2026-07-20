import prisma from "../Lib/prisma.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(customers);
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      message: "Failed to load customers",
    });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      message: "Failed to create customer",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const { name, email, phone } = req.body;

    if (!Number.isInteger(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const customer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    return res.status(200).json(customer);
  } catch (error) {
    console.error("Update customer error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    await prisma.customer.delete({
      where: {
        id: customerId,
      },
    });

    return res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};