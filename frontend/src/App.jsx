import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReceptionistView from "./components/ReceptionistView";
import PatientView from "./components/PatientView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/receptionist" element={<ReceptionistView />} />
        <Route path="/patient" element={<PatientView />} />
        <Route path="/" element={
          <div style={{
            minHeight: "100vh", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#F8FAFC", fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: "#16A34A", color: "#FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", fontWeight: 700, margin: "0 auto 16px",
              }}>Q</div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                QueueCure '26
              </h1>
              <p style={{ fontSize: "14px", color: "#94A3B8", marginBottom: "28px" }}>
                Live Queue Management System
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <a href="/receptionist" style={{
                  background: "#16A34A", color: "#FFFFFF",
                  padding: "12px 24px", borderRadius: "8px",
                  fontWeight: 700, fontSize: "14px", textDecoration: "none",
                }}>
                  Receptionist Dashboard
                </a>
                <a href="/patient" style={{
                  background: "#FFFFFF", color: "#16A34A",
                  border: "1px solid #16A34A",
                  padding: "12px 24px", borderRadius: "8px",
                  fontWeight: 700, fontSize: "14px", textDecoration: "none",
                }}>
                  Patient Portal
                </a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;