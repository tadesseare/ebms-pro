import {
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import "../styles/ModulePage.css";

const PURCHASES_URL = "/purchases";
const PRODUCTS_URL = "/products";
const SUPPLIERS_URL = "/suppliers";
const INVENTORY_URL = "/inventory";

const emptyForm = {
  productId: "",
  supplierId: "",
  quantity: 1,
  costPerUnit: "",
};

export default function Purchases() {
  const token = localStorage.getItem("token");

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [selectedPurchase, setSelectedPurchase] =
    useState(null);

  const [showPurchaseModal, setShowPurchaseModal] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authConfig = {
   
  };

  const loadPurchases = async () => {
    const response = await api.get(
      PURCHASES_URL,
      authConfig
    );

    setPurchases(
      Array.isArray(response.data)
        ? response.data
        : []
    );
  };

  const loadProducts = async () => {
    const response = await api.get(
      PRODUCTS_URL,
      authConfig
    );

    setProducts(
      Array.isArray(response.data)
        ? response.data
        : []
    );
  };

  const loadSuppliers = async () => {
    const response = await api.get(
      SUPPLIERS_URL,
      authConfig
    );

    setSuppliers(
      Array.isArray(response.data)
        ? response.data
        : []
    );
  };

  const loadInventory = async () => {
    const response = await api.get(
      INVENTORY_URL,
      authConfig
    );

    setInventory(
      Array.isArray(response.data)
        ? response.data
        : []
    );
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadPurchases(),
        loadProducts(),
        loadSuppliers(),
        loadInventory(),
      ]);
    } catch (err) {
      console.error(
        "LOAD PURCHASE PAGE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load purchase information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Please log in first.");
      return;
    }

    loadPageData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const openPurchaseModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    resetForm();
    setError("");
    setShowPurchaseModal(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const selectedInventory = inventory.find(
    (item) =>
      Number(item.productId) ===
      Number(form.productId)
  );

  const currentStock = Number(
    selectedInventory?.quantity || 0
  );

  const purchaseTotal =
    Number(form.quantity || 0) *
    Number(form.costPerUnit || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      setError("Please select a product.");
      return;
    }

    if (!form.supplierId) {
      setError("Please select a supplier.");
      return;
    }

    const quantity = Number(form.quantity);
    const costPerUnit = Number(
      form.costPerUnit
    );

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Quantity must be a whole number greater than zero."
      );
      return;
    }

    if (
      !Number.isFinite(costPerUnit) ||
      costPerUnit <= 0
    ) {
      setError(
        "Cost per unit must be greater than zero."
      );
      return;
    }

    const payload = {
      productId: Number(form.productId),
      supplierId: Number(form.supplierId),
      quantity,
      costPerUnit,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.post(
        PURCHASES_URL,
        payload,
        authConfig
      );

      closePurchaseModal();

      setSuccess(
        "Purchase recorded and inventory increased successfully."
      );

      await Promise.all([
        loadPurchases(),
        loadInventory(),
      ]);
    } catch (err) {
      console.error(
        "CREATE PURCHASE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to record the purchase."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (purchase) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete purchase #${purchase.id}? Its quantity will be removed from inventory.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `${PURCHASES_URL}/${purchase.id}`,
        authConfig
      );

      setSuccess(
        "Purchase deleted and inventory adjusted."
      );

      await Promise.all([
        loadPurchases(),
        loadInventory(),
      ]);
    } catch (err) {
      console.error(
        "DELETE PURCHASE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete the purchase."
      );
    }
  };

  const filteredPurchases = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) return purchases;

    return purchases.filter((purchase) => {
      return (
        purchase.product?.name
          ?.toLowerCase()
          .includes(search) ||
        purchase.supplier?.name
          ?.toLowerCase()
          .includes(search) ||
        String(purchase.id).includes(search)
      );
    });
  }, [purchases, searchTerm]);

  const totalPurchaseCost = purchases.reduce(
    (sum, purchase) =>
      sum +
      Number(purchase.quantity) *
        Number(purchase.costPerUnit),
    0
  );

  const totalUnitsPurchased = purchases.reduce(
    (sum, purchase) =>
      sum + Number(purchase.quantity),
    0
  );

  const today = new Date().toDateString();

  const todayPurchases = purchases.filter(
    (purchase) => {
      if (!purchase.createdAt) return false;

      return (
        new Date(
          purchase.createdAt
        ).toDateString() === today
      );
    }
  );

  const todayPurchaseCost =
    todayPurchases.reduce(
      (sum, purchase) =>
        sum +
        Number(purchase.quantity) *
          Number(purchase.costPerUnit),
      0
    );

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    );

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <h1>🧾 Purchase Management</h1>

          <p>
            Record supplier purchases, monitor business
            expenses, and automatically increase product
            inventory.
          </p>
        </div>

        <div className="live-indicator">
          <span className="live-dot"></span>
          Live Data
        </div>
      </div>

      <div className="module-stat-grid">
        <div className="module-stat-card">
          <div className="stat-icon">📑</div>

          <div>
            <span>Total Purchases</span>
            <strong>{purchases.length}</strong>
            <small>Recorded purchase transactions</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">💳</div>

          <div>
            <span>Total Expenses</span>
            <strong>
              {formatCurrency(
                totalPurchaseCost
              )}
            </strong>
            <small>Cost of all purchases</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📦</div>

          <div>
            <span>Units Purchased</span>
            <strong>
              {totalUnitsPurchased}
            </strong>
            <small>Total units received</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📅</div>

          <div>
            <span>Today’s Expenses</span>
            <strong>
              {formatCurrency(
                todayPurchaseCost
              )}
            </strong>

            <small>
              {todayPurchases.length} purchase
              {todayPurchases.length === 1
                ? ""
                : "s"}{" "}
              today
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
            placeholder="Search by purchase ID, product, or supplier..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <button
            type="button"
            className="primary-button"
            onClick={openPurchaseModal}
            disabled={
              products.length === 0 ||
              suppliers.length === 0
            }
          >
            + New Purchase
          </button>
        </div>

        <div className="module-table-wrapper">
          {loading ? (
            <div className="module-state-message">
              Loading purchases...
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="module-state-message">
              No purchase records found.
            </div>
          ) : (
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Cost / Unit</th>
                  <th>Total Cost</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.map(
                  (purchase) => {
                    const total =
                      Number(
                        purchase.quantity
                      ) *
                      Number(
                        purchase.costPerUnit
                      );

                    return (
                      <tr key={purchase.id}>
                        <td>#{purchase.id}</td>

                        <td>
                          <strong>
                            {purchase.product
                              ?.name || "—"}
                          </strong>
                        </td>

                        <td>
                          {purchase.supplier
                            ?.name || "—"}
                        </td>

                        <td>
                          {purchase.quantity}
                        </td>

                        <td>
                          {formatCurrency(
                            purchase.costPerUnit
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              total
                            )}
                          </strong>
                        </td>

                        <td>
                          {purchase.createdAt
                            ? new Date(
                                purchase.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td>
                          <div className="module-actions">
                            <button
                              type="button"
                              className="view-button"
                              onClick={() =>
                                setSelectedPurchase(
                                  purchase
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  purchase
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={showPurchaseModal}
        title="Record New Purchase"
        onClose={closePurchaseModal}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={closePurchaseModal}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="purchase-form"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Recording..."
                : "Record Purchase"}
            </button>
          </>
        }
      >
        <form
          id="purchase-form"
          className="module-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="purchase-product">
              Product
            </label>

            <select
              id="purchase-product"
              name="productId"
              value={form.productId}
              onChange={handleInputChange}
              required
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>

            {form.productId && (
              <small>
                Current inventory: {currentStock}{" "}
                unit(s)
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="purchase-supplier">
              Supplier
            </label>

            <select
              id="purchase-supplier"
              name="supplierId"
              value={form.supplierId}
              onChange={handleInputChange}
              required
            >
              <option value="">
                Select supplier
              </option>

              {suppliers.map((supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purchase-quantity">
              Quantity
            </label>

            <input
              id="purchase-quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="purchase-cost">
              Cost Per Unit
            </label>

            <input
              id="purchase-cost"
              name="costPerUnit"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter purchase cost"
              value={form.costPerUnit}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="employee-details-grid">
            <div className="detail-item">
              <span className="detail-label">
                Current Stock
              </span>

              <strong>
                {currentStock} unit(s)
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                Stock After Purchase
              </span>

              <strong>
                {currentStock +
                  Number(form.quantity || 0)}{" "}
                unit(s)
              </strong>
            </div>

            <div className="detail-item">
              <span className="detail-label">
                Purchase Total
              </span>

              <strong>
                {formatCurrency(
                  purchaseTotal
                )}
              </strong>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedPurchase)}
        title="Purchase Details"
        onClose={() =>
          setSelectedPurchase(null)
        }
        footer={
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setSelectedPurchase(null)
            }
          >
            Close
          </button>
        }
      >
        {selectedPurchase && (
          <>
            <div className="employee-profile-summary">
              <div className="employee-profile-avatar">
                📑
              </div>

              <div>
                <h3>
                  Purchase #{selectedPurchase.id}
                </h3>

                <p>
                  {selectedPurchase.product
                    ?.name || "Product purchase"}
                </p>
              </div>
            </div>

            <div className="employee-details-grid">
              <div className="detail-item">
                <span className="detail-label">
                  Product
                </span>

                <strong>
                  {selectedPurchase.product
                    ?.name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Supplier
                </span>

                <strong>
                  {selectedPurchase.supplier
                    ?.name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Quantity
                </span>

                <strong>
                  {selectedPurchase.quantity}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Cost Per Unit
                </span>

                <strong>
                  {formatCurrency(
                    selectedPurchase.costPerUnit
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Total Cost
                </span>

                <strong>
                  {formatCurrency(
                    Number(
                      selectedPurchase.quantity
                    ) *
                      Number(
                        selectedPurchase.costPerUnit
                      )
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Purchase Date
                </span>

                <strong>
                  {selectedPurchase.createdAt
                    ? new Date(
                        selectedPurchase.createdAt
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
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
