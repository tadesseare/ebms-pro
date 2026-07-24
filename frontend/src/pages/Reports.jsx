import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/api";

const API_URL = "/reports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import "../styles/ModulePage.css";
import "./Reports.css";
const response = await api.get(API_URL);

const EMPTY_SUMMARY = {
  dailySalesTotal: 0,
  dailyPurchaseTotal: 0,
  dailyProfit: 0,
  inventoryCount: 0,
  totalInventoryUnits: 0,
  inventoryValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  totalSalesCount: 0,
  totalPurchasesCount: 0,
};

const EMPTY_PROFIT = {
  revenue: 0,
  cost: 0,
  profit: 0,
  profitMargin: 0,
  salesTransactions: 0,
  purchaseTransactions: 0,
};
const FINANCIAL_COLORS = {
  Revenue: "#2563eb",
  Expenses: "#f59e0b",
  Profit: "#16a34a",
};

const INVENTORY_COLORS = [
  "#16a34a",
  "#f59e0b",
  "#dc2626",
];
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getSalePrice = (sale) =>
  Number(
    sale?.pricePerUnit ??
      sale?.price ??
      sale?.product?.price ??
      0
  );

const getPurchaseCost = (purchase) =>
  Number(
    purchase?.costPerUnit ??
      purchase?.price ??
      purchase?.product?.price ??
      0
  );

const escapeCsvValue = (value) => {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
};

const downloadCsv = (filename, headers, rows) => {
  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      row.map(escapeCsvValue).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export default function Reports() {
  const { token } = useAuth();

  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [profitReport, setProfitReport] =
    useState(EMPTY_PROFIT);
const profitColor =
  Number(profitReport?.profit || 0) >= 0
    ? "#16a34a"
    : "#dc2626";
  const [dailySales, setDailySales] = useState([]);
  const [dailyPurchases, setDailyPurchases] =
    useState([]);
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [activeSection, setActiveSection] =
    useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const loadReports = useCallback(
    async (showRefreshState = false) => {
      if (!token) {
        setError(
          "Authentication token is missing. Please log in again."
        );
        setLoading(false);
        return;
      }

      try {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [
          summaryResponse,
          profitResponse,
          salesResponse,
          purchasesResponse,
          inventoryResponse,
          lowStockResponse,
        ] = await Promise.all([
          api.get(`${API_URL}/dashboard-summary`, {
            headers: authHeaders,
          }),

          api.get(`${API_URL}/profit`, {
            headers: authHeaders,
          }),

          api.get(`${API_URL}/sales/daily`, {
            headers: authHeaders,
          }),

          api.get(`${API_URL}/purchases/daily`, {
            headers: authHeaders,
          }),

          api.get(`${API_URL}/inventory/summary`, {
            headers: authHeaders,
          }),

          api.get(`${API_URL}/inventory/low-stock`, {
            headers: authHeaders,
          }),
        ]);

        setSummary({
          ...EMPTY_SUMMARY,
          ...summaryResponse.data,
        });

        setProfitReport({
          ...EMPTY_PROFIT,
          ...profitResponse.data,
        });

        setDailySales(
          Array.isArray(salesResponse.data)
            ? salesResponse.data
            : []
        );

        setDailyPurchases(
          Array.isArray(purchasesResponse.data)
            ? purchasesResponse.data
            : []
        );

        setInventory(
          Array.isArray(inventoryResponse.data)
            ? inventoryResponse.data
            : []
        );

        setLowStock(
          Array.isArray(lowStockResponse.data)
            ? lowStockResponse.data
            : []
        );
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Reports loading error:", err);

        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load reports.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authHeaders, token]
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredSales = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return dailySales;
    }

    return dailySales.filter((sale) => {
      const productName =
        sale.product?.name?.toLowerCase() || "";

      const customerName =
        sale.customer?.name?.toLowerCase() ||
        "walk-in customer";

      return (
        productName.includes(keyword) ||
        customerName.includes(keyword) ||
        String(sale.id).includes(keyword)
      );
    });
  }, [dailySales, searchTerm]);

  const filteredPurchases = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return dailyPurchases;
    }

    return dailyPurchases.filter((purchase) => {
      const productName =
        purchase.product?.name?.toLowerCase() ||
        "";

      const supplierName =
        purchase.supplier?.name?.toLowerCase() ||
        "";

      return (
        productName.includes(keyword) ||
        supplierName.includes(keyword) ||
        String(purchase.id).includes(keyword)
      );
    });
  }, [dailyPurchases, searchTerm]);

  const filteredInventory = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return inventory;
    }

    return inventory.filter((item) => {
      const productName =
        item.product?.name?.toLowerCase() || "";

      const status =
        item.stockStatus?.toLowerCase() || "";

      return (
        productName.includes(keyword) ||
        status.includes(keyword) ||
        String(item.id).includes(keyword)
      );
    });
  }, [inventory, searchTerm]);

  const filteredLowStock = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return lowStock;
    }

    return lowStock.filter((item) => {
      const productName =
        item.product?.name?.toLowerCase() || "";

      return (
        productName.includes(keyword) ||
        String(item.id).includes(keyword)
      );
    });
  }, [lowStock, searchTerm]);

  const financialChartData = useMemo(
    () => [
      {
        name: "Revenue",
        amount: Number(profitReport.revenue) || 0,
      },
      {
        name: "Expenses",
        amount: Number(profitReport.cost) || 0,
      },
      {
        name: "Profit",
        amount: Number(profitReport.profit) || 0,
      },
    ],
    [profitReport]
  );

  const inventoryStatusData = useMemo(() => {
    let inStock = 0;
    let lowStockCount = 0;
    let outOfStock = 0;

    inventory.forEach((item) => {
      const quantity = Number(item.quantity) || 0;

      if (quantity === 0) {
        outOfStock += 1;
      } else if (quantity <= 10) {
        lowStockCount += 1;
      } else {
        inStock += 1;
      }
    });

    return [
      {
        name: "In Stock",
        value: inStock,
      },
      {
        name: "Low Stock",
        value: lowStockCount,
      },
      {
        name: "Out of Stock",
        value: outOfStock,
      },
    ];
  }, [inventory]);

  const salesTodayTotal = useMemo(
    () =>
      dailySales.reduce((total, sale) => {
        const amount =
          sale.total ??
          Number(sale.quantity) *
            getSalePrice(sale);

        return total + Number(amount || 0);
      }, 0),
    [dailySales]
  );

  const purchasesTodayTotal = useMemo(
    () =>
      dailyPurchases.reduce((total, purchase) => {
        const amount =
          purchase.total ??
          Number(purchase.quantity) *
            getPurchaseCost(purchase);

        return total + Number(amount || 0);
      }, 0),
    [dailyPurchases]
  );
  const exportSummary = () => {
  const rows = [
    [
      "Total Revenue",
      Number(profitReport.revenue || 0).toFixed(2),
    ],
    [
      "Total Expenses",
      Number(profitReport.cost || 0).toFixed(2),
    ],
    [
      "Estimated Profit",
      Number(profitReport.profit || 0).toFixed(2),
    ],
    [
      "Profit Margin",
      `${Number(
        profitReport.profitMargin || 0
      ).toFixed(1)}%`,
    ],
    [
      "Inventory Value",
      Number(summary.inventoryValue || 0).toFixed(2),
    ],
    [
      "Inventory Units",
      Number(summary.totalInventoryUnits || 0),
    ],
    [
      "Sales Today",
      Number(
        summary.dailySalesTotal || salesTodayTotal
      ).toFixed(2),
    ],
    [
      "Purchases Today",
      Number(
        summary.dailyPurchaseTotal ||
          purchasesTodayTotal
      ).toFixed(2),
    ],
    [
      "Low Stock Products",
      Number(summary.lowStockCount || 0),
    ],
    [
      "Out of Stock Products",
      Number(summary.outOfStockCount || 0),
    ],
    [
      "Total Sales Records",
      Number(summary.totalSalesCount || 0),
    ],
    [
      "Total Purchase Records",
      Number(summary.totalPurchasesCount || 0),
    ],
    [
      "Generated At",
      new Date().toLocaleString("en-US"),
    ],
  ];

  downloadCsv(
    "ebms-business-summary-report.csv",
    ["Report Metric", "Value"],
    rows
  );
};

const printReport = () => {
  window.print();
};
  const exportSales = () => {
    const rows = filteredSales.map((sale) => {
      const price = getSalePrice(sale);
      const total =
        sale.total ??
        Number(sale.quantity) * price;

      return [
        sale.id,
        sale.product?.name || "Unknown product",
        sale.customer?.name || "Walk-in customer",
        sale.quantity,
        price.toFixed(2),
        Number(total).toFixed(2),
        formatDate(sale.createdAt),
      ];
    });

    downloadCsv(
      "ebms-daily-sales-report.csv",
      [
        "ID",
        "Product",
        "Customer",
        "Quantity",
        "Price Per Unit",
        "Total",
        "Date",
      ],
      rows
    );
  };

  const exportPurchases = () => {
    const rows = filteredPurchases.map(
      (purchase) => {
        const cost = getPurchaseCost(purchase);
        const total =
          purchase.total ??
          Number(purchase.quantity) * cost;

        return [
          purchase.id,
          purchase.product?.name ||
            "Unknown product",
          purchase.supplier?.name ||
            "Unknown supplier",
          purchase.quantity,
          cost.toFixed(2),
          Number(total).toFixed(2),
          formatDate(purchase.createdAt),
        ];
      }
    );

    downloadCsv(
      "ebms-daily-purchases-report.csv",
      [
        "ID",
        "Product",
        "Supplier",
        "Quantity",
        "Cost Per Unit",
        "Total",
        "Date",
      ],
      rows
    );
  };

  const exportInventory = () => {
    const rows = filteredInventory.map((item) => [
      item.id,
      item.product?.name || "Unknown product",
      item.quantity,
      item.stockStatus || "Unknown",
      Number(item.product?.price || 0).toFixed(2),
      Number(item.inventoryValue || 0).toFixed(2),
    ]);

    downloadCsv(
      "ebms-inventory-report.csv",
      [
        "ID",
        "Product",
        "Quantity",
        "Stock Status",
        "Product Price",
        "Inventory Value",
      ],
      rows
    );
  };

  const getStatusClass = (quantity) => {
    const amount = Number(quantity) || 0;

    if (amount === 0) {
      return "status-badge status-inactive";
    }

    if (amount <= 10) {
      return "status-badge status-warning";
    }

    return "status-badge status-active";
  };

  const getStockLabel = (quantity) => {
    const amount = Number(quantity) || 0;

    if (amount === 0) {
      return "Out of Stock";
    }

    if (amount <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-loading">
          <div className="loading-spinner" />
          <p>Loading business reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      <div className="module-page-header">
        <div>
          <div className="module-title-row">
            <div className="module-title-icon">📈</div>

            <div>
              <h1>Business Reports</h1>
              <p>
                Review financial performance, sales,
                purchases, inventory, and stock alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="reports-toolbar">
  <div className="reports-toolbar-status">
    <span className="live-data-indicator">
      <span className="live-data-dot" />
      Live Data
    </span>

    <span className="last-updated-text">
      Updated:{" "}
      {lastUpdated
        ? lastUpdated.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "—"}
    </span>
  </div>

  <div className="reports-toolbar-actions">
    <button
      type="button"
      className="report-action-button"
      onClick={exportSummary}
    >
      <span>📥</span>
      Export Summary
    </button>

    <button
      type="button"
      className="report-action-button"
      onClick={printReport}
    >
      <span>🖨️</span>
      Print
    </button>

    <button
      type="button"
      className="report-refresh-button"
      onClick={() => loadReports(true)}
      disabled={refreshing}
    >
      <span className={refreshing ? "refresh-icon spinning" : "refresh-icon"}>
        ↻
      </span>

      {refreshing ? "Refreshing..." : "Refresh"}
    </button>
  </div>
</div>
</div>

      {error && (
        <div className="module-error">
          <span>⚠️</span>
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadReports()}
          >
            Try Again
          </button>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div>
            <span className="stat-card-label">
              Total Revenue
            </span>
            <strong>
              {formatCurrency(profitReport.revenue)}
            </strong>
            <small>
              {formatNumber(
                profitReport.salesTransactions
              )}{" "}
              sales transactions
            </small>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-icon">💳</div>
          <div>
            <span className="stat-card-label">
              Total Expenses
            </span>
            <strong>
              {formatCurrency(profitReport.cost)}
            </strong>
            <small>
              {formatNumber(
                profitReport.purchaseTransactions
              )}{" "}
              purchase transactions
            </small>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-icon">📊</div>
          <div>
            <span className="stat-card-label">
              Estimated Profit
            </span>
            <strong
  className={
    Number(profitReport.profit) >= 0
      ? "positive-amount"
      : "negative-amount"
  }
>
       {formatCurrency(profitReport.profit)}
       </strong>
            <small>
              {Number(
                profitReport.profitMargin || 0
              ).toFixed(1)}
              % profit margin
            </small>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-icon">📦</div>
          <div>
            <span className="stat-card-label">
              Inventory Value
            </span>
            <strong>
              {formatCurrency(summary.inventoryValue)}
            </strong>
            <small>
              {formatNumber(
                summary.totalInventoryUnits
              )}{" "}
              units available
            </small>
          </div>
        </article>
      </section>

      <section className="stats-grid">
        <article className="stat-card compact-stat-card">
          <div className="stat-card-icon">🛒</div>
          <div>
            <span className="stat-card-label">
              Sales Today
            </span>
            <strong>
              {formatCurrency(
                summary.dailySalesTotal ||
                  salesTodayTotal
              )}
            </strong>
          </div>
        </article>

        <article className="stat-card compact-stat-card">
          <div className="stat-card-icon">🚚</div>
          <div>
            <span className="stat-card-label">
              Purchases Today
            </span>
            <strong>
              {formatCurrency(
                summary.dailyPurchaseTotal ||
                  purchasesTodayTotal
              )}
            </strong>
          </div>
        </article>

        <article className="stat-card compact-stat-card">
          <div className="stat-card-icon">⚠️</div>
          <div>
            <span className="stat-card-label">
              Low Stock
            </span>
            <strong>
              {formatNumber(summary.lowStockCount)}
            </strong>
          </div>
        </article>

        <article className="stat-card compact-stat-card">
          <div className="stat-card-icon">⛔</div>
          <div>
            <span className="stat-card-label">
              Out of Stock
            </span>
            <strong>
              {formatNumber(
                summary.outOfStockCount
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="reports-chart-grid">
        <article className="module-card chart-card">
          <div className="card-heading">
            <div>
              <h2>Financial Overview</h2>
              <p>
                Revenue, purchase expenses, and
                estimated profit.
              </p>
            </div>
          </div>

          <div className="report-chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={financialChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />
  <Bar
  dataKey="amount"
  name="Amount"
  radius={[8, 8, 0, 0]}
>
  {financialChartData.map((entry) => (
    <Cell
      key={entry.name}
      fill={
        entry.name === "Profit"
          ? profitColor
          : FINANCIAL_COLORS[entry.name]
      }
    />
  ))}
 </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="module-card chart-card">
          <div className="card-heading">
            <div>
              <h2>Inventory Status</h2>
              <p>
                Current product stock distribution.
              </p>
            </div>
          </div>

          <div className="report-chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  label
                >
                  {inventoryStatusData.map(
                    (entry, index) => (
                     <Cell
                    key={`${entry.name}-${index}`}
                    fill={INVENTORY_COLORS[index]}
                   />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="module-card">
        <div className="report-navigation">
          <div className="report-tabs">
            <button
              type="button"
              className={
                activeSection === "overview"
                  ? "report-tab active"
                  : "report-tab"
              }
              onClick={() =>
                setActiveSection("overview")
              }
            >
              Overview
            </button>

            <button
              type="button"
              className={
                activeSection === "sales"
                  ? "report-tab active"
                  : "report-tab"
              }
              onClick={() =>
                setActiveSection("sales")
              }
            >
              Daily Sales
            </button>

            <button
              type="button"
              className={
                activeSection === "purchases"
                  ? "report-tab active"
                  : "report-tab"
              }
              onClick={() =>
                setActiveSection("purchases")
              }
            >
              Daily Purchases
            </button>

            <button
              type="button"
              className={
                activeSection === "inventory"
                  ? "report-tab active"
                  : "report-tab"
              }
              onClick={() =>
                setActiveSection("inventory")
              }
            >
              Inventory
            </button>

            <button
              type="button"
              className={
                activeSection === "low-stock"
                  ? "report-tab active"
                  : "report-tab"
              }
              onClick={() =>
                setActiveSection("low-stock")
              }
            >
              Low Stock
            </button>
          </div>

          {activeSection !== "overview" && (
            <div className="module-search">
              <span>🔍</span>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search report..."
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {activeSection === "overview" && (
          <div className="report-overview-grid">
            <article className="report-summary-panel">
              <span>Today's estimated result</span>

              <strong
                className={
                  Number(summary.dailyProfit) >= 0
                    ? "positive-amount"
                    : "negative-amount"
                }
              >
                {formatCurrency(
                  summary.dailyProfit
                )}
              </strong>

              <p>
                Sales today minus purchases today.
              </p>
            </article>

            <article className="report-summary-panel">
              <span>Products tracked</span>

              <strong>
                {formatNumber(
                  summary.inventoryCount
                )}
              </strong>

              <p>
                Products currently represented in
                inventory.
              </p>
            </article>

            <article className="report-summary-panel">
              <span>Total sales records</span>

              <strong>
                {formatNumber(
                  summary.totalSalesCount
                )}
              </strong>

              <p>
                All completed sales transactions.
              </p>
            </article>

            <article className="report-summary-panel">
              <span>Total purchase records</span>

              <strong>
                {formatNumber(
                  summary.totalPurchasesCount
                )}
              </strong>

              <p>
                All recorded supplier purchases.
              </p>
            </article>
          </div>
        )}

        {activeSection === "sales" && (
          <>
            <div className="table-section-header">
              <div>
                <h2>Daily Sales Report</h2>
                <p>
                  Sales completed during the current
                  day.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={exportSales}
                disabled={filteredSales.length === 0}
              >
                Download CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="module-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="empty-table-cell"
                      >
                        No daily sales records found.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => {
                      const price =
                        getSalePrice(sale);

                      const total =
                        sale.total ??
                        Number(sale.quantity) *
                          price;

                      return (
                        <tr key={sale.id}>
                          <td>#{sale.id}</td>
                          <td>
                            <strong>
                              {sale.product?.name ||
                                "Unknown product"}
                            </strong>
                          </td>
                          <td>
                            {sale.customer?.name ||
                              "Walk-in customer"}
                          </td>
                          <td>
                            {formatNumber(
                              sale.quantity
                            )}
                          </td>
                          <td>
                            {formatCurrency(price)}
                          </td>
                          <td>
                            <strong>
                              {formatCurrency(total)}
                            </strong>
                          </td>
                          <td>
                            {formatDate(
                              sale.createdAt
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "purchases" && (
          <>
            <div className="table-section-header">
              <div>
                <h2>Daily Purchase Report</h2>
                <p>
                  Purchases recorded during the
                  current day.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={exportPurchases}
                disabled={
                  filteredPurchases.length === 0
                }
              >
                Download CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="module-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Supplier</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="empty-table-cell"
                      >
                        No daily purchase records
                        found.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map(
                      (purchase) => {
                        const cost =
                          getPurchaseCost(purchase);

                        const total =
                          purchase.total ??
                          Number(
                            purchase.quantity
                          ) * cost;

                        return (
                          <tr key={purchase.id}>
                            <td>#{purchase.id}</td>
                            <td>
                              <strong>
                                {purchase.product
                                  ?.name ||
                                  "Unknown product"}
                              </strong>
                            </td>
                            <td>
                              {purchase.supplier
                                ?.name ||
                                "Unknown supplier"}
                            </td>
                            <td>
                              {formatNumber(
                                purchase.quantity
                              )}
                            </td>
                            <td>
                              {formatCurrency(cost)}
                            </td>
                            <td>
                              <strong>
                                {formatCurrency(
                                  total
                                )}
                              </strong>
                            </td>
                            <td>
                              {formatDate(
                                purchase.createdAt
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "inventory" && (
          <>
            <div className="table-section-header">
              <div>
                <h2>Inventory Summary</h2>
                <p>
                  Current quantities, values, and
                  stock conditions.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={exportInventory}
                disabled={
                  filteredInventory.length === 0
                }
              >
                Download CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="module-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Product Price</th>
                    <th>Inventory Value</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="empty-table-cell"
                      >
                        No inventory records found.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>
                          <strong>
                            {item.product?.name ||
                              "Unknown product"}
                          </strong>
                        </td>
                        <td>
                          {formatNumber(
                            item.quantity
                          )}
                        </td>
                        <td>
                          <span
                            className={getStatusClass(
                              item.quantity
                            )}
                          >
                            {item.stockStatus ||
                              getStockLabel(
                                item.quantity
                              )}
                          </span>
                        </td>
                        <td>
                          {formatCurrency(
                            item.product?.price
                          )}
                        </td>
                        <td>
                          <strong>
                            {formatCurrency(
                              item.inventoryValue
                            )}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSection === "low-stock" && (
          <>
            <div className="table-section-header">
              <div>
                <h2>Low-Stock Alerts</h2>
                <p>
                  Products that may require
                  replenishment.
                </p>
              </div>

              <span className="report-count-badge">
                {filteredLowStock.length} item
                {filteredLowStock.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            <div className="table-responsive">
              <table className="module-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Quantity Remaining</th>
                    <th>Status</th>
                    <th>Recommendation</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLowStock.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="empty-table-cell"
                      >
                        No low-stock products found.
                      </td>
                    </tr>
                  ) : (
                    filteredLowStock.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>
                          <strong>
                            {item.product?.name ||
                              "Unknown product"}
                          </strong>
                        </td>
                        <td>
                          {formatNumber(
                            item.quantity
                          )}
                        </td>
                        <td>
                          <span
                            className={getStatusClass(
                              item.quantity
                            )}
                          >
                            {getStockLabel(
                              item.quantity
                            )}
                          </span>
                        </td>
                        <td>
                          {Number(item.quantity) === 0
                            ? "Restock immediately"
                            : "Consider replenishment"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}