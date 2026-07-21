import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./Layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchase";
import Reports from "./pages/Reports";

function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="employees" element={<Employees />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sales" element={<Sales />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="reports" element={<Reports />} />

        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="⚙️ System Settings"
              description="System configuration will be added later."
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}