import express from "express";
import prisma from "../Lib/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/stats", authenticate, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalSuppliers = await prisma.supplier.count();

    return res.status(200).json({
      totalUsers,
      totalProducts,
      totalSuppliers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;