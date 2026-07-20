import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { user } = useAuth();
  const token = user?.token;

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff"
  });

  const loadUsers = async () => {
    const res = await axios.get("http://127.0.0.1:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    await axios.post("http://127.0.0.1:5000/api/users", form, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setForm({ name: "", email: "", password: "", role: "staff" });
    loadUsers();
  };

  const updateRole = async (id, role) => {
    await axios.put(
      `http://127.0.0.1:5000/api/users/${id}/role`,
      { role },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    loadUsers();
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://127.0.0.1:5000/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    loadUsers();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>User Management</h1>

      <div style={{ marginBottom: "30px" }}>
        <h3>Create User</h3>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>

        <button onClick={createUser}>Create</button>
      </div>

      <h3>All Users</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>

              <td>
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </td>

              <td>
                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
