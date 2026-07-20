export default function Topbar({ collapsed, onToggleSidebar }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
          <div className="user-avatar">A</div>

          <div className="user-details">
            <strong>Administrator</strong>
            <span>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}


