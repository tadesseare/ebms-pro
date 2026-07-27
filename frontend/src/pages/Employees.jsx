import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Label,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import "../styles/ModulePage.css";


const emptyForm = {
  name: "",
  position: "",
  phone: "",
  email: "",
  salary: "",
  status: "Active",
};

export default function Employees() {
  const { user } = useAuth();

const canEdit =
  user?.role === "admin" || user?.role === "manager";

const canDelete = user?.role === "admin";
 const [employees, setEmployees] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
const fetchEmployees = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get("/employees");

    setEmployees(response.data);
  } catch (error) {
    console.error("Fetch employees error:", error);

    setError(
      error.response?.data?.message ||
        error.message ||
        "Failed to load employees."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchEmployees();
}, []);
  const employeeMetrics = useMemo(() => {
    const totalEmployees = employees.length;

    const activeEmployees = employees.filter(
      (employee) => employee.status === "Active"
    ).length;

    const inactiveEmployees = employees.filter(
      (employee) => employee.status === "Inactive"
    ).length;

    const totalPayroll = employees.reduce(
      (total, employee) => total + Number(employee.salary || 0),
      0
    );

    const averageSalary =
      totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalPayroll,
      averageSalary,
    };
  }, [employees]);

const STATUS_COLORS = [
  "#22c55e", // Active (green)
  "#ef4444", // Inactive (red)
];
  const employeeStatusData = [
    {
      name: "Active",
      value: employeeMetrics.activeEmployees,
    },
    {
      name: "Inactive",
      value: employeeMetrics.inactiveEmployees,
    },
  ];
const departmentChartData = useMemo(() => {
  const getDepartment = (position = "") => {
  const value = position.toLowerCase();

  if (value.includes("chief executive")) {
    return "Executive";
  }

  if (
    value.includes("finance") ||
    value.includes("accountant")
  ) {
    return "Finance";
  }

  if (value.includes("hr")) {
    return "Human Resources";
  }

  if (
    value.includes("sales") ||
    value.includes("marketing")
  ) {
    return "Sales & Marketing";
  }


    if (
      value.includes("inventory") ||
      value.includes("warehouse") ||
      value.includes("storekeeper") ||
      value.includes("delivery") ||
      value.includes("driver") ||
      value.includes("procurement")
    ) {
      return "Operations";
    }

    if (value.includes("it support")) {
      return "Information Technology";
    }

    if (
      value.includes("administrative") ||
      value.includes("receptionist") ||
      value.includes("customer service") ||
      value.includes("cashier")
    ) {
      return "Administration";
    }

    return "Other";
  };

  const counts = employees.reduce((result, employee) => {
    const department = getDepartment(employee.position);

    result[department] = (result[department] || 0) + 1;

    return result;
  }, {});

  return Object.entries(counts)
    .map(([name, employees]) => ({
      name,
      employees,
    }))
    .sort((a, b) => b.employees - a.employees);
}, [employees]);

  const filteredEmployees = useMemo(() => {
    const value = search.trim().toLowerCase();

    return employees.filter((employee) =>
      Object.values(employee).some((field) =>
        String(field).toLowerCase().includes(value)
      )
    );
  }, [employees, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

const openEditForm = (employee) => {
  setEditingId(employee.id);

  setForm({
    name: employee.name ?? "",
    position: employee.position ?? "",
    phone: employee.phone ?? "",
    email: employee.email ?? "",
    salary: employee.salary ?? "",
    status: employee.status ?? "Active",
  });

  setShowForm(true);
};

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (
    !form.name.trim() ||
    !form.position.trim() ||
    !form.phone.trim() ||
    !form.email.trim() ||
    form.salary === ""
  ) {
    alert("Please complete all required fields.");
    return;
  }

  const salary = Number(form.salary);

  if (Number.isNaN(salary) || salary < 0) {
    alert("Please enter a valid salary.");
    return;
  }

  const employeeData = {
    ...form,
    salary,
  };

  try {
    if (editingId !== null) {
      const response = await api.put(
        `/employees/${editingId}`,
        employeeData
      );

      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingId ? response.data : employee
        )
      );
    } else {
      const response = await api.post(
        "/employees",
        employeeData
      );

      setEmployees((previous) => [response.data, ...previous]);
    }

    closeForm();
  } catch (error) {
    console.error("Save employee error:", error);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to save employee."
    );
  }
};

const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this employee?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/employees/${id}`);

    setEmployees((previous) =>
      previous.filter((employee) => employee.id !== id)
    );
  } catch (error) {
    console.error("Delete employee error:", error);

    alert(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete employee."
    );
  }
};

const handleView = (employee) => {
  console.log("View clicked:", employee);
  setSelectedEmployee(employee);
};
//   console.log("View clicked:", employee);
//   setSelectedEmployee(employee);
// };
const closeViewModal = () => {
  setSelectedEmployee(null);
};
if (loading) {
  return (
    <main className="module-page">
      <p>Loading employees...</p>
    </main>
  );
}

if (error) {
  
  return (
    <main className="module-page">
      <p className="error-message">{error}</p>

      <button
        type="button"
        className="primary-button"
        onClick={fetchEmployees}
      >
        Try Again
      </button>
    </main>
  );
}

const DEPARTMENT_COLORS = {
  Operations: "#2563eb",               // Blue
  Administration: "#22c55e",           // Green
  Executive: "#7c3aed",                // Purple
  "Sales & Marketing": "#f59e0b",      // Orange
  Finance: "#06b6d4",                  // Cyan
  "Human Resources": "#ef4444",        // Red
  "Information Technology": "#ec4899", // Pink
  Other: "#94a3b8",
};
  return (
<main className="module-page">

  <div className="module-header">

    <div className="module-title-area">
      <h1>👥 Employee Management</h1>

      <p className="module-subtitle">
        Manage employee information, payroll, positions, and workforce status.
      </p>

      <div className="live-indicator">
        <span className="live-dot"></span>
        <span>Live Data</span>
      </div>
    </div>

    <button
      type="button"
      className="primary-button"
      onClick={openAddForm}
    >
      + Add Employee
    </button>

  </div>

  {/* The KPI cards start here */}

      <section className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-icon">👥</div>
          <div>
            <p className="kpi-label">Total Employees</p>
            <h3>{employeeMetrics.totalEmployees}</h3>
            <span>All employee records</span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div>
            <p className="kpi-label">Active Employees</p>
            <h3>{employeeMetrics.activeEmployees}</h3>
            <span>Currently active</span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-icon">⏸️</div>
          <div>
            <p className="kpi-label">Inactive Employees</p>
            <h3>{employeeMetrics.inactiveEmployees}</h3>
            <span>Currently inactive</span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-icon">💵</div>
          <div>
            <p className="kpi-label">Annual Payroll</p>
            <h3>${employeeMetrics.totalPayroll.toLocaleString()}</h3>
            <span>
              Average $
              {Math.round(employeeMetrics.averageSalary).toLocaleString()}
            </span>
          </div>
        </article>
      </section>

      <section className="charts-grid">
  <article className="chart-card">
    <div className="chart-heading">
      <div>
        <p className="section-label">WORKFORCE</p>
        <h2>Employees by Status</h2>
      </div>

      <span>{employeeMetrics.totalEmployees} employees</span>
    </div>

    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          
<Pie
  data={employeeStatusData}
  dataKey="value"
  nameKey="name"
  innerRadius={65}
  outerRadius={95}
  paddingAngle={4}
  label
>
  {employeeStatusData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
    />
  ))}

  <Label
    value={`${employeeMetrics.totalEmployees}\nEmployees`}
    position="center"
    style={{
      fontSize: 26,
      fontWeight: 700,
      fill: "#172033",
      whiteSpace: "pre-line",
      textAnchor: "middle",
    }}
  />
</Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </article>

  <article className="chart-card">
    <div className="chart-heading">
      <div>
        <p className="section-label">WORKFORCE</p>
         <h2>Employees by Department</h2>
      </div>

      <span>Department distribution</span>
    </div>

    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
  data={departmentChartData}
  layout="vertical"
  margin={{
    top: 10,
    right: 30,
    left: 35,
    bottom: 10,
  }}
>
  <CartesianGrid
    strokeDasharray="3 3"
    horizontal={false}
  />

  <XAxis
    type="number"
    allowDecimals={false}
    domain={[0, "dataMax + 1"]}
  />

  <YAxis
    type="category"
    dataKey="name"
    width={145}
    tick={{ fontSize: 12 }}
  />

  <Tooltip
    formatter={(value) => [
      `${value} employee${Number(value) === 1 ? "" : "s"}`,
      "Employees",
    ]}
  />

  <Bar
  dataKey="employees"
  radius={[0, 8, 8, 0]}
  barSize={24}
>
  {departmentChartData.map((entry) => (
    <Cell
      key={entry.name}
      fill={
        DEPARTMENT_COLORS[entry.name] ||
        DEPARTMENT_COLORS.Other
      }
    />
  ))}

  <LabelList
    dataKey="employees"
    position="right"
    style={{
      fill: "#172033",
      fontWeight: 700,
      fontSize: 14,
    }}
  />
</Bar>
</BarChart>
      </ResponsiveContainer>
    </div>
  </article>
</section>

      {showForm && (
        <form className="data-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>

            <button
              type="button"
              className="secondary-button"
              onClick={closeForm}
            >
              Close
            </button>
          </div>

          <div className="form-grid">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Employee name"
              required
            />

            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Position"
              required
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              required
            />

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              placeholder="Salary"
              min="0"
              required
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button type="submit" className="primary-button">
            {editingId !== null ? "Save Changes" : "Add Employee"}
          </button>
        </form>
      )}

   <Modal
  isOpen={selectedEmployee !== null}
  title="Employee Details"
  onClose={() => setSelectedEmployee(null)}
  footer={
    <>
      <button
        type="button"
        className="secondary-button"
        onClick={() => setSelectedEmployee(null)}
      >
        Close
      </button>

      <button
        type="button"
        className="primary-button"
        onClick={() => {
          const employee = selectedEmployee;

          setSelectedEmployee(null);

          if (employee) {
            openEditForm(employee);
          }
        }}
      >
        Edit Employee
      </button>
    </>
  }
>
  {selectedEmployee && (
    <div className="employee-details">
      <div className="employee-profile-summary">
        <div className="employee-profile-avatar">
          {selectedEmployee.name
            ?.split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>

        <div>
          <h3>{selectedEmployee.name}</h3>
          <p>{selectedEmployee.position || "No position assigned"}</p>
        </div>
      </div>

      <div className="employee-details-grid">
        <div className="detail-item">
          <span className="detail-label">Email</span>
          <strong>{selectedEmployee.email || "Not provided"}</strong>
        </div>

        <div className="detail-item">
          <span className="detail-label">Phone</span>
          <strong>{selectedEmployee.phone || "Not provided"}</strong>
        </div>

        <div className="detail-item">
          <span className="detail-label">Annual Salary</span>
          <strong>
            ${Number(selectedEmployee.salary || 0).toLocaleString()}
          </strong>
        </div>

        <div className="detail-item">
          <span className="detail-label">Status</span>

          <span
            className={`status-badge ${
              selectedEmployee.status === "Active"
                ? "status-active"
                : "status-inactive"
            }`}
          >
            {selectedEmployee.status}
          </span>
        </div>
<div className="detail-item">
  <span className="detail-label">Employee ID</span>
  <strong>#{selectedEmployee.id}</strong>
</div>

<div className="detail-item">
  <span className="detail-label">Created</span>
  <strong>
    {selectedEmployee.createdAt
      ? new Date(selectedEmployee.createdAt).toLocaleDateString("en-US", {
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
      <section className="table-card">
        <div className="table-toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <span>{filteredEmployees.length} records</span>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="empty-state">No employee records found.</div>
        ) : (
          <table className="module-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.position}</td>
                  <td className="phone-cell">
                    {employee.phone}
                 </td>
                  <td>{employee.email}</td>
                  <td>${Number(employee.salary).toLocaleString()}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        employee.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="view-button"
                        onClick={() => handleView(employee)}
                      >
                        View
                      </button>

                      {canEdit && (
  <button
    type="button"
    onClick={() => startEdit(employee)}
  >
    Edit
  </button>
)}

{canDelete && (
  <button
    type="button"
    onClick={() => handleDelete(employee.id)}
  >
    Delete
  </button>
)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}