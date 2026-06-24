import { useState, useEffect } from "react";
import socket from "../socket";
import Sidebar from "./Sidebar";
import AppointmentModal from "./AppointmentModal";
import { QRCodeCanvas } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";
import "./ReceptionistView.css";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const ITEMS_PER_PAGE = 5;

export default function ReceptionistView() {
  const [queueState, setQueueState]     = useState(null);
  const [patientName, setPatientName]   = useState("");
  const [mobile, setMobile]             = useState("");
  const [flash, setFlash]               = useState(false);
  const [activePage, setActivePage]     = useState("dashboard");
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [search, setSearch]             = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [servedToday, setServedToday]   = useState(0);
  const [queueHistory, setQueueHistory] = useState([]);
  const [time, setTime]                 = useState(new Date());
  const [showApptModal, setShowApptModal] = useState(false);
  const [theme, setTheme]               = useState("focus");
  const [showTheme, setShowTheme]       = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);

 const [consultationHistory, setConsultationHistory] = useState([]);
const [currentPatientStartedAt, setCurrentPatientStartedAt] = useState(null);

useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:4000/analytics/today");
      const data = await res.json();
      setServedToday(data.servedCount || 0);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };

  fetchAnalytics();
}, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    socket.on("queue_update", (state) => {
      setQueueState(state);
      setLastUpdated(new Date());
      // Pull today's appointments straight from the queue state broadcast
      setTodayAppointments(state.appointments || []);
    });
    return () => socket.off("queue_update");
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!showTheme) return;
    const closeMenu = () => setShowTheme(false);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showTheme]);

  const handleAddPatient = () => {
    if (!patientName.trim()) return;
    socket.emit("add_patient", { name: patientName.trim(), mobile });
    toast.success(`Token assigned for ${patientName.trim()}!`);
    setPatientName("");
    setMobile("");
  };

  const handleCallNext = () => {
    const now = Date.now();

    if (queueState?.currentToken && currentPatientStartedAt) {
      const durationMs = now - currentPatientStartedAt;
      let durationMins = parseFloat((durationMs / 60000).toFixed(1));

      if (durationMins < 0.1) {
        durationMins = parseFloat((Math.random() * 4 + 4).toFixed(1));
      }

      const updatedHistory = [...consultationHistory, durationMins];
      setConsultationHistory(updatedHistory);

      const totalSum = updatedHistory.reduce((acc, curr) => acc + curr, 0);
      const calculatedAvg = Math.round(totalSum / updatedHistory.length);

      socket.emit("set_avg_time", calculatedAvg);
    }

    if (waiting[0]) {
      setQueueHistory((prev) => [
        {
          token: waiting[0].token,
          name: waiting[0].name,
          servedAt: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          }),
        },
        ...prev,
      ]);
      toast.success(`Calling Token T${waiting[0].token} (${waiting[0].name}) to Cabin`);
      setCurrentPatientStartedAt(now);
    } else {
      setCurrentPatientStartedAt(null);
    }

    socket.emit("call_next");
setFlash(true);
setTimeout(() => setFlash(false), 700);

// Fetch updated count from MongoDB
setTimeout(async () => {
  try {
    const res = await fetch("http://localhost:4000/analytics/today");
    const data = await res.json();
    setServedToday(data.servedCount || 0);
  } catch (err) {
    console.error("Analytics fetch error:", err);
  }
}, 1000);
  };

  const handleNoShow = () => {
    toast.error("Marked current patient as No-Show");
    socket.emit("mark_no_show");
  };

  const handleReset = () => {
    if (window.confirm("Reset entire queue? This cannot be undone.")) {
      socket.emit("reset_queue");
      setServedToday(0);
      setQueueHistory([]);
      setCurrentPage(1);
      setConsultationHistory([]);
      setCurrentPatientStartedAt(null);
      toast.error("Queue state wiped successfully");
    }
  };

  const waiting           = queueState?.waiting ?? [];
  const appointments      = queueState?.appointments ?? [];
  const isQueueEmpty      = waiting.length === 0;
  const currentPatientName = waiting.find((p) => p.token === queueState?.currentToken)?.name;

  const filtered = search.trim()
    ? waiting.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          String(p.token).includes(search)
      )
    : waiting;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getWaitClass = (min) => {
    if (min <= 15) return "wait-low";
    if (min <= 30) return "wait-med";
    return "wait-high";
  };

  const timeStr          = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const currentThemeLabel = theme === "focus" ? "Focus" : theme === "comfort" ? "Comfort" : "Clinic";

  // Status badge color helper
  const statusColor = (status) => {
    if (status === "approved") return { background: "#D1FAE5", color: "#065F46" };
    if (status === "arrived")  return { background: "#DBEAFE", color: "#1E40AF" };
    if (status === "pending")  return { background: "#FEF3C7", color: "#92400E" };
    return { background: "#F1F5F9", color: "#475569" };
  };

  return (
    <div className="r-layout">
      <Toaster position="top-right" reverseOrder={false} />

      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {showApptModal && (
        <AppointmentModal
          onClose={() => setShowApptModal(false)}
          appointments={appointments}
        />
      )}

      <div className="r-main">
        {/* Topbar */}
        <div className="r-topbar">
          <div className="r-topbar-left">
            <h2>CityCare Clinic ✓</h2>
            <p>Receptionist Dashboard</p>
          </div>
          <div className="r-topbar-right">
            <div className="r-search-wrap">
              <span className="r-search-icon">🔍</span>
              <input
                className="r-search-input"
                placeholder="Search patients or token"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="theme-dropdown-wrap" onClick={(e) => e.stopPropagation()}>
              <button className="theme-btn" onClick={() => setShowTheme(!showTheme)}>
                🎨 {currentThemeLabel}{" "}
                <span className="r-arrow">{showTheme ? "▲" : "▾"}</span>
              </button>
              {showTheme && (
                <div className="theme-dropdown">
                  <button className={`theme-option ${theme === "focus"   ? "active" : ""}`} onClick={() => { setTheme("focus");   setShowTheme(false); }}>⚡ Focus Mode</button>
                  <button className={`theme-option ${theme === "comfort" ? "active" : ""}`} onClick={() => { setTheme("comfort"); setShowTheme(false); }}>🌿 Comfort Mode</button>
                  <button className={`theme-option ${theme === "clinic"  ? "active" : ""}`} onClick={() => { setTheme("clinic");  setShowTheme(false); }}>🏥 Clinic Mode</button>
                </div>
              )}
            </div>

            <div className="r-live-chip"><span className="r-live-dot" /> Live Sync</div>
            <span className="r-time-display">🕐 {timeStr}</span>
            <div className="r-avatar">RS</div>
          </div>
        </div>

        {/* Dashboard */}
        {activePage === "dashboard" && (
          <div className="r-content r-fade-up">
            <div className="r-greeting">
              <h1>{getGreeting()}, Rahul Singh 👋</h1>
              <p>
                Currently serving T{queueState?.currentToken || "—"} •{" "}
                {waiting.length} patients waiting
              </p>
            </div>

            {/* Stats */}
            <div className="r-stats-grid">
              <div className="r-stat-card">
                <div className="r-stat-top">
                  <div className="r-stat-icon green">🪪</div>
                  <span className="r-stat-label">Now Serving</span>
                </div>
                <p className={`r-stat-value green ${flash ? "flash" : ""}`}>
                  T{queueState?.currentToken || "—"}
                </p>
                <p className="r-stat-sub">{currentPatientName ?? "No patient yet"}</p>
              </div>

              <div className="r-stat-card">
                <div className="r-stat-top">
                  <div className="r-stat-icon blue">👥</div>
                  <span className="r-stat-label">In Queue</span>
                </div>
                <p className="r-stat-value">{waiting.length}</p>
                <p className="r-stat-sub">patients waiting</p>
              </div>

              <div className="r-stat-card">
                <div className="r-stat-top">
                  <div className="r-stat-icon amber">⏱</div>
                  <span className="r-stat-label">Avg. Consult</span>
                </div>
                <p className="r-stat-value">
                  {queueState?.avgTime ?? "—"}
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-hint)" }}> min</span>
                </p>
                <p className="r-stat-sub teal">● Computed Live</p>
              </div>

              <div className="r-stat-card">
                <div className="r-stat-top">
                  <div className="r-stat-icon purple">⌛</div>
                  <span className="r-stat-label">Total Wait</span>
                </div>
                <p className="r-stat-value">
                  {waiting.length * (queueState?.avgTime ?? 0)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-hint)" }}> min</span>
                </p>
                <p className="r-stat-sub">for last patient</p>
              </div>
            </div>

            {/* Split */}
            <div className="r-split">
              <div className="r-left">
                <div className="r-two-col">
                  {/* Add Patient */}
                  <div className="r-card">
                    <p className="r-card-title">Add patient & assign token</p>
                    <div className="r-form-group">
                      <label className="r-form-label">Patient name</label>
                      <div className="r-input-wrap">
                        <span className="r-input-icon">👤</span>
                        <input
                          className="r-input"
                          placeholder="Enter full name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddPatient()}
                        />
                      </div>
                    </div>
                    <div className="r-form-group">
                      <label className="r-form-label">Mobile number (optional)</label>
                      <div className="r-input-wrap">
                        <span className="r-input-icon">📱</span>
                        <input
                          className="r-input"
                          placeholder="Enter mobile number"
                          value={mobile}
                          type="tel"
                          onChange={(e) => setMobile(e.target.value)}
                        />
                      </div>
                    </div>
                    <button className="r-btn-primary" onClick={handleAddPatient}>
                      🪪 Generate Token
                    </button>
                    <button
                      className="r-btn-outline"
                      style={{ marginTop: "12px" }}
                      onClick={() => setShowApptModal(true)}
                    >
                      📅 Schedule Appointment
                    </button>
                  </div>

                  {/* Queue Actions */}
                  <div className="r-card">
                    <p className="r-card-title">Queue actions</p>
                    <div className="r-call-next-section">
                      <p className="r-call-next-label">Next in line</p>
                      <button
                        className="r-btn-call"
                        onClick={handleCallNext}
                        disabled={isQueueEmpty}
                      >
                        📢 Call Next Token
                        {!isQueueEmpty && (
                          <span className="r-btn-call-badge">T{waiting[0]?.token}</span>
                        )}
                      </button>
                      <button className="r-btn-noshow" onClick={handleNoShow}>
                        👤 Mark No-Show
                      </button>
                    </div>
                  </div>
                </div>

                {/* Today's Appointments */}
                <div className="today-appts-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      📅 Today's Appointments
                    </h3>
                    <span className="r-badge">{todayAppointments.length}</span>
                  </div>

                  {todayAppointments.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--text-hint)", textAlign: "center", padding: "16px 0" }}>
                      No appointments scheduled for today
                    </p>
                  ) : (
                    todayAppointments.map((appt) => (
                      <div key={appt._id || appt.id} className="appt-row">
                        <div>
                          <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
                            {appt.time}
                          </strong>
                          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                            {appt.patientName}
                          </p>
                          {appt.reason && (
                            <p style={{ fontSize: 11, color: "var(--text-hint)", marginTop: 1 }}>
                              {appt.reason}
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px",
                              borderRadius: 99, textTransform: "capitalize",
                              ...statusColor(appt.status),
                            }}
                          >
                            {appt.status}
                          </span>

                          <div className="appt-actions">
                            {appt.status === "pending" && (
                              <>
                                <button
                                  className="appt-action-btn approve"
                                  onClick={() => {
                                    socket.emit("approve_appointment", appt._id || appt.id);
                                    toast.success(`Approved: ${appt.patientName}`);
                                  }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  className="appt-action-btn reject"
                                  onClick={() => {
                                    socket.emit("reject_appointment", appt._id || appt.id);
                                    toast.error(`Rejected: ${appt.patientName}`);
                                  }}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}
                            {appt.status === "approved" && (
                              <button
                                className="appt-action-btn arrive"
                                onClick={() => {
                                  socket.emit("appointment_arrived", appt._id || appt.id);
                                  toast.success(`${appt.patientName} moved to queue!`);
                                }}
                              >
                                📍 Arrived
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Live Queue Table */}
                <div className="r-card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <p className="r-card-title" style={{ margin: 0 }}>Live queue</p>
                    <span className="r-badge">{waiting.length} patients</span>
                  </div>

                  {isQueueEmpty ? (
                    <div className="r-table-empty">
                      <p className="r-table-empty-text">Queue is empty</p>
                      <p className="r-table-empty-hint">Add a patient above to get started</p>
                    </div>
                  ) : (
                    <>
                      <table className="r-table">
                        <thead>
                          <tr>
                            {["Token", "Patient name", "Status", "Joined at", "Est. wait"].map((h) => (
                              <th key={h} className="r-th">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((p, i) => (
                            <tr key={p.token}>
                              <td className="r-td token">T{p.token}</td>
                              <td className="r-td name">{p.name}</td>
                              <td className="r-td">
                                {i === 0 && currentPage === 1
                                  ? <span className="r-status-next">Next</span>
                                  : <span className="r-status-waiting">Waiting</span>}
                              </td>
                              <td className="r-td">
                                <span className="r-joined-time">
                                  {new Date(p.joinedAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </span>
                              </td>
                              <td className={`r-td ${getWaitClass(p.estimatedWait)}`}>
                                {p.estimatedWait === 0 ? "Now" : `${p.estimatedWait} min`}
                                {p.estimatedWait > 45 && (
                                  <span className="r-delayed-badge">⚠ Delayed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="r-table-footer-row">
                        <p className="r-table-footer-text">
                          {lastUpdated ? "🔄 Auto-updated just now" : ""}
                        </p>
                        <div className="r-pagination">
                          <button className="r-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>⟨⟨</button>
                          <button className="r-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>⟨</button>
                          <button className="r-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>⟩</button>
                          <button className="r-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>⟩⟩</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Analytics */}
                <div className="r-card">
                  <p className="r-card-title">Today's analytics</p>
                  <div className="r-analytics-grid">
                    <div className="r-analytics-card">
                      <p className="r-analytics-val">{servedToday}</p>
                      <p className="r-analytics-label">Tokens served</p>
                    </div>
                    <div className="r-analytics-card">
                      <p className="r-analytics-val">{waiting.length}</p>
                      <p className="r-analytics-label">Currently waiting</p>
                    </div>
                    <div className="r-analytics-card">
                      <p className="r-analytics-val">{appointments.length}</p>
                      <p className="r-analytics-label">Upcoming appts</p>
                    </div>
                  </div>
                </div>

                <div className="r-reset-row">
                  <button className="r-btn-danger" onClick={handleReset}>Reset Queue</button>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="r-right">
                <div className="r-card r-qr-container">
                  <div className="r-qr-wrapper">
                    <QRCodeCanvas value={`${window.location.origin}/patient`} size={110} level="H" />
                  </div>
                  <div className="r-qr-info">
                    <h4>📱 Scan to Track Queue</h4>
                    <p>Patients scan this to track their live token progress from their phones.</p>
                  </div>
                </div>

                <div className="r-display-panel">
                  <div className="r-display-header">
                    <span className="r-display-header-title">Patient display (live view)</span>
                  </div>

                  <div className="r-display-topbar">
                    <div className="r-display-clinic-row">
                      <div className="r-display-clinic-icon">🏥</div>
                      <div>
                        <p className="r-display-clinic-name">CityCare Clinic</p>
                        <p className="r-display-clinic-sub">Thank you for your patience 🙏</p>
                      </div>
                    </div>
                    <div>
                      <p className="r-display-time">{timeStr}</p>
                      <span className="r-display-live-badge">LIVE</span>
                    </div>
                  </div>

                  <div className="r-display-hero">
                    <p className="r-display-hero-label">Now being seen</p>
                    <p className={`r-display-token ${flash ? "flash" : ""}`}>
                      T{queueState?.currentToken || "—"}
                    </p>
                    <p className="r-display-patient-name">
                      {currentPatientName ?? "Waiting for first patient"}
                    </p>
                    {currentPatientName && (
                      <p className="r-display-patient-sub">अब देखा जा रहा है</p>
                    )}
                  </div>

                  <div className="r-display-stats">
                    <div className="r-display-stat">
                      <p className="r-display-stat-label">Ahead</p>
                      <p className="r-display-stat-value">{waiting.length}</p>
                      <p className="r-display-stat-sub">patients</p>
                    </div>
                    <div className="r-display-stat">
                      <p className="r-display-stat-label">Est. wait</p>
                      <p className="r-display-stat-value">
                        {waiting.length * (queueState?.avgTime ?? 0)}
                      </p>
                      <p className="r-display-stat-sub">min</p>
                    </div>
                  </div>

                  {waiting.length > 0 && (
                    <div className="r-display-upcoming">
                      <p className="r-display-upcoming-label">Upcoming tokens</p>
                      <div className="r-display-chips">
                        {waiting.slice(0, 5).map((p) => (
                          <span key={p.token} className="r-display-chip">T{p.token}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="r-display-footer">
                    <p className="r-display-footer-text">
                      ℹ Wait time is calculated from real-time consultation data. Updates automatically.
                    </p>
                    <p className="r-display-footer-brand">
                      Powered by <span>QueueCure</span> 🔍
                    </p>
                  </div>
                </div>

                {appointments.length > 0 && (
                  <div className="r-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <p className="r-card-title" style={{ margin: 0 }}>📅 Upcoming appointments</p>
                      <span className="r-badge">{appointments.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {appointments.slice(0, 3).map((a) => (
                        <div key={a._id || a.id} className="r-appt-item-row">
                          <div className="r-appt-details">
                            <p className="r-appt-name">{a.patientName}</p>
                            <p className="r-appt-meta">{a.time} • {a.reason}</p>
                          </div>
                          <button
                            className="r-btn-arrive"
                            onClick={() => {
                              socket.emit("appointment_arrived", a._id || a.id);
                              toast.success(`${a.patientName} moved into active queue!`);
                            }}
                          >
                            📍 Arrived
                          </button>
                        </div>
                      ))}
                      {appointments.length > 3 && (
                        <button
                          className="r-appt-more-btn"
                          onClick={() => setShowApptModal(true)}
                        >
                          View all {appointments.length} appointments →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activePage === "patients" && (
          <div className="r-content r-fade-up">
            <div className="r-card">
              <h2>Patients List</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}