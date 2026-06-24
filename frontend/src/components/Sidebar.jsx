import { useState, useEffect } from "react";
import "./Sidebar.css";

export default function Sidebar({ activePage, onNavigate }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "patients", label: "Patients", icon: "👥" },
    { id: "history", label: "Queue History", icon: "↺" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logomark">Q</div>
        <div>
          <p className="sidebar-logo-name">QueueCure</p>
          <p className="sidebar-logo-role">Receptionist Dashboard</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-live">
        <span className="sidebar-live-dot" />
        <div>
          <p className="sidebar-live-text">Live</p>
          <p className="sidebar-live-sub">Last updated just now</p>
        </div>
      </div>

      <div className="sidebar-bottom">
        <p className="sidebar-time">
          {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="sidebar-date">
          {time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
        </p>
      </div>

      <div style={{ padding: "0 10px 16px" }}>
        <button className="sidebar-logout">
          ↩ Log Out
        </button>
      </div>
    </div>
  );
}