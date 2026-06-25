function Topbar({
  title,
  subtitle,
  currentUserLabel,
  currentTheme,
  alertCount,
  criticalAlerts,
  globalSearch,
  onGlobalSearchChange,
  onMenuToggle,
  onToggleTheme,
  onChangePassword,
  onLogout,
  onOpenAlerts,
  onQuickAddMember,
  canQuickAdd,
  isAuthenticated,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-toggle" type="button" onClick={onMenuToggle} aria-label="Open menu">
          Menu
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <input
          type="search"
          placeholder="Search by name, phone, or email"
          value={globalSearch}
          onChange={(event) => onGlobalSearchChange(event.target.value)}
        />
        <button className="secondary-btn" type="button" onClick={onToggleTheme}>
          Theme: {currentTheme === "light" ? "Light" : "Dark"}
        </button>
        <span className="user-chip">{currentUserLabel}</span>
        <button className="secondary-btn" type="button" onClick={onChangePassword} disabled={!isAuthenticated}>
          Change Password
        </button>
        <button className="secondary-btn" type="button" onClick={onLogout} disabled={!isAuthenticated}>
          Logout
        </button>
        <button
          className={`secondary-btn alert-btn${criticalAlerts ? " is-critical" : ""}`}
          type="button"
          onClick={onOpenAlerts}
        >
          Alerts ({alertCount})
        </button>
        <button className="primary-btn" type="button" onClick={onQuickAddMember} disabled={!canQuickAdd}>
          Add Member
        </button>
      </div>
    </header>
  );
}

export default Topbar;
