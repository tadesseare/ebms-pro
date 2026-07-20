import { useEffect, useState } from "react";
import axios from "axios";

export default function Purchases() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    supplierId: "",
    quantity: 1,
    costPerUnit: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadProducts();
    loadSuppliers();
    loadPurchases();
  }, []);

  const loadProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(res.data);
  };

  const loadSuppliers = async () => {
    const res = await axios.get("http://localhost:5000/api/suppliers", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSuppliers(res.data);
  };

  const loadPurchases = async () => {
    const res = await axios.get("http://localhost:5000/api/purchases", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPurchases(res.data);
  };

  const handlePurchase = async () => {
    if (!form.productId || !form.supplierId || form.quantity <= 0 || form.costPerUnit <= 0) {
      return;
    }

    const payload = {
      productId: Number(form.productId),
      supplierId: Number(form.supplierId),
      quantity: Number(form.quantity),
      costPerUnit: Number(form.costPerUnit)
    };

    await axios.post("http://localhost:5000/api/purchases", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setForm({ productId: "", supplierId: "", quantity: 1, costPerUnit: 0 });
    loadPurchases();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Purchases</h1>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          width: "400px"
        }}
      >
        <h3>New Purchase</h3>

        <select
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={form.supplierId}
          onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          style={inputStyle}
        />

        <input
          type="number"
          min="0"
          placeholder="Cost Per Unit"
          value={form.costPerUnit}
          onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
          style={inputStyle}
        />

        <button onClick={handlePurchase} style={buttonStyle}>
          Record Purchase
        </button>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Supplier</th>
            <th>Qty</th>
            <th>Cost/Unit</th>
            <th>Total Cost</th>
          </tr>
        </thead>

        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td>{p.product?.name || "—"}</td>
              <td>{p.supplier?.name || "—"}</td>
              <td>{p.quantity}</td>
              <td>${p.costPerUnit}</td>
              <td>${p.quantity * p.costPerUnit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px"
};

const tableStyle = {
  width: "100%",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  borderCollapse: "collapse"
};
