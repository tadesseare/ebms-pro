import { useEffect, useState } from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import "../styles/ModulePage.css";
import "./Inventory.css";


const INVENTORY_URL = "/inventory";
const PRODUCTS_URL = "/products";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

 const { user } = useAuth();

const role = String(user?.role || "")
  .trim()
  .toLowerCase();

const canEdit = role === "admin" || role === "manager";
const canDelete = role === "admin";

  const authConfig = {
   
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(INVENTORY_URL, authConfig);

      setInventory(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("LOAD INVENTORY ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get(PRODUCTS_URL, authConfig);

      setProducts(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load products."
      );
    }
  };

  useEffect(() => {
    loadInventory();
    loadProducts();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      productId: "",
      quantity: "",
    });
  };

  const openAddModal = () => {
  if (availableProducts.length === 0) {
    setError(
      "All products are already being tracked. Create a new product first."
    );
    return;
  }

  resetForm();
  setError("");
  setIsFormModalOpen(true);
};

  const closeFormModal = () => {
    resetForm();
    setError("");
    setIsFormModalOpen(false);
  };

  const closeViewModal = () => {
    setSelectedItem(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);

    setForm({
      productId: item.productId ?? "",
      quantity: item.quantity ?? "",
    });

    setError("");
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      setError("Please select a product.");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) < 0
    ) {
      setError("Quantity must be zero or greater.");
      return;
    }

    const payload = {
      productId: Number(form.productId),
      quantity: Number(form.quantity),
    };

    try {
      setSubmitting(true);
      setError("");

      if (editingId !== null) {
        await api.put(
          `${INVENTORY_URL}/${editingId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(
          INVENTORY_URL,
          payload,
          authConfig
        );
      }

      await loadInventory();
      closeFormModal();
    } catch (err) {
      console.error("SUBMIT INVENTORY ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save inventory."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const productName =
      item.product?.name || "this inventory item";

    const confirmed = window.confirm(
      `Are you sure you want to delete inventory for "${productName}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(
        `${INVENTORY_URL}/${item.id}`,
        authConfig
      );

      await loadInventory();
    } catch (err) {
      console.error("DELETE INVENTORY ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete inventory."
      );
    }
  };

  const getStockStatus = (quantity) => {
    const stockQuantity = Number(quantity);

    if (stockQuantity === 0) {
      return {
        label: "Out of Stock",
        className: "status-out",
      };
    }

    if (stockQuantity <= 10) {
      return {
        label: "Low Stock",
        className: "status-low",
      };
    }

    return {
      label: "In Stock",
      className: "status-active",
    };
  };

  const filteredInventory = inventory.filter((item) => {
    const searchValue = searchTerm.toLowerCase().trim();
    const quantity = Number(item.quantity);

    const matchesSearch =
      !searchValue ||
      item.product?.name
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && quantity > 10) ||
      (statusFilter === "low-stock" &&
        quantity > 0 &&
        quantity <= 10) ||
      (statusFilter === "out-of-stock" &&
        quantity === 0);

    return matchesSearch && matchesStatus;
  });
const availableProducts = products.filter(
  (product) =>
    !inventory.some(
      (item) => Number(item.productId) === Number(product.id)
    )
);
  const totalItems = inventory.length;

  const totalQuantity = inventory.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );
const inventoryValue = inventory.reduce(
  (sum, item) => {
    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.product?.price ?? 0);

    return sum + quantity * price;
  },
  0
);
  const lowStockCount = inventory.filter(
    (item) =>
      Number(item.quantity) > 0 &&
      Number(item.quantity) <= 10
  ).length;

  const outOfStockCount = inventory.filter(
    (item) => Number(item.quantity) === 0
  ).length;

 return (
  <div className="module-page inventory-page">
    <section className="inventory-header">
      <div className="inventory-header-content">
        <p className="inventory-eyebrow">
          Inventory Control System
        </p>

        <h1>Inventory Management</h1>

        <p className="inventory-subtitle">
          Monitor stock levels, inventory value, product availability,
          and restocking needs.
        </p>
      </div>

      <div className="inventory-header-actions">
        <div className="inventory-live-status">
          <span className="live-dot"></span>

          <div>
            <strong>Live Database</strong>
            <small>Inventory connected</small>
          </div>
        </div>

        <button
          type="button"
          className="inventory-refresh-button"
          onClick={() => {
            loadInventory();
            loadProducts();
          }}
          disabled={loading}
        >
          ↻ {loading ? "Refreshing..." : "Refresh"}
        </button>

 
      </div>
    </section>

          
<div className="module-stat-grid">
  <div className="module-stat-card">
  <div className="stat-icon">📦</div>

  <div>
    <span>Inventory Items</span>
    <strong>{totalItems}</strong>
    <small>Products being tracked</small>
  </div>
</div>

<div className="module-stat-card">
  <div className="stat-icon">📊</div>

  <div>
    <span>Total Units</span>
    <strong>{totalQuantity}</strong>
    <small>Units currently available</small>
  </div>
</div>
<div className="module-stat-card inventory-value-card">
  <div className="stat-icon">💰</div>

  <span>Inventory Value</span>

  <strong>
    {inventoryValue.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    })}
  </strong>

  <small>Total stock value</small>
</div>

  <div className="module-stat-card">
    <div className="stat-icon">⚠️</div>

    <div>
      <span>Low Stock</span>
      <strong>{lowStockCount}</strong>
      <small>Products at 10 units or less</small>
    </div>
  </div>

  <div className="module-stat-card">
    <div className="stat-icon">🚫</div>

    <div>
      <span>Out of Stock</span>
      <strong>{outOfStockCount}</strong>
      <small>Products needing restock</small>
    </div>
  </div>
</div>
{error && <div className="module-error">{error}</div>}

      <div className="module-table-card">
        <div className="module-table-toolbar">
          <div className="module-toolbar-filters">
            <input
              type="text"
              placeholder="Search by product..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All stock statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">
                Out of Stock
              </option>
            </select>
          </div>

        <div className="table-toolbar-actions">
  <span>
    {filteredInventory.length}{" "}
    {filteredInventory.length === 1 ? "record" : "records"}
  </span>

  {canEdit && (
    <button
      type="button"
      className="inventory-add-button"
      onClick={openAddModal}
    >
      + Add Inventory
    </button>
  )}
</div>
        </div>

        <div className="module-table-wrapper">
          {loading ? (
            <div className="module-state-message">
              Loading inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="module-state-message">
              No inventory items found.
            </div>
          ) : (
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Stock Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(
                    item.quantity
                  );

                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>
                        <strong>
                          {item.product?.name || "—"}
                        </strong>
                      </td>

                      <td>{item.quantity}</td>

                      <td>
                        <span
                          className={`status-badge ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      <td>
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div className="module-actions action-buttons">
  <button
    type="button"
    className="action-icon-button view-action"
    onClick={() => setSelectedItem(item)}
    title="View inventory"
    aria-label={`View inventory for ${
      item.product?.name || "product"
    }`}
  >
    👁
  </button>

  {canEdit && (
    <button
      type="button"
      className="action-icon-button edit-action"
      onClick={() => startEdit(item)}
      title="Edit inventory"
      aria-label={`Edit inventory for ${
        item.product?.name || "product"
      }`}
    >
      ✏️
    </button>
  )}

  {canDelete && (
    <button
      type="button"
      className="action-icon-button delete-action"
      onClick={() => handleDelete(item)}
      title="Delete inventory"
      aria-label={`Delete inventory for ${
        item.product?.name || "product"
      }`}
    >
      🗑️
    </button>
  )}
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
        isOpen={isFormModalOpen}
        title={
          editingId !== null
            ? "Edit Inventory"
            : "Add Inventory"
        }
        onClose={closeFormModal}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={closeFormModal}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="inventory-form"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId !== null
                  ? "Update Inventory"
                  : "Add Inventory"}
            </button>
          </>
        }
      >
        <form
          id="inventory-form"
          className="module-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="inventory-product">
              Product
            </label>

  <select
  id="inventory-product"
  name="productId"
  value={form.productId}
  onChange={handleInputChange}
  disabled={editingId !== null}
  required
>
  <option value="">Select product</option>

  {(editingId !== null
    ? products.filter(
        (product) =>
          Number(product.id) === Number(form.productId)
      )
    : availableProducts
  ).map((product) => (
    <option key={product.id} value={product.id}>
      {product.name}
    </option>
  ))}
</select>

            {editingId !== null && (
              <small>
                Product cannot be changed while editing.
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="inventory-quantity">
              Quantity
            </label>

            <input
              id="inventory-quantity"
              type="number"
              name="quantity"
              min="0"
              step="1"
              placeholder="Enter stock quantity"
              value={form.quantity}
              onChange={handleInputChange}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedItem)}
        title="Inventory Details"
        onClose={closeViewModal}
        footer={
          <button
            type="button"
            className="secondary-button"
            onClick={closeViewModal}
          >
            Close
          </button>
        }
      >
        {selectedItem && (
          <>
            <div className="employee-profile-summary">
              <div className="employee-profile-avatar">
                📋
              </div>

              <div>
                <h3>
                  {selectedItem.product?.name ||
                    "Inventory Item"}
                </h3>

                <p>
                  Current stock quantity:{" "}
                  {selectedItem.quantity}
                </p>
              </div>
            </div>

            <div className="employee-details-grid">
              <div className="detail-item">
                <span className="detail-label">
                  Inventory ID
                </span>

                <strong>{selectedItem.id}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Product
                </span>

                <strong>
                  {selectedItem.product?.name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Quantity
                </span>

                <strong>{selectedItem.quantity}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Stock Status
                </span>

                <strong>
                  {
                    getStockStatus(selectedItem.quantity)
                      .label
                  }
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Created
                </span>

                <strong>
                  {selectedItem.createdAt
                    ? new Date(
                        selectedItem.createdAt
                      ).toLocaleDateString()
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