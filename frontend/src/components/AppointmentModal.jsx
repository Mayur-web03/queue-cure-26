import { useState } from "react";
import socket from "../socket";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AppointmentModal.css";

export default function AppointmentModal({ onClose, appointments = [] }) {
  const [tab, setTab] = useState("book"); // "book" | "upcoming"
  const [form, setForm] = useState({
    patientName: "",
    mobile: "",
    appointmentDateTime: null,
    reason: "",
  });
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBook = () => {
    if (!form.patientName.trim() || !form.appointmentDateTime) return;

    socket.emit("book_appointment", {
      patientName: form.patientName.trim(),
      mobile: form.mobile,
      date: form.appointmentDateTime.toISOString().split("T")[0],
      time: form.appointmentDateTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reason: form.reason || "General Consultation",
    });

    socket.once("appointment_booked", (appt) => {
      setSuccess(appt);
    });
  };

  const handleCancel = (id) => {
    socket.emit("cancel_appointment", id);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-title">📅 Schedule Appointment</p>
            <p className="modal-sub">Book next visit for a patient</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9", padding: "0 24px", gap: "0" }}>
          {["book", "upcoming"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSuccess(null); }}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: tab === t ? "2px solid #16A34A" : "2px solid transparent",
                padding: "10px 16px",
                font: "600 13px 'DM Sans', sans-serif",
                color: tab === t ? "#16A34A" : "#94A3B8",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              {t === "book" ? "Book New" : `Upcoming (${appointments.length})`}
            </button>
          ))}
        </div>

        {/* Book Tab */}
        {tab === "book" && (
          <>
            {success ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <p className="modal-success-title">Appointment Booked!</p>
                <p className="modal-success-sub">Details confirmed below</p>
                <div className="modal-success-card">
                  {[
                    ["Patient", success.patientName],
                    ["Date", formatDate(success.date)],
                    ["Time", success.time],
                    ["Reason", success.reason],
                  ].map(([k, v]) => (
                    <div key={k} className="modal-success-row">
                      <span className="modal-success-key">{k}</span>
                      <span className="modal-success-val">{v}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="modal-btn-book"
                  style={{ marginTop: "4px" }}
                  onClick={() => {
                    setSuccess(null);
                    setForm({ patientName: "", mobile: "", appointmentDateTime: null, reason: "" });
                  }}
                >
                  + Book Another
                </button>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  <div className="modal-form-group">
                    <label className="modal-label">Patient Name *</label>
                    <input
                      className="modal-input"
                      name="patientName"
                      placeholder="Enter full name"
                      value={form.patientName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Mobile Number</label>
                    <input
                      className="modal-input"
                      name="mobile"
                      placeholder="Enter mobile number"
                      type="tel"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Consolidate Date Picker Field */}
                  <div className="modal-form-group">
                    <label className="modal-label">Appointment Date & Time *</label>
                    <DatePicker
                      selected={form.appointmentDateTime}
                      onChange={(date) => setForm((prev) => ({ ...prev, appointmentDateTime: date }))}
                      showTimeSelect
                      timeIntervals={30}
                      dateFormat="dd MMM yyyy, h:mm aa"
                      minDate={new Date()}
                      placeholderText="Select date & time"
                      className="modal-input datepicker-input"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-label">Reason for Visit</label>
                    <input
                      className="modal-input"
                      name="reason"
                      placeholder="e.g. Follow-up, Blood test, Consultation"
                      value={form.reason}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
                  <button
                    className="modal-btn-book"
                    onClick={handleBook}
                    disabled={!form.patientName.trim() || !form.appointmentDateTime}
                  >
                    📅 Book Appointment
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Upcoming Tab */}
        {tab === "upcoming" && (
          <div className="modal-body">
            {appointments.length === 0 ? (
              <div className="appt-empty">No upcoming appointments</div>
            ) : (
              <div className="appt-list">
                {appointments.map((a) => (
                  <div key={a.id} className="appt-item">
                    <div className="appt-item-left">
                      <p className="appt-item-name">{a.patientName}</p>
                      <p className="appt-item-reason">{a.reason}</p>
                      <button className="appt-cancel-btn" onClick={() => handleCancel(a.id)}>
                        Cancel
                      </button>
                    </div>
                    <div className="appt-item-right">
                      <p className="appt-item-date">{formatDate(a.date)}</p>
                      <p className="appt-item-time">{a.time}</p>
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