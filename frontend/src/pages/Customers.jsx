import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import "../styles/ModulePage.css";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
};

export default function Customers() {
 const { token, user } = useAuth();

const role = String(user?.role || "")
  .trim()
  .toLowerCase();

const canEdit = role === "admin" || role === "manager";
const canDelete = role === "admin";

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      setCustomers(
        Array.isArray(response.data)
          ? response.data
          : response.data.customers || []
      );
    } catch (err) {
      console.error("Customer fetch error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomers();
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

  const openEditForm = (customer) => {
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
    });

    setEditingId(customer.id);
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
      setError("Customer name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId !== null) {
        await api.put(`/customers/${editingId}`, payload);
      } else {
        await api.post("/customers", payload);
      }

      closeFormModal();
      await fetchCustomers();
    } catch (err) {
      console.error("Customer save error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save customer."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/customers/${customer.id}`);
      

      await fetchCustomers();
    } catch (err) {
      console.error("Customer delete error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete customer."
      );
    }
  };

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return customers;

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search)
      );
    });
  }, [customers, searchTerm]);

  const customersWithEmail = customers.filter(
    (customer) => customer.email
  ).length;

  const customersWithPhone = customers.filter(
    (customer) => customer.phone
  ).length;

  return (
    <div className="module-page customers-page">
      <div className="module-page-header">
        <div>
          <h1>👤 Customer Management</h1>

          <p>
            Manage customer contact information, accounts, and business
            relationships.
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

          <button type="button" onClick={fetchCustomers}>
            Try Again
          </button>
        </div>
      )}

      <div className="module-stat-grid">
        <div className="module-stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
            <small>All customer records</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📧</div>

          <div>
            <span>Customers With Email</span>
            <strong>{customersWithEmail}</strong>
            <small>Available email contacts</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📞</div>

          <div>
            <span>Customers With Phone</span>
            <strong>{customersWithPhone}</strong>
            <small>Available phone contacts</small>
          </div>
        </div>

        <div className="module-stat-card">
          <div className="stat-icon">📋</div>

          <div>
            <span>Displayed Records</span>
            <strong>{filteredCustomers.length}</strong>
            <small>Current search results</small>
          </div>
        </div>
      </div>

      <div className="module-table-card">
        <div className="module-table-toolbar">
          <input
            type="search"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

         
  <div className="table-toolbar-actions">
  <span>
    {filteredCustomers.length}{" "}
    {filteredCustomers.length === 1 ? "record" : "records"}
  </span>

  {canEdit && (
    <button
      type="button"
      className="primary-button"
      onClick={openAddForm}
    >
      + Add Customer
    </button>
  )}
</div>
        </div>

        {loading ? (
          <div className="module-state-message">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="module-state-message">
            No customers found.
          </div>
        ) : (
          <div className="module-table-wrapper">
            <table className="module-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>

                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td className="phone-cell">
                      {customer.phone || "—"}
                    </td>

                    <td>{customer.email || "—"}</td>

                    <td>
                      {customer.createdAt
                        ? new Date(
                            customer.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                 <div className="module-actions action-buttons">
  <button
    type="button"
    className="action-icon-button view-action"
    onClick={() => setSelectedCustomer(customer)}
    title="View customer"
    aria-label={`View ${customer.name}`}
  >
    👁
  </button>

  {canEdit && (
    <button
      type="button"
      className="action-icon-button edit-action"
      onClick={() => openEditForm(customer)}
      title="Edit customer"
      aria-label={`Edit ${customer.name}`}
    >
      ✏️
    </button>
  )}

  {canDelete && (
    <button
      type="button"
      className="action-icon-button delete-action"
      onClick={() => handleDelete(customer)}
      title="Delete customer"
      aria-label={`Delete ${customer.name}`}
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
        title={editingId ? "Edit Customer" : "Add Customer"}
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
              form="customer-form"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Customer"
                  : "Add Customer"}
            </button>
          </>
        }
      >
        <form
          id="customer-form"
          className="module-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="customer-name">Customer Name</label>

            <input
              id="customer-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer-phone">Phone</label>

            <input
              id="customer-phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer-email">Email</label>

            <input
              id="customer-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedCustomer)}
        title="Customer Details"
        onClose={() => setSelectedCustomer(null)}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelectedCustomer(null)}
            >
              Close
            </button>

            {canEdit && (
  <button
    type="button"
    className="primary-button"
    onClick={() => {
      const customer = selectedCustomer;

      setSelectedCustomer(null);

      if (customer) {
        openEditForm(customer);
      }
    }}
  >
    Edit Customer
  </button>
)}
          </>
        }
      >
        {selectedCustomer && (
          <div className="employee-details">
            <div className="employee-profile-summary">
              <div className="employee-profile-avatar">
                {selectedCustomer.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h3>{selectedCustomer.name}</h3>
                <p>Customer</p>
              </div>
            </div>

            <div className="employee-details-grid">
              <div className="detail-item">
                <span className="detail-label">Email</span>

                <strong>
                  {selectedCustomer.email || "Not provided"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone</span>

                <strong>
                  {selectedCustomer.phone || "Not provided"}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Customer ID</span>

                <strong>#{selectedCustomer.id}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Created</span>

                <strong>
                  {selectedCustomer.createdAt
                    ? new Date(
                        selectedCustomer.createdAt
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