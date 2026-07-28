import { useEffect, useState } from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import "../styles/ModulePage.css";

const API_URL = "/products";
const SUPPLIERS_URL = "/suppliers";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    supplierId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

const { user } = useAuth();

const role = String(user?.role || "")
  .trim()
  .toLowerCase();

const canEdit = role === "admin" || role === "manager";
const canDelete = role === "admin";

  const authConfig = {
   
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(API_URL, authConfig);

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("LOAD PRODUCTS ERROR:", err);
      console.error("PRODUCT ERROR RESPONSE:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get(SUPPLIERS_URL, authConfig);

      setSuppliers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("LOAD SUPPLIERS ERROR:", err);
      console.error("SUPPLIER ERROR RESPONSE:", err.response?.data);
    }
  };

  useEffect(() => {
    loadProducts();
    loadSuppliers();
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
      name: "",
      price: "",
      supplierId: "",
    });
  };

  const openAddModal = () => {
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
    setSelectedProduct(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Enter a valid product price.");
      return;
    }

    if (!form.supplierId) {
      setError("Please select a supplier.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      supplierId: Number(form.supplierId),
    };

    try {
      setSubmitting(true);
      setError("");

      if (editingId !== null) {
        await api.put(
          `${API_URL}/${editingId}`,
          payload,
          authConfig
        );
      } else {
        await api.post(API_URL, payload, authConfig);
      }

      await loadProducts();
      closeFormModal();
    } catch (err) {
      console.error("SUBMIT PRODUCT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name ?? "",
      price: product.price ?? "",
      supplierId: product.supplierId ?? "",
    });

    setError("");
    setIsFormModalOpen(true);
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`${API_URL}/${product.id}`, authConfig);
      await loadProducts();
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete product."
      );
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.toLowerCase().trim();

    if (!searchValue) return true;

    return (
      product.name?.toLowerCase().includes(searchValue) ||
      product.supplier?.name?.toLowerCase().includes(searchValue)
    );
  });

  const totalProducts = products.length;

  const averagePrice =
    totalProducts > 0
      ? (
          products.reduce(
            (sum, product) => sum + Number(product.price),
            0
          ) / totalProducts
        ).toFixed(2)
      : "0.00";

  const highestPrice =
    totalProducts > 0
      ? Math.max(
          ...products.map((product) => Number(product.price))
        ).toFixed(2)
      : "0.00";

  const supplierCount = new Set(
    products
      .map((product) => product.supplierId)
      .filter(Boolean)
  ).size;

  return (
    <div className="module-page products-page">
      <div className="module-page-header">
  <div>
    <h1>📦 Product Management</h1>

    <p>
      Manage products, pricing, supplier relationships, and
      product catalog.
    </p>

    <div className="live-data-badge">
      <span className="live-data-dot"></span>
      Live Data
    </div>
  </div>

 
</div>

      <div className="module-stat-grid">
        <div className="module-stat-card">
          <div className="stat-icon">📦</div>

          <div>
            <span>Total Products</span>
            <strong>{totalProducts}</strong>
            <small>Products in catalog</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">💲</div>

          <div>
            <span>Average Price</span>
            <strong>${averagePrice}</strong>
            <small>Average selling price</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">🚚</div>

          <div>
            <span>Suppliers</span>
            <strong>{supplierCount}</strong>
            <small>Linked suppliers</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">⭐</div>

          <div>
            <span>Highest Price</span>
            <strong>${highestPrice}</strong>
            <small>Most expensive product</small>
          </div>
        </div>
      </div>

      {error && <div className="module-error">{error}</div>}

      <div className="module-table-card">
        <div className="module-table-toolbar">
          <input
            type="text"
            placeholder="Search by product or supplier..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

  <div className="table-toolbar-actions">
  <span>
    {filteredProducts.length}{" "}
    {filteredProducts.length === 1 ? "record" : "records"}
  </span>

  {canEdit && (
    <button
      type="button"
      className="primary-button"
      onClick={openAddModal}
    >
      + Add Product
    </button>
  )}
</div>
        </div>

        <div className="module-table-wrapper">
          {loading ? (
            <div className="module-state-message">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="module-state-message">
              No products found.
            </div>
          ) : (
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>
                      ${Number(product.price).toFixed(2)}
                    </td>

                    <td>{product.supplier?.name || "—"}</td>

                    <td>
                      <div className="module-actions action-buttons">
  <button
    type="button"
    className="action-icon-button view-action"
    onClick={() => setSelectedProduct(product)}
    title="View product"
    aria-label={`View ${product.name}`}
  >
    👁
  </button>

  {canEdit && (
    <button
      type="button"
      className="action-icon-button edit-action"
      onClick={() => startEdit(product)}
      title="Edit product"
      aria-label={`Edit ${product.name}`}
    >
      ✏️
    </button>
  )}

  {canDelete && (
    <button
      type="button"
      className="action-icon-button delete-action"
      onClick={() => handleDelete(product)}
      title="Delete product"
      aria-label={`Delete ${product.name}`}
    >
      🗑️
    </button>
  )}
</div>
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        title={editingId !== null ? "Edit Product" : "Add Product"}
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
              form="product-form"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId !== null
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </>
        }
      >
        <form
          id="product-form"
          className="module-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="product-name">
              Product name
            </label>

            <input
              id="product-name"
              type="text"
              name="name"
              placeholder="Enter product name"
              value={form.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-price">Price</label>

            <input
              id="product-price"
              type="number"
              name="price"
              min="0"
              step="0.01"
              placeholder="Enter product price"
              value={form.price}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-supplier">
              Supplier
            </label>

            <select
              id="product-supplier"
              name="supplierId"
              value={form.supplierId}
              onChange={handleInputChange}
            >
              <option value="">Select supplier</option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedProduct)}
        title="Product Details"
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
        {selectedProduct && (
          <>
            <div className="employee-profile-summary">
              <div className="employee-profile-avatar">
                📦
              </div>

              <div>
                <h3>{selectedProduct.name}</h3>

                <p>
                  {selectedProduct.supplier?.name ||
                    "No supplier assigned"}
                </p>
              </div>
            </div>

            <div className="employee-details-grid">
              <div className="detail-item">
                <span className="detail-label">
                  Product ID
                </span>

                <strong>{selectedProduct.id}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Price</span>

                <strong>
                  ${Number(selectedProduct.price).toFixed(2)}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Supplier
                </span>

                <strong>
                  {selectedProduct.supplier?.name || "—"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Created
                </span>

                <strong>
                  {selectedProduct.createdAt
                    ? new Date(
                        selectedProduct.createdAt
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