import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import "../styles/ModulePage.css";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  contact: "",
  phone: "",
};

export default function Suppliers() {
 const { token, user } = useAuth();

const role = String(user?.role || "")
  .trim()
  .toLowerCase();

const canEdit = role === "admin" || role === "manager";
const canDelete = role === "admin";

  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const requestConfig = {
     };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/suppliers",
        
      );

      setSuppliers(
        Array.isArray(response.data)
          ? response.data
          : response.data.suppliers || []
      );
    } catch (err) {
      console.error("Supplier fetch error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load suppliers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSuppliers();
    } else {
      setLoading(false);
      setError("Please log in first.");
    }
  }, [token]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditForm = (supplier) => {
    setForm({
      name: supplier.name || "",
      contact: supplier.contact || "",
      phone: supplier.phone || "",
    });

    setEditingId(supplier.id);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    resetForm();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim() || null,
      phone: form.phone.trim() || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.put(
          `/suppliers/${editingId}`,
          payload,
          requestConfig
        );
      } else {
        await api.post(
          "/suppliers",
          payload,
          requestConfig
        );
      }

      closeFormModal();
      await fetchSuppliers();
    } catch (err) {
      console.error("Supplier save error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save supplier."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${supplier.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

    await api.delete(
  `/suppliers/${supplier.id}`
);

      await fetchSuppliers();
    } catch (err) {
      console.error("Supplier delete error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete supplier."
      );
    }
  };

  const filteredSuppliers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return suppliers;

    return suppliers.filter((supplier) => {
      return (
        supplier.name?.toLowerCase().includes(search) ||
        supplier.contact?.toLowerCase().includes(search) ||
        supplier.phone?.toLowerCase().includes(search)
      );
    });
  }, [suppliers, searchTerm]);

  const suppliersWithContact = suppliers.filter(
    (supplier) => supplier.contact
  ).length;

  const suppliersWithPhone = suppliers.filter(
    (supplier) => supplier.phone
  ).length;

  return (
    <div className="module-page suppliers-page">
      <div className="module-page-header">
        <div>
          <h1>🚚 Supplier Management</h1>

          <p>
            Manage supplier companies, contact persons, phone numbers,
            and purchasing relationships.
          </p>

          <div className="live-data-badge">
            <span className="live-data-dot"></span>
            Live Data
          </div>
        </div>

  
      </div>

      {error && (
        <div className="module-error">
          <span>{error}</span>

          <button type="button" onClick={fetchSuppliers}>
            Try Again
          </button>
        </div>
      )}

      <div className="module-stat-grid">
        <div className="module-stat-card">
          <div className="stat-icon">🚚</div>

          <div>
            <span>Total Suppliers</span>
            <strong>{suppliers.length}</strong>
            <small>All supplier records</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">👤</div>

          <div>
            <span>Contact Persons</span>
            <strong>{suppliersWithContact}</strong>
            <small>Available contact names</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📞</div>

          <div>
            <span>Suppliers With Phone</span>
            <strong>{suppliersWithPhone}</strong>
            <small>Available phone contacts</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📋</div>

          <div>
            <span>Displayed Records</span>
            <strong>{filteredSuppliers.length}</strong>
            <small>Current search results</small>
          </div>
        </div>
      </div>

      <div className="module-table-card">
        <div className="module-table-toolbar">
          <input
            type="search"
            placeholder="Search by supplier, contact, or phone..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

         <div className="table-toolbar-actions">
  <span>
    {filteredSuppliers.length}{" "}
    {filteredSuppliers.length === 1 ? "record" : "records"}
  </span>

  {canEdit && (
    <button
      type="button"
      className="primary-button"
      onClick={openAddForm}
    >
      + Add Supplier
    </button>
  )}
</div>
        </div>

        {loading ? (
          <div className="module-state-message">
            Loading suppliers...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="module-state-message">
            No suppliers found.
          </div>
        ) : (
          <div className="module-table-wrapper">
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>

                    <td>
                      <strong>{supplier.name}</strong>
                    </td>

                    <td>{supplier.contact || "—"}</td>

                    <td className="phone-cell">
                      {supplier.phone || "—"}
                    </td>

                    <td>
                      {supplier.createdAt
                        ? new Date(
                            supplier.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                   <div className="module-actions action-buttons">
  <button
    type="button"
    className="action-icon-button view-action"
    onClick={() => setSelectedSupplier(supplier)}
    title="View supplier"
    aria-label={`View ${supplier.name}`}
  >
    👁
  </button>

  {canEdit && (
    <button
      type="button"
      className="action-icon-button edit-action"
      onClick={() => openEditForm(supplier)}
      title="Edit supplier"
      aria-label={`Edit ${supplier.name}`}
    >
      ✏️
    </button>
  )}

  {canDelete && (
    <button
      type="button"
      className="action-icon-button delete-action"
      onClick={() => handleDelete(supplier)}
      title="Delete supplier"
      aria-label={`Delete ${supplier.name}`}
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
          </div>
        )}
      </div>

      <Modal
        isOpen={showFormModal}
        title={editingId ? "Edit Supplier" : "Add Supplier"}
        onClose={closeFormModal}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={closeFormModal}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="supplier-form"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Supplier"
                  : "Add Supplier"}
            </button>
          </>
        }
      >
        <form
          id="supplier-form"
          className="module-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="supplier-name">
              Supplier Name
            </label>

            <input
              id="supplier-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="supplier-contact">
              Contact Person
            </label>

            <input
              id="supplier-contact"
              name="contact"
              type="text"
              value={form.contact}
              onChange={handleInputChange}
              placeholder="Enter contact person"
            />
          </div>

          <div className="form-group">
            <label htmlFor="supplier-phone">Phone</label>

            <input
              id="supplier-phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedSupplier)}
        title="Supplier Details"
        onClose={() => setSelectedSupplier(null)}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelectedSupplier(null)}
            >
              Close
            </button>

            primary-button
          </>
        }
      >
        {selectedSupplier && (
          <div className="employee-details">
            <div className="employee-profile-summary">
              <div className="employee-profile-avatar">
                {selectedSupplier.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h3>{selectedSupplier.name}</h3>
                <p>Supplier</p>
              </div>
            </div>

            <div className="employee-details-grid">
              <div className="detail-item">
                <span className="detail-label">
                  Contact Person
                </span>

                <strong>
                  {selectedSupplier.contact || "Not provided"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone</span>

                <strong>
                  {selectedSupplier.phone || "Not provided"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">
                  Supplier ID
                </span>

                <strong>#{selectedSupplier.id}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Created</span>

                <strong>
                  {selectedSupplier.createdAt
                    ? new Date(
                        selectedSupplier.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not available"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}