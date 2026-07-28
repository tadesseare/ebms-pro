import { useAuth } from "../context/AuthContext";

export default function Topbar({ collapsed, onToggleSidebar }) {
  const { user } = useAuth();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const userName = user?.name?.trim() || "User";

  const userRole = String(user?.role || "staff")
    .trim()
    .toLowerCase();

  const formattedRole =
    userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const userInitials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="menu-button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
        >
          ☰
        </button>

        <div className="topbar-search">
          <span>🔍</span>

          <input
            type="search"
            placeholder="Search EBMS..."
            aria-label="Search EBMS"
          />
        </div>
      </div>

      <div className="topbar-right">
        <div className="database-status">
          <span className="database-dot"></span>
          <span>Live Database</span>
        </div>

        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          🔔
          <span className="notification-count">3</span>
        </button>

        <div className="topbar-date">{currentDate}</div>

        <div className="user-profile">
          <div className="user-avatar">{userInitials}</div>

          <div className="user-details">
            <strong>{userName}</strong>
            <span>{formattedRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}


