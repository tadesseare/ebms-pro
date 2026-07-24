import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
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

        const response = await api.get("/api/dashboard/stats", {
         
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
  const workforce = data.workforce ?? {};

const activeEmployees = Number(workforce.active ?? 0);
const employeesOnLeave = Number(workforce.onLeave ?? 0);
const inactiveEmployees = Number(workforce.inactive ?? 0);
const averageSalary = Number(workforce.averageSalary ?? 0);

const newestEmployee =
  workforce.newestEmployee?.name ??
  workforce.newestEmployee ??
  "Not available";

  const mostCommonPosition =
  workforce.largestDepartment?.name ??
  workforce.largestDepartment ??
  "Not available";

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

const recentActivities = Array.isArray(data.recentActivities)
  ? data.recentActivities
  : [];

const healthScore =
  profitToday > 0
    ? lowStock.length === 0
      ? 95
      : 82
    : 60;

const healthStatus =
  healthScore >= 90
    ? "Excellent"
    : healthScore >= 75
      ? "Good"
      : healthScore >= 60
        ? "Fair"
        : "Needs Attention";

const dailySalesChart = dailySales.map((item) => ({
  day: formatDate(
    item.date ??
      item.createdAt ??
      item.day
  ),
  quantity: Number(
    item._sum?.quantity ??
      item.quantity ??
      item.totalQuantity ??
      0
  ),
}));
  //   const recentActivities = Array.isArray(data.recentActivities)
  // ? data.recentActivities
  // : [];

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

   <h1>Executive Business Dashboard</h1>

<p className="dashboard-welcome">
  Welcome back, <strong>{displayName}</strong>.
</p>

<p className="dashboard-subtitle">
  Here&apos;s your EBMS PRO business overview for today.
</p>

    <div className="dashboard-meta">
      <span>{currentDate}</span>

      {user?.role && (
        <span className="role-badge">
          {user.role}
        </span>
      )}
    </div>
  </div>
<div className="dashboard-highlight-strip">
  <div>
    <span>Today&apos;s Profit</span>
    <strong
      className={
        profitToday >= 0
          ? "highlight-positive"
          : "highlight-negative"
      }
    >
      {formatCurrency(profitToday)}
    </strong>
  </div>

  <div>
    <span>Low Stock</span>
    <strong>{formatNumber(lowStock.length)}</strong>
  </div>

  <div>
    <span>Business Health</span>
    <strong>{healthScore}%</strong>
  </div>
</div>
  <div className="dashboard-toolbar">
    <div className="live-status">
      <span className="live-dot"></span>

      <div>
        <strong>Live Database</strong>
        <small>Connected</small>
      </div>
    </div>

    <div className="last-updated">
      <small>Updated</small>
      <strong>
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </strong>
    </div>

    <button
      type="button"
      className="refresh-button"
      onClick={() => fetchDashboard(true)}
      disabled={refreshing}
    >
      <span
        className={
          refreshing
            ? "refresh-icon spinning"
            : "refresh-icon"
        }
      >
        ↻
      </span>

      {refreshing
        ? "Refreshing..."
        : "Refresh Dashboard"}
    </button>
  </div>
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

  <article className="business-health">

    <div className="business-health-header">

      <div>

        <p className="section-kicker">
          Executive Summary
        </p>

        <h2>
          Business Health
        </h2>

      </div>

      <span
        className={`health-badge ${
          healthScore >= 90
            ? "excellent"
            : healthScore >= 75
            ? "good"
            : "warning"
        }`}
      >
        {healthStatus}
      </span>

    </div>

    <div className="health-progress">

      <div
        className="health-progress-fill"
        style={{
          width: `${healthScore}%`,
        }}
      />

    </div>

    <div className="health-score">

      <h1>{healthScore}%</h1>

      <p>
        Overall Business Performance
      </p>

    </div>

    <div className="health-list">

      <div>

        {profitToday >= 0 ? "✅" : "⚠️"}

        Revenue Performance

      </div>

      <div>

        {lowStock.length === 0 ? "✅" : "⚠️"}

        Inventory Status

      </div>

      <div>

        {employees > 0 ? "✅" : "⚠️"}

        Workforce Ready

      </div>

    </div>

  </article>

  </section>
  <section className="dashboard-section">
  <div className="section-heading">
    <div>
      <p className="section-kicker">System Activity</p>
      <h2>Recent Activity</h2>
    </div>

    <p>Latest transactions and updates across EBMS PRO.</p>
  </div>

  <article className="activity-panel">
    <div className="activity-panel-header">
      <div>
        <h3>Business Timeline</h3>
        <p>Recent events recorded in the system.</p>
      </div>

      <span className="activity-live-badge">
        <span className="activity-live-dot"></span>
        Live
      </span>
    </div>

    <div className="activity-list">
      {recentActivities.length === 0 ? (
        <div className="activity-empty">
          <span>🕘</span>

          <div>
            <strong>No recent activity available</strong>
            <p>
              New sales, purchases, employees, customers, and inventory
              updates will appear here.
            </p>
          </div>
        </div>
      ) : (
        recentActivities.map((activity, index) => (
          <ActivityItem
            key={activity.id ?? index}
            activity={activity}
          />
        ))
      )}
    </div>
  </article>
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
  <div className="section-heading">
    <div>
      <p className="section-kicker">Human Resources</p>
      <h2>Workforce Overview</h2>
    </div>

    <p>Current employee status and workforce information.</p>
  </div>

  <div className="workforce-layout">
    <div className="workforce-kpi-grid">
      <WorkforceCard
        label="Total Employees"
        value={formatNumber(employees)}
        icon="👥"
        accent="blue"
      />

      <WorkforceCard
        label="Active Employees"
        value={formatNumber(activeEmployees)}
        icon="✓"
        accent="green"
      />

      <WorkforceCard
        label="On Leave"
        value={formatNumber(employeesOnLeave)}
        icon="◷"
        accent="orange"
      />

      <WorkforceCard
        label="Inactive"
        value={formatNumber(inactiveEmployees)}
        icon="−"
        accent="red"
      />
    </div>

    <article className="workforce-details-card">
      <div className="workforce-details-header">
        <div>
          <p className="section-kicker">Workforce Insights</p>
          <h3>Employee Summary</h3>
        </div>

        <button
          type="button"
          className="panel-button"
          onClick={() => navigate("/employees")}
        >
          View Employees
        </button>
      </div>

      <div className="workforce-detail-list">
        <WorkforceDetail
          label="Average Salary"
          value={
            averageSalary > 0
              ? formatCurrency(averageSalary)
              : "Not available"
          }
          icon="💵"
        />

        <WorkforceDetail
          label="Newest Employee"
          value={newestEmployee}
          icon="👤"
        />

       <WorkforceDetail
       label="Most Common Position"
       value={mostCommonPosition}
       icon="💼"
     />
      </div>
    </article>
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
      <div className="dashboard-chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={dailySalesChart}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

     <XAxis
     dataKey="day"
      tick={{ fontSize: 12 }}
    />

    <YAxis
    allowDecimals={false}
   />
            <Tooltip
              formatter={(value) => [
                formatNumber(value),
                "Quantity Sold",
              ]}
            />

            <Area
              type="monotone"
              dataKey="quantity"
              stroke="#2563eb"
              fill="#bfdbfe"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </DashboardPanel>
</section>
    </main>
  );
}
function ActivityItem({ activity }) {
  const type = activity.type ?? "general";

  const activityConfig = {
    sale: {
      icon: "💰",
      className: "sale",
    },
    purchase: {
      icon: "🛒",
      className: "purchase",
    },
    employee: {
      icon: "👤",
      className: "employee",
    },
    customer: {
      icon: "🤝",
      className: "customer",
    },
    supplier: {
      icon: "🚚",
      className: "supplier",
    },
    product: {
      icon: "📦",
      className: "product",
    },
    inventory: {
      icon: "🏬",
      className: "inventory",
    },
    general: {
      icon: "🔔",
      className: "general",
    },
  };

  const config =
    activityConfig[type] ??
    activityConfig.general;

  const title =
    activity.title ??
    activity.message ??
    "Business activity recorded";

  const description =
    activity.description ??
    activity.details ??
    "";

  const dateValue =
    activity.createdAt ??
    activity.date ??
    activity.timestamp;

  return (
    <div className="activity-item">
      <div
        className={`activity-icon activity-icon-${config.className}`}
      >
        {config.icon}
      </div>

      <div className="activity-content">
        <div className="activity-title-row">
          <strong>{title}</strong>

          <span>{formatActivityTime(dateValue)}</span>
        </div>

        {description && <p>{description}</p>}
      </div>
    </div>
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
function WorkforceCard({
  label,
  value,
  icon,
  accent = "blue",
}) {
  return (
    <article
      className={`workforce-card workforce-card-${accent}`}
    >
      <div className="workforce-card-icon">
        {icon}
      </div>

      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </article>
  );
}

function WorkforceDetail({
  label,
  value,
  icon,
}) {
  return (
    <div className="workforce-detail">
      <span className="workforce-detail-icon">
        {icon}
      </span>

      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
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
function formatActivityTime(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const activityDate = new Date(dateValue);

  if (Number.isNaN(activityDate.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const difference = now.getTime() - activityDate.getTime();

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return activityDate.toLocaleDateString();
}