import { navItems } from "../../constants";
import { canManageStaff, formatDateDisplay, getTodayKey } from "../../lib/gym";

function Sidebar({ activeView, onNavigate, isOpen, onClose, currentUser }) {
  const today = formatDateDisplay(getTodayKey());

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark">GF</div>
          <div className="brand-copy">
            <strong>GYM PRO</strong>
            <span>MANAGEMENT</span>
          </div>
        </div>
        <button className="icon-btn sidebar-close" type="button" onClick={onClose} aria-label="Close menu">
          X
        </button>
      </div>

      <nav className="nav-list">
        {navItems
          .filter((item) => item.id !== "staff" || canManageStaff(currentUser))
          .map((item) => (
            <button
              key={item.id}
              className={`nav-item${activeView === item.id ? " active" : ""}`}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
      </nav>

      <div className="sidebar-footer">
        <p>SYSTEM STATUS</p>
        <strong>
          <span className="status-online-dot"></span>
          Online
        </strong>
        <span id="todayDateLabel">{today}</span>
      </div>
    </aside>
  );
}

export default Sidebar;
