import { useState, useEffect } from "react";
import socket from "../socket";
import "./AppointmentRequest.css";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

const REASONS = [
  "General Consultation",
  "Follow-up Visit",
  "Blood Test / Lab Work",
  "Prescription Renewal",
  "Health Checkup",
  "Vaccination",
  "Other",
];

export default function AppointmentRequest({ onClose, existingAppointments = [] }) {
  const [tab, setTab] = useState("book");
  const [form, setForm] = useState({
    patientName: "Ramesh Kumar",
    mobile: "",
    date: "",
    time: "",
    reason: "General Consultation",
  });
  const [success, setSuccess] = useState(null);
  const [myAppointments, setMyAppointments] = useState(existingAppointments);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [viewAppt, setViewAppt] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    socket.on("appointment_requested", (appt) => {
      setSuccess(appt);
      setMyAppointments((prev) => [...prev, appt]);
    });
    socket.on("appointment_approved", (appt) => {
      setMyAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: "approved" } : a))
      );
    });
    socket.on("appointment_rejected", (appt) => {
      setMyAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: "rejected" } : a))
      );
    });
    socket.on("appointment_rescheduled", (appt) => {
      setMyAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...appt } : a))
      );
    });
    socket.on("queue_update", (state) => {
      if (state.appointments) {
        setMyAppointments((prev) => {
          const approved = state.appointments;
          const pending = state.pendingAppointments ?? [];
          const merged = [...approved, ...pending];
          return merged.filter((a) =>
            a.patientName === "Ramesh Kumar"
          );
        });
      }
    });
    return () => {
      socket.off("appointment_requested");
      socket.off("appointment_approved");
      socket.off("appointment_rejected");
      socket.off("appointment_rescheduled");
      socket.off("queue_update");
    };
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.patientName || !form.date || !form.time) return;
    socket.emit("request_appointment", {
      patientName: form.patientName,
      mobile: form.mobile,
      date: form.date,
      time: form.time,
      reason: form.reason,
    });
  };

  const handleCancel = (id) => {
    socket.emit("cancel_appointment", id);
    setMyAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
  };

  const handleReschedule = (id) => {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    socket.emit("reschedule_appointment", {
      id,
      date: rescheduleForm.date,
      time: rescheduleForm.time,
    });
    setRescheduleId(null);
    setRescheduleForm({ date: "", time: "" });
  };

  const formatDate = (d) => {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
    } catch { return d; }
  };

  const getStatusIcon = (status) => {
    if (status === "approved" || status === "rescheduled") return "✅";
    if (status === "pending") return "⏳";
    if (status === "rejected") return "❌";
    if (status === "cancelled") return "🚫";
    return "📅";
  };

  const activeAppts = myAppointments.filter((a) => a.status !== "cancelled");

  return (
    <div className="ar-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ar-modal">
        {/* Header */}
        <div className="ar-header">
          <div className="ar-header-left">
            <div className="ar-header-icon">📅</div>
            <div>
              <p className="ar-title">Appointments</p>
              <p className="ar-subtitle">Book or manage your clinic visits</p>
            </div>
          </div>
          <button className="ar-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="ar-tabs">
          {[
            { id: "book", label: "📝 Book New" },
            { id: "my", label: `📋 My Appointments (${activeAppts.length})` },
          ].map((t) => (
            <button
              key={t.id}
              className={`ar-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => { setTab(t.id); setSuccess(null); setViewAppt(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Book Tab */}
        {tab === "book" && (
          <>
            {success ? (
              <div className="ar-body">
                <div className="ar-success">
                  <div className="ar-success-icon">📅</div>
                  <p className="ar-success-title">Appointment Requested!</p>
                  <p className="ar-success-sub">
                    Your request has been sent to the receptionist for approval.
                  </p>
                  <div className="ar-success-card">
                    {[
                      ["Patient", success.patientName],
                      ["Date", formatDate(success.date)],
                      ["Time", success.time],
                      ["Reason", success.reason],
                      ["Status", "Pending Approval ⏳"],
                    ].map(([k, v]) => (
                      <div key={k} className="ar-success-row">
                        <span className="ar-success-key">{k}</span>
                        <span className="ar-success-val">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="ar-status-banner pending">
                    <span className="ar-status-icon">⏳</span>
                    <div>
                      <p className="ar-status-title">Waiting for receptionist approval</p>
                      <p className="ar-status-sub">You'll be notified once approved. Check "My Appointments" tab.</p>
                    </div>
                  </div>
                  <button
                    className="ar-btn-submit"
                    onClick={() => {
                      setSuccess(null);
                      setForm({ patientName: "Ramesh Kumar", mobile: "", date: "", time: "", reason: "General Consultation" });
                    }}
                  >
                    + Book Another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="ar-body">
                  <div className="ar-form-group">
                    <label className="ar-label">Patient Name *</label>
                    <input className="ar-input" name="patientName" value={form.patientName} onChange={handleChange} placeholder="Full name" />
                  </div>
                  <div className="ar-form-group">
                    <label className="ar-label">Mobile Number</label>
                    <input className="ar-input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="+91 XXXXX XXXXX" type="tel" />
                  </div>
                  <div className="ar-row">
                    <div className="ar-form-group">
                      <label className="ar-label">Preferred Date *</label>
                      <input className="ar-input" name="date" type="date" min={today} value={form.date} onChange={handleChange} />
                    </div>
                    <div className="ar-form-group">
                      <label className="ar-label">Preferred Time *</label>
                      <select className="ar-select" name="time" value={form.time} onChange={handleChange}>
                        <option value="">Select time</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="ar-form-group">
                    <label className="ar-label">Reason for Visit</label>
                    <select className="ar-select" name="reason" value={form.reason} onChange={handleChange}>
                      {REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ar-status-banner pending">
                    <span className="ar-status-icon">ℹ️</span>
                    <div>
                      <p className="ar-status-title">How it works</p>
                      <p className="ar-status-sub">Your request goes to the receptionist for approval. Once approved, it appears in "My Appointments".</p>
                    </div>
                  </div>
                </div>
                <div className="ar-footer">
                  <button className="ar-btn-cancel" onClick={onClose}>Cancel</button>
                  <button
                    className="ar-btn-submit"
                    onClick={handleSubmit}
                    disabled={!form.patientName || !form.date || !form.time}
                  >
                    📅 Send Request
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* My Appointments Tab */}
        {tab === "my" && (
          <div className="ar-body">
            {viewAppt ? (
              <>
                <button
                  onClick={() => setViewAppt(null)}
                  style={{ fontSize: "13px", color: "#16A34A", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, alignSelf: "flex-start" }}
                >
                  ← Back to list
                </button>
                <div className="ar-appt-card">
                  <div className="ar-appt-card-header">
                    <p className="ar-appt-card-name">{viewAppt.patientName}</p>
                    <span className={`ar-appt-status ${viewAppt.status}`}>{viewAppt.status}</span>
                  </div>
                  <div className="ar-appt-card-body">
                    <div className="ar-appt-row"><span className="ar-appt-icon">📅</span> {formatDate(viewAppt.date)}</div>
                    <div className="ar-appt-row"><span className="ar-appt-icon">🕐</span> {viewAppt.time}</div>
                    <div className="ar-appt-row"><span className="ar-appt-icon">🏥</span> {viewAppt.reason}</div>
                    {viewAppt.mobile && <div className="ar-appt-row"><span className="ar-appt-icon">📞</span> {viewAppt.mobile}</div>}
                    <div className="ar-appt-row"><span className="ar-appt-icon">🕐</span> Requested: {new Date(viewAppt.requestedAt).toLocaleString("en-IN")}</div>
                  </div>
                </div>

                {/* Status Banner */}
                <div className={`ar-status-banner ${viewAppt.status}`}>
                  <span className="ar-status-icon">{getStatusIcon(viewAppt.status)}</span>
                  <div>
                    <p className="ar-status-title">
                      {viewAppt.status === "approved" && "Appointment Confirmed"}
                      {viewAppt.status === "pending" && "Awaiting Approval"}
                      {viewAppt.status === "rejected" && "Request Rejected"}
                      {viewAppt.status === "rescheduled" && "Appointment Rescheduled"}
                      {viewAppt.status === "cancelled" && "Appointment Cancelled"}
                    </p>
                    <p className="ar-status-sub">
                      {viewAppt.status === "approved" && "Your appointment is confirmed. Please arrive 10 minutes early."}
                      {viewAppt.status === "pending" && "Waiting for receptionist to approve your request."}
                      {viewAppt.status === "rejected" && "Your request was declined. Please book a new one."}
                      {viewAppt.status === "rescheduled" && "Your appointment has been moved to a new time."}
                      {viewAppt.status === "cancelled" && "This appointment has been cancelled."}
                    </p>
                  </div>
                </div>

                {/* Reschedule Form */}
                {rescheduleId === viewAppt.id && (
                  <div className="ar-reschedule-form">
                    <p className="ar-reschedule-title">📅 Reschedule Appointment</p>
                    <div className="ar-row">
                      <div className="ar-form-group">
                        <label className="ar-label">New Date *</label>
                        <input className="ar-input" type="date" min={today} value={rescheduleForm.date} onChange={(e) => setRescheduleForm((p) => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div className="ar-form-group">
                        <label className="ar-label">New Time *</label>
                        <select className="ar-select" value={rescheduleForm.time} onChange={(e) => setRescheduleForm((p) => ({ ...p, time: e.target.value }))}>
                          <option value="">Select time</option>
                          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="ar-btn-sm" onClick={() => setRescheduleId(null)}>Cancel</button>
                      <button
                        className="ar-btn-sm primary"
                        onClick={() => { handleReschedule(viewAppt.id); setViewAppt((p) => ({ ...p, date: rescheduleForm.date, time: rescheduleForm.time, status: "rescheduled" })); }}
                        disabled={!rescheduleForm.date || !rescheduleForm.time}
                      >
                        Confirm Reschedule
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {viewAppt.status !== "cancelled" && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {rescheduleId !== viewAppt.id && (
                      <button className="ar-btn-sm blue" onClick={() => setRescheduleId(viewAppt.id)}>
                        🔄 Reschedule
                      </button>
                    )}
                    <button
                      className="ar-btn-sm danger"
                      onClick={() => { handleCancel(viewAppt.id); setViewAppt((p) => ({ ...p, status: "cancelled" })); }}
                    >
                      🗑 Cancel Appointment
                    </button>
                  </div>
                )}
              </>
            ) : activeAppts.length === 0 ? (
              <div className="ar-empty">
                <div className="ar-empty-icon">📭</div>
                <p className="ar-empty-text">No appointments yet</p>
                <p className="ar-empty-sub">Book your first appointment from the "Book New" tab</p>
                <button
                  className="ar-btn-submit"
                  style={{ margin: "16px auto 0" }}
                  onClick={() => setTab("book")}
                >
                  + Book Appointment
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activeAppts.map((a) => (
                  <div key={a.id} className="ar-appt-card">
                    <div className="ar-appt-card-header">
                      <p className="ar-appt-card-name">{a.reason}</p>
                      <span className={`ar-appt-status ${a.status}`}>
                        {getStatusIcon(a.status)} {a.status}
                      </span>
                    </div>
                    <div className="ar-appt-card-body">
                      <div className="ar-appt-row"><span className="ar-appt-icon">📅</span> {formatDate(a.date)}</div>
                      <div className="ar-appt-row"><span className="ar-appt-icon">🕐</span> {a.time}</div>
                    </div>

                    {/* Reschedule inline */}
                    {rescheduleId === a.id && (
                      <div style={{ padding: "10px 16px", borderTop: "1px solid #F1F5F9" }}>
                        <div className="ar-reschedule-form">
                          <p className="ar-reschedule-title">📅 New Date & Time</p>
                          <div className="ar-row">
                            <div className="ar-form-group">
                              <label className="ar-label">Date</label>
                              <input className="ar-input" type="date" min={today} value={rescheduleForm.date} onChange={(e) => setRescheduleForm((p) => ({ ...p, date: e.target.value }))} />
                            </div>
                            <div className="ar-form-group">
                              <label className="ar-label">Time</label>
                              <select className="ar-select" value={rescheduleForm.time} onChange={(e) => setRescheduleForm((p) => ({ ...p, time: e.target.value }))}>
                                <option value="">Select</option>
                                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="ar-btn-sm" onClick={() => setRescheduleId(null)}>Cancel</button>
                            <button
                              className="ar-btn-sm primary"
                              onClick={() => handleReschedule(a.id)}
                              disabled={!rescheduleForm.date || !rescheduleForm.time}
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="ar-appt-card-actions">
                      <button className="ar-btn-sm" onClick={() => setViewAppt(a)}>
                        👁 View Details
                      </button>
                      {a.status !== "cancelled" && rescheduleId !== a.id && (
                        <button className="ar-btn-sm blue" onClick={() => { setRescheduleId(a.id); setRescheduleForm({ date: "", time: "" }); }}>
                          🔄 Reschedule
                        </button>
                      )}
                      {a.status !== "cancelled" && (
                        <button className="ar-btn-sm danger" onClick={() => handleCancel(a.id)}>
                          🗑 Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}