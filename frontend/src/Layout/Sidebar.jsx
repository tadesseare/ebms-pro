import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Dashboard", icon: "📊", end: true },
  { path: "/employees", label: "Employees", icon: "👥" },
  { path: "/customers", label: "Customers", icon: "👤" },
  { path: "/suppliers", label: "Suppliers", icon: "🚚" },
  { path: "/products", label: "Products", icon: "📦" },
  { path: "/inventory", label: "Inventory", icon: "📋" },
  { path: "/sales", label: "Sales", icon: "🛒" },
  { path: "/purchases", label: "Purchases", icon: "🧾" },
  { path: "/reports", label: "Reports", icon: "📈" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onNavigate,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    onNavigate?.();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside
      className={`sidebar ${
        collapsed ? "sidebar-collapsed" : ""
      } ${mobileOpen ? "sidebar-mobile-open" : ""}`}
    >
      <div className="sidebar-brand">
        <div className="brand-logo">E</div>

        {!collapsed && (
          <div className="brand-text">
            <h2>EBMS PRO</h2>
            <p>Business Management</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "sidebar-link-active" : ""
              }`
            }
            title={collapsed ? item.label : ""}
          >
            <span className="sidebar-icon">{item.icon}</span>

            {!collapsed && (
              <span className="sidebar-label">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="logout-button"
          title={collapsed ? "Logout" : ""}
          onClick={handleLogout}
        >
          <span className="sidebar-icon">🚪</span>

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}