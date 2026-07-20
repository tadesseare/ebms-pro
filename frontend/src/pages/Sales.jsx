import { useEffect, useState } from "react";
import axios from "axios";

export default function Sales() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    customerId: "",
    quantity: 1,
    pricePerUnit: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadInventory();
    loadProducts();
    loadCustomers();
    loadSales();
  }, []);

  const loadInventory = async () => {
    const res = await axios.get("http://localhost:5000/api/inventory", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setInventory(res.data);
  };

  const loadProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(res.data);
  };

  const loadCustomers = async () => {
    const res = await axios.get("http://localhost:5000/api/customers", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCustomers(res.data);
  };

  const loadSales = async () => {
    const res = await axios.get("http://localhost:5000/api/sales", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSales(res.data);
  };

  const handleSale = async () => {
    if (!form.productId || !form.customerId || form.quantity <= 0) return;

    const payload = {
      productId: Number(form.productId),
      customerId: Number(form.customerId),
      quantity: Number(form.quantity),
      pricePerUnit: Number(form.pricePerUnit)
    };

    await axios.post("http://localhost:5000/api/sales", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setForm({ productId: "", customerId: "", quantity: 1, pricePerUnit: 0 });
    loadInventory();
    loadSales();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Sales</h1>

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
        <h3>Create Sale</h3>

        {/* Product Dropdown */}
        <select
          value={form.productId}
          onChange={(e) => {
            const productId = e.target.value;
            const product = products.find((p) => p.id === Number(productId));

            setForm({
              ...form,
              productId,
              pricePerUnit: product?.price || 0
            });
          }}
          style={inputStyle}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Customer Dropdown */}
        <select
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <input
          type="number"
          min="1"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          style={inputStyle}
        />

        {/* Price Per Unit */}
        <input
          type="number"
          min="0"
          value={form.pricePerUnit}
          onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })}
          style={inputStyle}
        />

        <button onClick={handleSale} style={buttonStyle}>
          Complete Sale
        </button>
      </div>

      {/* Sales History */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Customer</th>
            <th>Qty</th>
            <th>Price/Unit</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{s.product?.name || "—"}</td>
              <td>{s.customer?.name || "—"}</td>
              <td>{s.quantity}</td>
              <td>${s.pricePerUnit}</td>
              <td>${s.quantity * s.pricePerUnit}</td>
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
