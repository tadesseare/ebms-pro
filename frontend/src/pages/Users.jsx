import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/users");

      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("LOAD USERS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load users."
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

    loadUsers();
  }, [token]);

  const createUser = async () => {
    try {
      setError("");

      await api.post("/users", form);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "staff",
      });

      await loadUsers();
    } catch (err) {
      console.error("CREATE USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create user."
      );
    }
  };

  const updateRole = async (id, role) => {
    try {
      setError("");

      await api.put(`/users/${id}/role`, { role });

      await loadUsers();
    } catch (err) {
      console.error("UPDATE USER ROLE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update user role."
      );
    }
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/users/${id}`);

      await loadUsers();
    } catch (err) {
      console.error("DELETE USER ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete user."
      );
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>User Management</h1>

      {error && (
        <p style={{ color: "red", marginBottom: "20px" }}>
          {error}
        </p>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h3>Create User</h3>

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>

        <button type="button" onClick={createUser}>
          Create
        </button>
      </div>

      <h3>All Users</h3>

      {loading ? (
        <p>Loading users...</p>
      ) : (
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
            {users.length === 0 ? (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  <td>
                    <select
                      value={u.role}
                      onChange={(e) =>
                        updateRole(u.id, e.target.value)
                      }
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

