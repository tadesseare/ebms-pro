import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./Layout/Layout";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
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
      {/* Login stays outside the main layout */}
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route
          index
          element={
            <PlaceholderPage
              title="📊 EBMS Dashboard"
              description="The live executive dashboard will be restored here."
            />
          }
        />

        <Route
          path="dashboard"
          element={
            <PlaceholderPage
              title="📊 EBMS Dashboard"
              description="The live executive dashboard will be restored here."
            />
          }
        />

        <Route path="employees" element={<Employees />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />

        <Route
  path="inventory"
  element={
    <PlaceholderPage
      title="📋 Inventory Management"
      description="The inventory module will be connected later."
    />
  }
/>

        <Route
          path="sales"
          element={
            <PlaceholderPage
              title="🛒 Sales Management"
              description="The sales module will be connected later."
            />
          }
        />

        <Route
          path="purchases"
          element={
            <PlaceholderPage
              title="🧾 Purchase Management"
              description="The purchase module will be connected later."
            />
          }
        />

        <Route
          path="reports"
          element={
            <PlaceholderPage
              title="📈 Business Reports"
              description="Reports and analytics will be added later."
            />
          }
        />

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