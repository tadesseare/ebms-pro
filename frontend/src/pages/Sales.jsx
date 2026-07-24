import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import "../styles/ModulePage.css";

const SALES_URL = "/sales";
const PRODUCTS_URL = "/products";
const CUSTOMERS_URL = "/customers";
const INVENTORY_URL = "/inventory";
const emptyForm = {
  productId: "",
  customerId: "",
  quantity: 1,
};

export default function Sales() {
  const token = localStorage.getItem("token");

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const loadSales = async () => {
  const response = await api.get(SALES_URL);

  setSales(
    Array.isArray(response.data) ? response.data : []
  );
};

const loadProducts = async () => {
  const response = await api.get(PRODUCTS_URL);

  setProducts(
    Array.isArray(response.data) ? response.data : []
  );
};

const loadCustomers = async () => {
  const response = await api.get(CUSTOMERS_URL);

  setCustomers(
    Array.isArray(response.data) ? response.data : []
  );
};

const loadInventory = async () => {
  const response = await api.get(INVENTORY_URL);

  setInventory(
    Array.isArray(response.data) ? response.data : []
  );
};

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadSales(),
        loadProducts(),
        loadCustomers(),
        loadInventory(),
      ]);
    } catch (err) {
      console.error("LOAD SALES PAGE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load sales information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    loadPageData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const openSaleModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowSaleModal(true);
  };

  const closeSaleModal = () => {
    resetForm();
    setError("");
    setShowSaleModal(false);
  };

  const selectedProduct = products.find(
    (product) =>
      Number(product.id) === Number(form.productId)
  );

  const selectedInventory = inventory.find(
    (item) =>
      Number(item.productId) === Number(form.productId)
  );

  const availableStock = Number(
    selectedInventory?.quantity || 0
  );

  const selectedPrice = Number(
    selectedProduct?.price || 0
  );

  const saleTotal =
    Number(form.quantity || 0) * selectedPrice;

  const sellableProducts = products.filter((product) => {
    const stockRecord = inventory.find(
      (item) =>
        Number(item.productId) === Number(product.id)
    );

    return Number(stockRecord?.quantity || 0) > 0;
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      setError("Please select a product.");
      return;
    }

    if (!form.customerId) {
      setError("Please select a customer.");
      return;
    }

    if (
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    ) {
      setError(
        "Quantity must be a whole number greater than zero."
      );
      return;
    }

    if (Number(form.quantity) > availableStock) {
      setError(
        `Not enough stock. Only ${availableStock} unit(s) are available.`
      );
      return;
    }

    const payload = {
      productId: Number(form.productId),
      customerId: Number(form.customerId),
      quantity: Number(form.quantity),
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post(
        SALES_URL,
        payload,
        authConfig
      );

      closeSaleModal();

      setSuccess("Sale completed successfully.");

      await Promise.all([
        loadSales(),
        loadInventory(),
      ]);
    } catch (err) {
      console.error("CREATE SALE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to complete the sale."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sale) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete sale #${sale.id}? The sold quantity will be returned to inventory.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `${SALES_URL}/${sale.id}`,
        authConfig
      );

      setSuccess(
        "Sale deleted and inventory restored."
      );

      await Promise.all([
        loadSales(),
        loadInventory(),
      ]);
    } catch (err) {
      console.error("DELETE SALE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete the sale."
      );
    }
  };

  const filteredSales = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return sales;

    return sales.filter((sale) => {
      return (
        sale.product?.name
          ?.toLowerCase()
          .includes(search) ||
        sale.customer?.name
          ?.toLowerCase()
          .includes(search) ||
        String(sale.id).includes(search)
      );
    });
  }, [sales, searchTerm]);

  const totalRevenue = sales.reduce(
    (sum, sale) =>
      sum +
      Number(sale.quantity) *
        Number(sale.pricePerUnit),
    0
  );

  const totalUnitsSold = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.quantity),
    0
  );

  const today = new Date().toDateString();

  const todaySales = sales.filter((sale) => {
    if (!sale.createdAt) return false;

    return (
      new Date(sale.createdAt).toDateString() === today
    );
  });

  const todayRevenue = todaySales.reduce(
    (sum, sale) =>
      sum +
      Number(sale.quantity) *
        Number(sale.pricePerUnit),
    0
  );

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <h1>🛒 Sales Management</h1>

          <p>
            Record customer sales, calculate revenue, and
            automatically reduce product inventory.
          </p>
        </div>

        <div className="live-indicator">
          <span className="live-dot"></span>
          Live Data
        </div>
      </div>

      <div className="module-stat-grid">
        <div className="module-stat-card">
          <div className="stat-icon">🧾</div>

          <div>
            <span>Total Sales</span>
            <strong>{sales.length}</strong>
            <small>Completed sales records</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">💵</div>

          <div>
            <span>Total Revenue</span>
            <strong>
              {formatCurrency(totalRevenue)}
            </strong>
            <small>Revenue from all sales</small>
          </div>
        </div>
F
        <div className="module-stat-card">
          <div className="stat-icon">📦</div>

          <div>
            <span>Units Sold</span>
            <strong>{totalUnitsSold}</strong>
            <small>Total product units sold</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📅</div>

          <div>
            <span>Today’s Revenue</span>
            <strong>
              {formatCurrency(todayRevenue)}
            </strong>
            <small>
              {todaySales.length} sale
              {todaySales.length === 1 ? "" : "s"} today
            </small>
          </div>
        </div>
      </div>

      {error && (
        <div className="module-error">
          {error}
        </div>
      )}

      {success && (
        <div className="module-success">
          {success}
        </div>
      )}

      <div className="module-table-card">
        <div className="module-table-toolbar">
          <input
            type="search"
            placeholder="Search by sale ID, product, or customer..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <button
            type="button"
            className="primary-button"
            onClick={openSaleModal}
            disabled={
              sellableProducts.length === 0 ||
              customers.length === 0
            }
            title={
              sellableProducts.length === 0
                ? "No products currently have available stock."
                : customers.length === 0
                  ? "Create a customer first."
                  : "Create a new sale"
            }
          >
            + New Sale
          </button>
        </div>

        <div className="module-table-wrapper">
          {loading ? (
            <div className="module-state-message">
              Loading sales...
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="module-state-message">
              No sales records found.
            </div>
          ) : (
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Price / Unit</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => {
                  const total =
                    Number(sale.quantity) *
                    Number(sale.pricePerUnit);

                  return (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>

                      <td>
                        <strong>
                          {sale.product?.name || "—"}
                        </strong>
                      </td>

                      <td>
                        {sale.customer?.name || "—"}
                      </td>

                      <td>{sale.quantity}</td>

                      <td>
                        {formatCurrency(
                          sale.pricePerUnit
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(total)}
                        </strong>
                      </td>

                      <td>
                        {sale.createdAt
                          ? new Date(
                              sale.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div className="module-actions">
                          <button
                            type="button"
                            className="view-button"
                            onClick={() =>
                              setSelectedSale(sale)
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleDelete(sale)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={showSaleModal}
        title="Create New Sale"
        onClose={closeSaleModal}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={closeSaleModal}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="sale-form"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Completing..."
                : "Complete Sale"}
            </button>
          </>
        }
      >
        <form
          id="sale-form"
          className="module-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="sale-product">
              Product
            </label>

            <select
              id="sale-product"
              name="productId"
              value={form.productId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select product</option>

              {sellableProducts.map((product) => {
                const stockRecord = inventory.find(
                  (item) =>
                    Number(item.productId) ===
                    Number(product.id)
                );

                return (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} —{" "}
                    {stockRecord?.quantity || 0} available
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sale-customer">
              Customer
            </label>

            <select
              id="sale-customer"
              name="customerId"
              value={form.customerId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select customer</option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sale-quantity">
              Quantity
            </label>

            <input
              id="sale-quantity"
              name="quantity"
              type="number"
              min="1"
              max={
                form.productId
                  ? availableStock
                  : undefined
              }
              step="1"
              value={form.quantity}
              onChange={handleInputChange}
              required
            />

            {form.productId && (
              <small>
                Available stock: {availableStock} unit(s)
              </small>
            )}
          </div>

          <div className="employee-details-grid">
            <div className="detail-item">
              <span className="detail-label">
                Price Per Unit
              </span>

              <strong>
                {formatCurrency(selectedPrice)}
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                Sale Total
              </span>

              <strong>
                {formatCurrency(saleTotal)}
              </strong>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedSale)}
        title="Sale Details"
        onClose={() => setSelectedSale(null)}
        footer={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setSelectedSale(null)}
          >
            Close
          </button>
        }
      >
        {selectedSale && (
          <>
            <div className="employee-profile-summary">
              <div className="employee-profile-avatar">
                🧾
              </div>

              <div>
                <h3>Sale #{selectedSale.id}</h3>

                <p>
                  {selectedSale.product?.name ||
                    "Product sale"}
                </p>
              </div>
            </div>

            <div className="employee-details-grid">
              <div className="detail-item">
                <span className="detail-label">
                  Product
                </span>

                <strong>
                  {selectedSale.product?.name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Customer
                </span>

                <strong>
                  {selectedSale.customer?.name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Quantity
                </span>

                <strong>
                  {selectedSale.quantity}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Price Per Unit
                </span>

                <strong>
                  {formatCurrency(
                    selectedSale.pricePerUnit
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    Number(selectedSale.quantity) *
                      Number(
                        selectedSale.pricePerUnit
                      )
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Sale Date
                </span>

                <strong>
                  {selectedSale.createdAt
                    ? new Date(
                        selectedSale.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </strong>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}