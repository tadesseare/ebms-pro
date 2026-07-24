import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import supplierRoutes from "./routes/suppliers.routes.js";
import employeeRoutes from "./routes/employees.routes.js";
import customerRoutes from "./routes/customers.routes.js";
import productRoutes from "./routes/products.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without a browser origin, such as health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Backend health check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "EBMS Backend is Running!",
    status: "healthy",
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/reports", reportsRoutes);

// Unknown API route
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found.",
  });
});

// General error handler
app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;

// Do not bind exclusively to 127.0.0.1 in production.
const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server startup error:", error);
});