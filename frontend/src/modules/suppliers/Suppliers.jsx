import { useEffect, useState } from "react";
import "./Suppliers.css";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "./suppliersService";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch {
      showToast("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openModal = (supplier = null) => {
    setEditingSupplier(supplier);
    setForm(supplier || { name: "", phone: "", email: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, form);
        showToast("Supplier updated");
      } else {
        await createSupplier(form);
        showToast("Supplier added");
      }
      closeModal();
      loadSuppliers();
    } catch {
      showToast("Error saving supplier");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await deleteSupplier(id);
      showToast("Supplier deleted");
      loadSuppliers();
    } catch {
      showToast("Error deleting supplier");
    }
  };

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h2>Suppliers</h2>
        <button className="btn btn-add" onClick={() => openModal()}>
          Add Supplier
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>
                  <button className="btn btn-edit" onClick={() => openModal(s)}>
                    Edit
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h3>

            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <button className="btn btn-add" onClick={handleSubmit}>
              Save
            </button>
            <button className="btn" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
