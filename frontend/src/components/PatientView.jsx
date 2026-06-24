import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "../socket";

const CLINIC_NAME = "CityCare Clinic";
const CURRENT_DOCTOR = "Dr. Sarah Johnson";
const CONSULTATION_ROOM = "Room 4";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  .pv-root *, .pv-root *::before, .pv-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pv-root {
    --g50:  #F0FDF4; --g100: #DCFCE7; --g200: #BBF7D0;
    --g600: #16A34A; --g700: #15803D; --g800: #166534;
    --a50:  #FFFBEB; --a100: #FEF3C7; --a200: #FDE68A;
    --a600: #D97706; --a700: #B45309; --a800: #92400E;
    --r50:  #FEF2F2; --r200: #FECACA; --r600: #DC2626;
    --s0:   #FFFFFF; --s50:  #F8FAFC; --s100: #F1F5F9;
    --s200: #E2E8F0; --s300: #CBD5E1; --s400: #94A3B8;
    --s500: #64748B; --s600: #475569; --s700: #334155; --s900: #0F172A;
    --b50:  #EFF6FF; --b200: #BFDBFE; --b600: #2563EB;
    --y50:  #FEFCE8; --y200: #FEF08A; --y600: #CA8A04;
    --rad-sm: 6px; --rad-md: 8px; --rad-lg: 12px; --rad-xl: 16px; --rad-full: 9999px;
    --t: 0.15s ease;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    color: var(--s900);
  }

  @keyframes pv-pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes pv-fadeup   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pv-tokenpop { 0%{transform:scale(1)} 40%{transform:scale(1.08);color:var(--g600)} 100%{transform:scale(1)} }
  @keyframes pv-dropin   { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pv-spin     { to{transform:rotate(360deg)} }

  /* Layout */
  .pv-layout { display:flex; min-height:100vh; background:var(--s100); }
  .pv-sidebar {
    width:204px; min-height:100vh;
    background:var(--s0); border-right:1px solid var(--s200);
    display:flex; flex-direction:column;
    position:fixed; left:0; top:0; z-index:200;
  }
  .pv-sidebar-logo {
    display:flex; align-items:center; gap:10px;
    padding:14px 16px; border-bottom:1px solid var(--s100);
  }
  .pv-logomark {
    width:30px; height:30px; border-radius:var(--rad-md);
    background:var(--g600); color:#fff;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; flex-shrink:0; letter-spacing:-0.5px;
  }
  .pv-sidebar-name { font-size:13px; font-weight:700; color:var(--s900); }
  .pv-sidebar-nav { flex:1; padding:8px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .pv-nav-item {
    display:flex; align-items:center; gap:9px;
    padding:8px 10px; border-radius:var(--rad-md);
    font-size:13px; font-weight:500; color:var(--s500);
    cursor:pointer; border:none; border-left:2px solid transparent;
    background:transparent; width:100%; text-align:left;
    font-family:inherit; transition:background var(--t),color var(--t),border-color var(--t);
  }
  .pv-nav-item:hover { background:var(--g50); color:var(--g700); }
  .pv-nav-item.active { background:var(--g50); color:var(--g700); font-weight:600; border-left-color:var(--g600); }
  .pv-nav-icon { font-size:15px; flex-shrink:0; }
  .pv-sidebar-live {
    margin:0 8px 8px; background:var(--g50);
    border:1px solid var(--g200); border-radius:var(--rad-md); padding:10px 12px;
  }
  .pv-live-dot {
    width:7px; height:7px; border-radius:50%;
    background:var(--g600); display:inline-block;
    animation:pv-pulse 1.5s infinite; margin-right:6px; vertical-align:middle;
  }
  .pv-sidebar-live-text { font-size:12px; font-weight:700; color:var(--g800); }
  .pv-sidebar-live-sub { font-size:11px; color:var(--s500); margin-top:3px; }
  .pv-logout-btn {
    display:flex; align-items:center; gap:8px;
    padding:12px 16px; font-size:13px; color:var(--s500);
    cursor:pointer; border:none; border-top:1px solid var(--s100);
    background:transparent; font-family:inherit;
    transition:background var(--t),color var(--t); width:100%; text-align:left;
  }
  .pv-logout-btn:hover { background:var(--r50); color:var(--r600); }

  /* Main */
  .pv-main { margin-left:204px; flex:1; display:flex; flex-direction:column; min-height:100vh; min-width:0; }

  /* Topbar */
  .pv-topbar {
    height:56px; background:var(--s0); border-bottom:1px solid var(--s200);
    padding:0 24px; display:flex; justify-content:space-between; align-items:center;
    position:sticky; top:0; z-index:100;
  }
  .pv-topbar-title { font-size:14px; font-weight:700; color:var(--s900); letter-spacing:-0.2px; }
  .pv-topbar-right { display:flex; align-items:center; gap:12px; }

  /* Connection pill */
  .pv-conn-pill {
    display:flex; align-items:center; gap:6px;
    border-radius:var(--rad-full); padding:4px 12px;
    font-size:12px; font-weight:700;
  }
  .pv-conn-pill.live    { background:var(--g50);  border:1px solid var(--g200); color:var(--g800); }
  .pv-conn-pill.offline { background:var(--r50);  border:1px solid var(--r200); color:var(--r600); }
  .pv-conn-pill.recon   { background:var(--y50);  border:1px solid var(--y200); color:var(--y600); }
  .pv-conn-dot { width:6px; height:6px; border-radius:50%; }
  .pv-conn-dot.live    { background:var(--g600); animation:pv-pulse 1.5s infinite; }
  .pv-conn-dot.offline { background:var(--r600); }
  .pv-conn-dot.recon   { background:var(--y600); animation:pv-spin 1s linear infinite; border-radius:0; width:8px; height:8px; border:2px solid var(--y600); border-top-color:transparent; border-radius:50%; }

  .pv-clock { font-size:12px; font-weight:600; color:var(--s400); }

  /* Avatar dropdown */
  .pv-avatar-wrap { position:relative; }
  .pv-avatar-btn {
    display:flex; align-items:center; gap:6px;
    cursor:pointer; border:none; background:transparent;
    font-family:inherit; padding:4px 6px;
    border-radius:var(--rad-md); transition:background var(--t);
  }
  .pv-avatar-btn:hover { background:var(--s100); }
  .pv-avatar {
    width:32px; height:32px; border-radius:50%;
    background:var(--g600); color:#fff;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:700;
  }
  .pv-avatar-arrow { font-size:10px; color:var(--s400); }
  .pv-dropdown {
    position:absolute; top:calc(100% + 6px); right:0;
    background:var(--s0); border:1px solid var(--s200);
    border-radius:var(--rad-lg); min-width:200px;
    z-index:500; animation:pv-dropin 0.18s ease; overflow:hidden;
    box-shadow:0 4px 16px rgba(15,23,42,.08);
  }
  .pv-dropdown-header { padding:12px 16px; border-bottom:1px solid var(--s100); }
  .pv-dropdown-name  { font-size:13px; font-weight:700; color:var(--s900); }
  .pv-dropdown-email { font-size:11px; color:var(--s400); margin-top:2px; }
  .pv-dropdown-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 16px; font-size:13px; color:var(--s700);
    cursor:pointer; border:none; background:transparent;
    width:100%; text-align:left; font-family:inherit;
    transition:background var(--t);
  }
  .pv-dropdown-item:hover { background:var(--s50); }
  .pv-dropdown-item.danger { color:var(--r600); }
  .pv-dropdown-item.danger:hover { background:var(--r50); }
  .pv-dropdown-divider { height:1px; background:var(--s100); }

  /* Waiting bar */
  .pv-waiting-bar {
    background:var(--a50); border-bottom:1px solid var(--a200);
    padding:9px 24px; display:flex; justify-content:space-between; align-items:center;
  }
  .pv-waiting-bar-left  { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--a800); }
  .pv-waiting-bar-right { display:flex; align-items:center; gap:10px; }
  .pv-exit-btn {
    background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-sm);
    padding:5px 12px; font-size:12px; font-weight:600; color:var(--s600);
    cursor:pointer; font-family:inherit; transition:background var(--t),color var(--t),border-color var(--t);
  }
  .pv-exit-btn:hover { background:var(--r50); color:var(--r600); border-color:var(--r200); }
  .pv-toggle {
    width:38px; height:20px; border-radius:var(--rad-full);
    border:none; cursor:pointer; position:relative; flex-shrink:0; transition:background var(--t);
  }
  .pv-toggle::after {
    content:''; position:absolute; width:14px; height:14px;
    border-radius:50%; background:#fff; top:3px; transition:right var(--t);
  }
  .pv-toggle.on  { background:var(--g600); }
  .pv-toggle.on::after  { right:3px; }
  .pv-toggle.off { background:var(--s300); }
  .pv-toggle.off::after { right:17px; }

  /* Content */
  .pv-content { flex:1; max-width:1600px; width:100%; margin:0 auto; padding:24px; display:flex; flex-direction:column; gap:16px; }
  .pv-greeting h1 { font-size:18px; font-weight:700; color:var(--s900); letter-spacing:-0.3px; }
  .pv-greeting p  { font-size:12px; color:var(--s400); margin-top:2px; }

  /* Hero grid — Fix #2: Desktop-first */
  .pv-hero-grid {
    display:grid; grid-template-columns:2fr 1fr;
    gap:16px; align-items:stretch;
  }

  /* Hero card */
  .pv-hero-card {
    border-radius:var(--rad-xl); padding:28px;
    border:1px solid; display:flex; flex-direction:column; gap:0;
  }
  .pv-hero-card.waiting { background:var(--a50);  border-color:var(--a200); }
  .pv-hero-card.ready   { background:var(--g50);  border-color:var(--g200); }
  .pv-hero-section-label {
    font-size:10px; font-weight:700; letter-spacing:1.4px;
    text-transform:uppercase; margin-bottom:6px;
  }
  .pv-hero-section-label.waiting { color:var(--a600); }
  .pv-hero-section-label.ready   { color:var(--g700); }
  .pv-hero-action {
    font-size:26px; font-weight:800; color:var(--s900);
    line-height:1.2; letter-spacing:-0.5px; margin-bottom:20px;
  }
  .pv-hero-divider { border:none; border-top:1px dashed; margin-bottom:16px; }
  .pv-hero-divider.waiting { border-color:var(--a200); }
  .pv-hero-divider.ready   { border-color:var(--g200); }
  .pv-hero-detail-grid {
    display:grid; grid-template-columns:1fr 1fr; gap:10px 20px;
  }
  .pv-hero-detail-item { display:flex; flex-direction:column; gap:2px; }
  .pv-hero-detail-label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--s400); }
  .pv-hero-detail-value { font-size:14px; font-weight:700; color:var(--s900); }

  /* Right column */
  .pv-right-col { display:flex; flex-direction:column; gap:14px; }

  /* Metrics card */
  .pv-metrics-card {
    background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-lg);
    padding:16px; display:flex; flex-direction:column; gap:12px;
  }
  .pv-metric-row { display:flex; justify-content:space-between; align-items:center; }
  .pv-metric-row + .pv-metric-row { border-top:1px solid var(--s100); padding-top:12px; }
  .pv-metric-key   { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--s400); }
  .pv-metric-val   { font-size:22px; font-weight:800; color:var(--s900); letter-spacing:-0.5px; }
  .pv-metric-val.green { color:var(--g600); }
  .pv-metric-val.token { font-size:28px; color:var(--g600); }

  /* Serving now card — Fix #6 */
  .pv-serving-card {
    background:var(--g50); border:1px solid var(--g200); border-radius:var(--rad-lg);
    padding:16px; display:flex; flex-direction:column; gap:12px;
  }
  .pv-serving-label { font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--g700); margin-bottom:6px; }
  .pv-serving-token { font-size:24px; font-weight:800; color:var(--g600); letter-spacing:-0.5px; }
  .pv-serving-doctor { font-size:13px; font-weight:600; color:var(--s900); margin-top:6px; }
  .pv-serving-room { font-size:12px; color:var(--s500); margin-top:2px; }

  /* Appointment card — Fix #4 */
  .pv-appt-card {
    background:var(--b50); border:1px solid var(--b200); border-radius:var(--rad-lg);
    padding:16px; display:flex; flex-direction:column; gap:8px;
  }
  .pv-appt-label { font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--b600); margin-bottom:4px; }
  .pv-appt-date { font-size:15px; font-weight:700; color:var(--s900); }
  .pv-appt-time { font-size:13px; color:var(--s500); margin-top:2px; }
  .pv-appt-doctor { font-size:12px; font-weight:600; color:var(--s700); margin-top:6px; }

  /* Queue table — Fix #3 */
  .pv-queue-table {
    background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-lg);
    padding:16px; margin-top:16px;
  }
  .pv-queue-table-label {
    font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
    color:var(--s400); margin-bottom:12px; display:block;
  }
  .pv-queue-table-head {
    display:grid; grid-template-columns:60px 1fr 100px;
    gap:12px; padding-bottom:8px; border-bottom:1px solid var(--s100);
    font-size:11px; font-weight:700; letter-spacing:1px;
    text-transform:uppercase; color:var(--s400);
  }
  .pv-queue-table-rows { display:flex; flex-direction:column; gap:0; }
  .pv-queue-table-row {
    display:grid; grid-template-columns:60px 1fr 100px;
    gap:12px; padding:10px 0; border-bottom:1px solid var(--s50);
    align-items:center; font-size:13px;
  }
  .pv-queue-table-row:last-child { border-bottom:none; }
  .pv-queue-table-row.active { background:var(--g50); border-radius:var(--rad-sm); padding:10px 8px; border-bottom:none; }
  .pv-queue-token { font-weight:700; color:var(--g600); }
  .pv-queue-name { color:var(--s900); font-weight:500; }
  .pv-queue-pos { font-size:12px; color:var(--s500); }

  /* Progress — Fix #5: stepper */
  .pv-stepper-card { background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-lg); padding:16px 20px; }
  .pv-stepper-label { font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--s400); margin-bottom:20px; }
  .pv-stepper { position:relative; display:flex; align-items:flex-start; justify-content:space-between; }
  .pv-stepper-line-bg   { position:absolute; top:14px; left:14px; right:14px; height:2px; background:var(--s200); z-index:0; }
  .pv-stepper-line-fill { position:absolute; top:14px; left:14px; height:2px; background:var(--g600); z-index:1; transition:width .6s ease; }
  .pv-stepper-step  { display:flex; flex-direction:column; align-items:center; gap:6px; position:relative; z-index:2; flex:1; }
  .pv-stepper-circle {
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; border:2px solid var(--s200);
    background:var(--s0); color:var(--s400); transition:all .25s ease;
  }
  .pv-stepper-circle.done   { background:var(--g600); border-color:var(--g600); color:#fff; }
  .pv-stepper-circle.active { background:var(--g600); border-color:var(--g600); color:#fff; box-shadow:0 0 0 4px var(--g100); }
  .pv-stepper-step-lbl { font-size:10px; color:var(--s400); text-align:center; font-weight:500; line-height:1.3; max-width:52px; }
  .pv-stepper-step-lbl.active { color:var(--g700); font-weight:700; }

  /* Updates — Fix #6: real events */
  .pv-updates-card { background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-lg); padding:16px; }
  .pv-update-row { display:flex; gap:8px; font-size:12px; padding:5px 0; border-bottom:1px solid var(--s50); }
  .pv-update-row:last-child { border-bottom:none; }
  .pv-update-time { font-weight:600; color:var(--s400); flex-shrink:0; min-width:52px; }
  .pv-update-row.hi { background:var(--g50); border-radius:var(--rad-sm); padding:7px 8px; color:var(--g800); border-bottom:none; margin-bottom:4px; }
  .pv-update-row.hi .pv-update-time { color:var(--g700); }

  /* Track token entry */
  .pv-track-card { background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-xl); padding:32px; text-align:center; max-width:420px; margin:0 auto; }
  .pv-track-title { font-size:18px; font-weight:700; color:var(--s900); margin-bottom:6px; }
  .pv-track-sub   { font-size:13px; color:var(--s500); margin-bottom:18px; }
  .pv-track-row   { display:flex; gap:8px; }
  .pv-track-input {
    flex:1; padding:10px 12px; border-radius:var(--rad-md);
    border:1px solid var(--s200); font-size:16px; text-align:center;
    font-weight:600; font-family:inherit; background:var(--s50); color:var(--s900);
    transition:border-color var(--t);
  }
  .pv-track-input:focus { outline:none; border-color:var(--g600); background:var(--s0); }
  .pv-track-btn {
    background:var(--s900); color:#fff; border:none; padding:0 18px;
    border-radius:var(--rad-md); font-weight:700; cursor:pointer;
    font-size:14px; font-family:inherit; transition:background var(--t);
  }
  .pv-track-btn:hover { background:var(--g700); }

  /* Empty state — Fix #5 */
  .pv-empty-wrap { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 16px; }
  .pv-empty-card { background:var(--s0); border:1px solid var(--s200); border-radius:var(--rad-xl); padding:40px; text-align:center; max-width:480px; width:100%; }
  .pv-empty-icon  { font-size:48px; margin-bottom:14px; }
  .pv-empty-title { font-size:18px; font-weight:700; color:var(--s900); margin-bottom:8px; }
  .pv-empty-sub   { font-size:13px; color:var(--s500); margin-bottom:6px; }
  .pv-empty-hint  { font-size:12px; color:var(--s400); }

  /* Bottom bar */
  .pv-bottom-bar { background:var(--s0); border-top:1px solid var(--s200); padding:12px 24px; display:flex; justify-content:space-between; align-items:center; }
  .pv-bottom-left  { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--s400); }
  .pv-bottom-right { font-size:12px; color:var(--s400); }

  .pv-token-invalid { background:var(--r50); border:1px solid var(--r200); border-radius:var(--rad-lg); padding:16px; color:var(--r600); text-align:center; margin-bottom:16px; }

  @media (max-width:900px) {
    .pv-sidebar { display:none; }
    .pv-main    { margin-left:0; }
    .pv-hero-grid { grid-template-columns:1fr; }
    .pv-content   { padding:16px; max-width:100%; }
    .pv-topbar    { padding:0 16px; }
  }
`;

const STEPS = [
  { id: "checkin",  label: "Checked In" },
  { id: "waiting",  label: "Waiting" },
  { id: "next",     label: "You're Next" },
  { id: "called",   label: "Called" },
  { id: "complete", label: "Complete" },
];

const NAV = [
  { id: "queue",       icon: "🏥", label: "My Queue" },
  { id: "appointment", icon: "📅", label: "Appointments" },
  { id: "clinic",      icon: "🏢", label: "Clinic Info" },
  { id: "help",        icon: "❓", label: "Help" },
];

export default function PatientView() {
  // Fix #1: Check token validity on load
  const [searchParams, setSearchParams] = useSearchParams();

  const [queueState, setQueueState]   = useState(null);
  const [myToken, setMyToken]         = useState(() => {
    const urlToken = parseInt(searchParams.get("t"));
    if (!isNaN(urlToken)) return urlToken;
    const saved = localStorage.getItem("myToken");
    return saved ? parseInt(saved) : null;
  });
  const [tokenValid, setTokenValid]   = useState(true);
  const [tokenInput, setTokenInput]   = useState("");
  const [time, setTime]               = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifOn, setNotifOn]         = useState(true);
  const [activeNav, setActiveNav]     = useState("queue");
  const [connStatus, setConnStatus]   = useState("live");
  const [queueEvents, setQueueEvents] = useState([]);
  const [allQueuePatients, setAllQueuePatients] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const prevTokenRef = useRef(null);
  const dropdownRef = useRef(null);

  // Inject CSS once
  useEffect(() => {
    const id = "pv-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }
  }, []);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fix #1: Validate token on load/change
  useEffect(() => {
    if (!myToken) {
      setTokenValid(true);
      return;
    }

    const checkToken = async () => {
      try {
        const response = await fetch(`/check-token/${myToken}`);
        if (!response.ok) {
          setTokenValid(false);
          localStorage.removeItem("myToken");
          setMyToken(null);
        } else {
          setTokenValid(true);
        }
      } catch (err) {
        console.error("Error checking token:", err);
      }
    };

    checkToken();
  }, [myToken]);

  // Connection status
  useEffect(() => {
    const onConnect    = () => setConnStatus("live");
    const onDisconnect = () => setConnStatus("offline");
    const onReconnectAttempt = () => setConnStatus("recon");

    socket.on("connect",           onConnect);
    socket.on("disconnect",        onDisconnect);
    socket.on("reconnect_attempt", onReconnectAttempt);
    socket.on("reconnect",         onConnect);

    return () => {
      socket.off("connect",           onConnect);
      socket.off("disconnect",        onDisconnect);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off("reconnect",         onConnect);
    };
  }, []);

  // Queue updates + Fix #3: Get all queue patients
  useEffect(() => {
    const handle = (state) => {
      setQueueState((prev) => {
        const now = new Date();
        const fmtT = (d) =>
          d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        if (prev && myToken !== null) {
          const prevPos = prev.waiting?.find((p) => p.token === myToken)?.position;
          const newPos  = state.waiting?.find((p) => p.token === myToken)?.position;

          if (prevPos !== undefined && newPos !== undefined && newPos < prevPos) {
            setQueueEvents((ev) => [
              { time: fmtT(now), msg: `You moved up to position ${newPos}`, hi: false },
              ...ev.slice(0, 9),
            ]);
          }

          if (prev.currentToken !== state.currentToken && state.currentToken > 0) {
            const isMe = state.currentToken === myToken;
            setQueueEvents((ev) => [
              {
                time: fmtT(now),
                msg: isMe
                  ? "Your turn has started — enter the room"
                  : `Token T${state.currentToken} is now being seen`,
                hi: isMe,
              },
              ...ev.slice(0, 9),
            ]);

            // Fix #7: Play sound when called
            if (isMe && notifOn) {
              playSound("call");
            }
          }

          if (state.nextPatient?.token === myToken && prev.nextPatient?.token !== myToken) {
            setQueueEvents((ev) => [
              { time: fmtT(now), msg: "You are next in line", hi: true },
              ...ev.slice(0, 9),
            ]);

            // Fix #7: Play ding sound
            if (notifOn) {
              playSound("ding");
            }
          }
        }

        // Fix #3: Store all queue patients for table display
        setAllQueuePatients(state.waiting || []);

        return state;
      });

      if (myToken !== null) {
        const exists =
          state.currentToken === myToken ||
          state.waiting?.some((p) => p.token === myToken);
        if (!exists) {
          localStorage.removeItem("myToken");
          setMyToken(null);
        }
      }
    };

    socket.on("queue_update", handle);
    return () => socket.off("queue_update", handle);
  }, [myToken, notifOn]);

  // Fix #4: Fetch next appointment
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch("/appointments/upcoming");
        const appointments = await response.json();
        if (appointments.length > 0) {
          setNextAppointment(appointments[0]);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchAppointment();
    const interval = setInterval(fetchAppointment, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fix #7: Play notification sounds
  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === "ding") {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === "call") {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const handleTrack = () => {
    const t = parseInt(tokenInput);
    if (!isNaN(t)) {
      setMyToken(t);
      localStorage.setItem("myToken", t);
      setSearchParams({ t });
      setTokenInput("");
      setTokenValid(true);
    }
  };

  const handleReset = () => {
    setMyToken(null);
    localStorage.removeItem("myToken");
    setSearchParams({});
    setQueueEvents([]);
    setTokenValid(true);
  };

  const handleLogout = () => {
    handleReset();
    setShowDropdown(false);
  };

  const waitingList      = queueState?.waiting ?? [];
  const isQueueStarted   = queueState?.isQueueStarted ?? false;
  const nextPatientToken = queueState?.nextPatient?.token ?? null;
  const myInfo           = waitingList.find((p) => p.token === myToken);
  const tokenExists      =
    myToken !== null &&
    tokenValid &&
    (queueState?.currentToken === myToken ||
      waitingList.some((p) => p.token === myToken));
  const isBeingServed    = queueState?.currentToken === myToken && myToken !== null;
  const amINextUp        = nextPatientToken === myToken && myToken !== null;
  const peopleAhead      = myInfo ? myInfo.position - 1 : null;
  const estWait          = myInfo ? myInfo.estimatedWait : null;

  const fmtTime = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const heroState = isBeingServed || amINextUp || peopleAhead === 0 ? "ready" : "waiting";

  const heroSectionLabel = isBeingServed
    ? "NEXT ACTION"
    : amINextUp || peopleAhead === 0
    ? "NEXT ACTION"
    : !isQueueStarted
    ? "STATUS"
    : "NEXT ACTION";

  const heroAction = isBeingServed
    ? `Proceed to the doctor's room`
    : amINextUp || peopleAhead === 0
    ? `Stand outside the consultation room`
    : !isQueueStarted
    ? "Remain seated — clinic starting soon"
    : "Remain seated in the waiting area";

  const locationLabel = isBeingServed || amINextUp || peopleAhead === 0
    ? CONSULTATION_ROOM
    : "Room assigned when your turn arrives";

  const estCallLabel = isBeingServed
    ? "Now"
    : amINextUp || peopleAhead === 0
    ? "< 5 min"
    : estWait != null
    ? `${estWait} min`
    : "—";

  const activeStep = isBeingServed
    ? 3
    : amINextUp || peopleAhead === 0
    ? 2
    : myInfo
    ? 1
    : tokenExists
    ? 0
    : 0;

  const stepFillPct =
    activeStep === 0 ? 0
    : activeStep === 1 ? 25
    : activeStep === 2 ? 50
    : activeStep === 3 ? 75
    : 100;

  const isQueueEmpty =
    !myToken &&
    queueState &&
    queueState.patientsWaiting === 0 &&
    queueState.currentToken === 0;

  const connLabel = { live: "Live", offline: "Offline", recon: "Reconnecting…" };

  return (
    <div className="pv-root">
      <div className="pv-layout">

        {/* Sidebar */}
        <aside className="pv-sidebar">
          <div className="pv-sidebar-logo">
            <div className="pv-logomark">H</div>
            <span className="pv-sidebar-name">{CLINIC_NAME}</span>
          </div>

          <nav className="pv-sidebar-nav">
            {NAV.map((n) => (
              <button
                key={n.id}
                className={`pv-nav-item${activeNav === n.id ? " active" : ""}`}
                onClick={() => setActiveNav(n.id)}
              >
                <span className="pv-nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="pv-sidebar-live">
            <div>
              <span className="pv-live-dot" />
              <span className="pv-sidebar-live-text">Live updates on</span>
            </div>
            <div className="pv-sidebar-live-sub">
              {queueState
                ? `${queueState.patientsWaiting ?? 0} patients waiting`
                : "Connecting…"}
            </div>
          </div>

          <button className="pv-logout-btn" onClick={handleLogout}>
            🚪 Exit portal
          </button>
        </aside>

        {/* Main */}
        <div className="pv-main">

          {/* Topbar */}
          <header className="pv-topbar">
            <span className="pv-topbar-title">Patient Portal</span>
            <div className="pv-topbar-right">
              <div className={`pv-conn-pill ${connStatus}`}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: connStatus === "live" ? "var(--g600)" : connStatus === "offline" ? "var(--r600)" : "var(--y600)",
                  display: "inline-block",
                  animation: connStatus === "live" ? "pv-pulse 1.5s infinite" : "none"
                }} />
                {connLabel[connStatus]}
              </div>

              <span className="pv-clock">{fmtTime(time)}</span>

              <div className="pv-avatar-wrap" ref={dropdownRef}>
                <button
                  className="pv-avatar-btn"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <div className="pv-avatar">P</div>
                  <span className="pv-avatar-arrow">▾</span>
                </button>
                {showDropdown && (
                  <div className="pv-dropdown">
                    <div className="pv-dropdown-header">
                      <div className="pv-dropdown-name">Patient</div>
                      <div className="pv-dropdown-email">patient@clinic.com</div>
                    </div>
                    <button className="pv-dropdown-item">⚙️ Settings</button>
                    <button className="pv-dropdown-item">🔔 Notifications</button>
                    <div className="pv-dropdown-divider" />
                    <button className="pv-dropdown-item danger" onClick={handleLogout}>
                      🚪 Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Waiting bar */}
          {myToken && tokenExists && (
            <div className="pv-waiting-bar">
              <div className="pv-waiting-bar-left">
                ⏳ Queue token:{" "}
                <strong style={{ color: "var(--a700)" }}>T{myToken}</strong>
              </div>
              <div className="pv-waiting-bar-right">
                <span style={{ fontSize: 12, color: "var(--a700)", fontWeight: 600 }}>
                  Notifications
                </span>
                <button
                  className={`pv-toggle ${notifOn ? "on" : "off"}`}
                  onClick={() => setNotifOn((v) => !v)}
                  aria-label="Toggle notifications"
                />
                <button className="pv-exit-btn" onClick={handleReset}>
                  Leave queue
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <main className="pv-content">

            <div className="pv-greeting">
              <h1>
                {isBeingServed
                  ? "It's your turn!"
                  : myToken && tokenExists
                  ? `Tracking token T${myToken}`
                  : "Patient Portal"}
              </h1>
              <p>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>

            {/* Fix #1: Token invalid message */}
            {myToken && !tokenValid && (
              <div className="pv-token-invalid">
                ❌ Token T{myToken} is no longer active. Please enter a new token.
              </div>
            )}

            {/* Empty state — Fix #5 */}
            {isQueueEmpty && (
              <div className="pv-empty-wrap">
                <div className="pv-empty-card">
                  <div className="pv-empty-icon">🏥</div>
                  <div className="pv-empty-title">Welcome to {CLINIC_NAME}</div>
                  <p className="pv-empty-sub">
                    No active queue currently.
                  </p>
                  <p className="pv-empty-hint">
                    Visit reception to collect your token and start tracking.
                  </p>
                </div>
              </div>
            )}

            {/* Track entry */}
            {!isQueueEmpty && (!myToken || !tokenExists) && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="pv-track-card">
                  <div className="pv-track-title">Welcome to {CLINIC_NAME}</div>
                  <div className="pv-track-sub">
                    Enter your token number below, or ask reception for a direct tracking link.
                  </div>
                  <div className="pv-track-row">
                    <input
                      className="pv-track-input"
                      placeholder="e.g. 13"
                      type="number"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    />
                    <button className="pv-track-btn" onClick={handleTrack}>
                      Track
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active queue view */}
            {myToken && tokenExists && (
              <>
                <div className="pv-hero-grid">

                  {/* Hero card */}
                  <div className={`pv-hero-card ${heroState}`}>
                    <div className={`pv-hero-section-label ${heroState}`}>{heroSectionLabel}</div>
                    <div className="pv-hero-action">{heroAction}</div>
                    <hr className={`pv-hero-divider ${heroState}`} />
                    <div className="pv-hero-detail-grid">
                      <div className="pv-hero-detail-item">
                        <span className="pv-hero-detail-label">Your Token</span>
                        <span className="pv-hero-detail-value">T{myToken}</span>
                      </div>
                      <div className="pv-hero-detail-item">
                        <span className="pv-hero-detail-label">Estimated Call</span>
                        <span className="pv-hero-detail-value">{estCallLabel}</span>
                      </div>
                      <div className="pv-hero-detail-item" style={{ gridColumn: "1 / -1" }}>
                        <span className="pv-hero-detail-label">Location</span>
                        <span className="pv-hero-detail-value">{locationLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="pv-right-col">

                    {/* Metrics card */}
                    <div className="pv-metrics-card">
                      <div className="pv-metric-row">
                        <span className="pv-metric-key">Your Token</span>
                        <span className="pv-metric-val token">T{myToken}</span>
                      </div>
                      <div className="pv-metric-row">
                        <span className="pv-metric-key">Patients Ahead</span>
                        <span className={`pv-metric-val${isBeingServed ? " green" : ""}`}>
                          {isBeingServed ? "0" : peopleAhead ?? "—"}
                        </span>
                      </div>
                      <div className="pv-metric-row">
                        <span className="pv-metric-key">Estimated Wait</span>
                        <span className={`pv-metric-val${isBeingServed ? " green" : ""}`}>
                          {isBeingServed ? "Now" : estWait != null ? `${estWait} min` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Fix #6: Now Serving card */}
                    {queueState?.currentToken > 0 && (
                      <div className="pv-serving-card">
                        <span className="pv-serving-label">Now Serving</span>
                        <div className="pv-serving-token">T{queueState.currentToken}</div>
                        <div className="pv-serving-doctor">{CURRENT_DOCTOR}</div>
                        <div className="pv-serving-room">{CONSULTATION_ROOM}</div>
                      </div>
                    )}

                    {/* Fix #4: Next Appointment card */}
                    {nextAppointment && (
                      <div className="pv-appt-card">
                        <span className="pv-appt-label">Next Appointment</span>
                        <div className="pv-appt-date">
                          {new Date(nextAppointment.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="pv-appt-time">{nextAppointment.time} AM</div>
                        <div className="pv-appt-doctor">{CURRENT_DOCTOR}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fix #3: Queue table */}
                <div className="pv-queue-table">
                  <label className="pv-queue-table-label">Current Queue</label>
                  <div className="pv-queue-table-head">
                    <div>Token</div>
                    <div>Name</div>
                    <div>Position</div>
                  </div>
                  <div className="pv-queue-table-rows">
                    {allQueuePatients.length > 0 ? (
                      allQueuePatients.map((patient) => (
                        <div
                          key={patient.token}
                          className={`pv-queue-table-row${patient.token === myToken ? " active" : ""}`}
                        >
                          <div className="pv-queue-token">T{patient.token}</div>
                          <div className="pv-queue-name">
                            {patient.name}
                            {patient.token === myToken && " (You)"}
                          </div>
                          <div className="pv-queue-pos">#{patient.position}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "12px", color: "var(--s400)", textAlign: "center" }}>
                        No patients in queue
                      </div>
                    )}
                  </div>
                </div>

                {/* Stepper */}
                <div className="pv-stepper-card">
                  <div className="pv-stepper-label">Queue Progress</div>
                  <div className="pv-stepper">
                    <div className="pv-stepper-line-bg" />
                    <div
                      className="pv-stepper-line-fill"
                      style={{ width: `${stepFillPct}%` }}
                    />
                    {STEPS.map((s, i) => {
                      const done   = i < activeStep;
                      const active = i === activeStep;
                      return (
                        <div key={s.id} className="pv-stepper-step">
                          <div className={`pv-stepper-circle${done ? " done" : active ? " active" : ""}`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <span className={`pv-stepper-step-lbl${active ? " active" : ""}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Updates */}
                <div className="pv-updates-card">
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--s400)", marginBottom: 12 }}>
                    Live Updates
                  </div>
                  {queueEvents.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--s400)", textAlign: "center", padding: "8px 0" }}>
                      Updates will appear here as the queue moves.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {queueEvents.map((ev, i) => (
                        <div key={i} className={`pv-update-row${ev.hi ? " hi" : ""}`}>
                          <span className="pv-update-time">{ev.time}</span>
                          <span>{ev.msg}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    border: "1px solid var(--s200)", background: "var(--s0)",
                    color: "var(--a600)", fontSize: 13, cursor: "pointer",
                    padding: "8px 16px", borderRadius: "var(--rad-md)",
                    fontWeight: 600, fontFamily: "inherit",
                    transition: "background var(--t)",
                  }}
                >
                  Change token
                </button>
              </>
            )}
          </main>

          <footer className="pv-bottom-bar">
            <div className="pv-bottom-left">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: connStatus === "live" ? "var(--g600)" : connStatus === "offline" ? "var(--r600)" : "var(--y600)", display: "inline-block", animation: connStatus === "live" ? "pv-pulse 1.5s infinite" : "none" }} />
              {connStatus === "live" ? "All systems live" : connStatus === "offline" ? "Connection lost" : "Reconnecting…"}
            </div>
            <div className="pv-bottom-right">{CLINIC_NAME} · Queue System</div>
          </footer>
        </div>
      </div>
    </div>
  );
}