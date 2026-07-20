import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await axios.get("/api/dashboard/stats", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        setData(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);

        const message =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      fetchDashboard();
    } else {
      setLoading(false);
      setError("Authentication token is missing. Please log in again.");
    }
  }, [token, fetchDashboard]);

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-card">
        <h3>Dashboard could not be loaded</h3>
        <p>{error}</p>

        <button
          type="button"
          className="primary-button"
          onClick={() => fetchDashboard()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return <p>No dashboard data is available.</p>;
  }

  const counts = data.counts ?? {};

  const employees = Number(counts.employees ?? 0);
  const customers = Number(counts.customers ?? 0);
  const suppliers = Number(counts.suppliers ?? 0);
  const products = Number(counts.products ?? 0);

  const salesToday = Number(data.salesToday ?? 0);
  const purchasesToday = Number(data.purchasesToday ?? 0);
  const profitToday = Number(data.profitToday ?? 0);
  const inventoryTotal = Number(data.inventoryTotal ?? 0);
  const weeklyRevenue = Number(data.weeklyRevenue ?? 0);
  const weeklyQuantity = Number(data.weeklyQuantity ?? 0);

  const lowStock = Array.isArray(data.lowStock)
    ? data.lowStock
    : [];

  const dailySales = Array.isArray(data.dailySales)
    ? data.dailySales
    : [];

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            Enterprise Business Management System
          </p>

          <h1>Business Dashboard</h1>

          <p className="dashboard-welcome">
            Welcome back, <strong>{displayName}</strong>. Here is your current
            business overview.
          </p>

          <div className="dashboard-meta">
            <span>{currentDate}</span>

            {user?.role && (
              <span className="role-badge">{user.role}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
        >
          <span className={refreshing ? "refresh-icon spinning" : "refresh-icon"}>
            ↻
          </span>

          {refreshing ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Overview</p>
            <h2>Business Records</h2>
          </div>

          <p>Click any card to open its module.</p>
        </div>

        <div className="kpi-grid">
          <StatCard
            label="Employees"
            value={formatNumber(employees)}
            icon="👥"
            note="Active employee records"
            accent="blue"
            onClick={() => navigate("/employees")}
          />

          <StatCard
            label="Customers"
            value={formatNumber(customers)}
            icon="🤝"
            note="Registered customers"
            accent="green"
            onClick={() => navigate("/customers")}
          />

          <StatCard
            label="Suppliers"
            value={formatNumber(suppliers)}
            icon="🚚"
            note="Business suppliers"
            accent="purple"
            onClick={() => navigate("/suppliers")}
          />

          <StatCard
            label="Products"
            value={formatNumber(products)}
            icon="📦"
            note="Products in catalog"
            accent="orange"
            onClick={() => navigate("/products")}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Performance</p>
            <h2>Financial Summary</h2>
          </div>

          <p>Today’s sales, purchases, profit, and inventory value.</p>
        </div>

        <div className="kpi-grid">
          <StatCard
            label="Sales Today"
            value={formatCurrency(salesToday)}
            icon="💰"
            note="Revenue recorded today"
            accent="green"
            onClick={() => navigate("/sales")}
          />

          <StatCard
            label="Purchases Today"
            value={formatCurrency(purchasesToday)}
            icon="🛒"
            note="Purchases recorded today"
            accent="orange"
            onClick={() => navigate("/purchases")}
          />

          <StatCard
            label="Profit Today"
            value={formatCurrency(profitToday)}
            icon="📈"
            note={
              profitToday >= 0
                ? "Positive daily performance"
                : "Expenses exceed sales"
            }
            accent={profitToday >= 0 ? "blue" : "red"}
          />

          <StatCard
            label="Inventory Total"
            value={formatCurrency(inventoryTotal)}
            icon="🏬"
            note="Estimated inventory value"
            accent="purple"
            onClick={() => navigate("/inventory")}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="weekly-summary">
          <div className="weekly-item">
            <div className="weekly-icon">📅</div>

            <div>
              <p>Weekly Revenue</p>
              <h3>{formatCurrency(weeklyRevenue)}</h3>
              <span>Revenue during the last seven days</span>
            </div>
          </div>

          <div className="weekly-divider"></div>

          <div className="weekly-item">
            <div className="weekly-icon">📊</div>

            <div>
              <p>Weekly Quantity Sold</p>
              <h3>{formatNumber(weeklyQuantity)}</h3>
              <span>Total units sold during the last seven days</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-content-grid">
          <DashboardPanel
            title="Low Stock Products"
            subtitle="Products that may need restocking"
            buttonLabel="View Inventory"
            onButtonClick={() => navigate("/inventory")}
          >
            {lowStock.length === 0 ? (
              <div className="stock-success">
                <span>✓</span>

                <div>
                  <strong>Inventory is healthy</strong>
                  <p>All products are sufficiently stocked.</p>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStock.map((product, index) => {
                      const productName =
                        product.name ??
                        product.productName ??
                        "Unnamed product";

                      const quantity = Number(
                        product.inventory?.quantity ??
                          product.quantity ??
                          product.stockQuantity ??
                          0
                      );

                      return (
                        <tr key={product.id ?? index}>
                          <td>
                            <div className="product-cell">
                              <span className="product-icon">📦</span>
                              <strong>{productName}</strong>
                            </div>
                          </td>

                          <td>{formatNumber(quantity)}</td>

                          <td>
                            <span className="status-badge">Low Stock</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Quick Actions"
            subtitle="Open frequently used modules"
          >
            <div className="quick-actions-grid">
              <QuickAction
                icon="➕"
                title="Add Product"
                description="Create a product record"
                onClick={() => navigate("/products")}
              />

              <QuickAction
                icon="🧾"
                title="Record Sale"
                description="Create a sales transaction"
                onClick={() => navigate("/sales")}
              />

              <QuickAction
                icon="👤"
                title="Add Customer"
                description="Register a customer"
                onClick={() => navigate("/customers")}
              />

              <QuickAction
                icon="🚛"
                title="Add Supplier"
                description="Register a supplier"
                onClick={() => navigate("/suppliers")}
              />

              <QuickAction
                icon="🛍️"
                title="Record Purchase"
                description="Create a purchase transaction"
                onClick={() => navigate("/purchases")}
              />

              <QuickAction
                icon="📋"
                title="Check Inventory"
                description="Review stock levels"
                onClick={() => navigate("/inventory")}
              />
            </div>
          </DashboardPanel>
        </div>
      </section>

      <section className="dashboard-section">
        <DashboardPanel
          title="Daily Sales for the Last 7 Days"
          subtitle="Recent sales quantities by date"
          buttonLabel="Open Sales"
          onButtonClick={() => navigate("/sales")}
        >
          {dailySales.length === 0 ? (
            <div className="empty-state">
              <span>📊</span>
              <p>No sales in the last seven days.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Quantity Sold</th>
                  </tr>
                </thead>

                <tbody>
                  {dailySales.map((entry, index) => {
                    const dateValue =
                      entry.date ??
                      entry.createdAt ??
                      entry.day;

                    const quantity =
                      entry._sum?.quantity ??
                      entry.quantity ??
                      entry.totalQuantity ??
                      0;

                    return (
                      <tr key={`${dateValue ?? "date"}-${index}`}>
                        <td>{formatDate(dateValue)}</td>
                        <td>{formatNumber(quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DashboardPanel>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  note,
  accent = "blue",
  onClick,
}) {
  const className = `stat-card stat-card-${accent} ${
    onClick ? "stat-card-clickable" : ""
  }`;

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
      >
        <StatCardContent
          label={label}
          value={value}
          icon={icon}
          note={note}
          clickable
        />
      </button>
    );
  }

  return (
    <div className={className}>
      <StatCardContent
        label={label}
        value={value}
        icon={icon}
        note={note}
      />
    </div>
  );
}

function StatCardContent({
  label,
  value,
  icon,
  note,
  clickable,
}) {
  return (
    <>
      <div className="stat-card-header">
        <div>
          <p className="stat-label">{label}</p>
          <h3>{value}</h3>
        </div>

        <span className="stat-icon">{icon}</span>
      </div>

      <div className="stat-footer">
        <span>{note}</span>
        {clickable && <span className="card-arrow">→</span>}
      </div>
    </>
  );
}

function DashboardPanel({
  title,
  subtitle,
  children,
  buttonLabel,
  onButtonClick,
}) {
  return (
    <article className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        {buttonLabel && onButtonClick && (
          <button
            type="button"
            className="panel-button"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </button>
        )}
      </div>

      <div className="panel-body">{children}</div>
    </article>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      className="quick-action"
      onClick={onClick}
    >
      <span className="quick-action-icon">{icon}</span>

      <span className="quick-action-text">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <span className="quick-action-arrow">→</span>
    </button>
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown date";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString();
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value ?? 0));
}

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}
