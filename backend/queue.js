// queue.js

const Appointment = require("./models/Appointment");
const Patient = require("./models/Patient");
const QueuePatient = require("./models/QueuePatient");

// 1. Core State Variables
let queue = [];
let currentToken = 0;
let nextTokenNumber = 1;

let manualAvgTime = null;
let completedTokens = [];
let currentTokenStartTime = null;

const DEFAULT_AVG_TIME = 10;

// 2. Core Helper Logic
function getWaitingPatients() {
  return queue.filter((p) => p.token > currentToken);
}

function getSmartAvgTime() {
  if (manualAvgTime !== null) return manualAvgTime;
  if (completedTokens.length === 0) return DEFAULT_AVG_TIME;

  const sum = completedTokens.reduce((acc, t) => acc + t.duration, 0);
  return Math.max(1, Math.round(sum / completedTokens.length));
}

async function getUpcomingAppointments() {
  return await Appointment.find({
    status: { $in: ["approved", "arrived"] },
  }).sort({ date: 1, time: 1 });
}

async function getPendingAppointments() {
  return await Appointment.find({ status: "pending" });
}

async function getAllAppointments() {
  return await Appointment.find().sort({ createdAt: -1 });
}

async function getTodaysAppointments() {
  const today = new Date().toISOString().split("T")[0];
  return await Appointment.find({ date: today }).sort({ time: 1 });
}

// New: Initialize queue from MongoDB on startup
async function initializeQueue() {
  try {
    const patients = await QueuePatient.find({
      status: { $in: ["waiting", "called"] },
    }).sort({ token: -1 });

    if (patients.length > 0) {
      nextTokenNumber = patients[0].token + 1;
      queue = patients.map((p) => ({
        token: p.token,
        name: p.name,
        mobile: p.mobile,
        joinedAt: p.joinedAt.toISOString(),
      }));
    }

    const lastCompleted = await QueuePatient.findOne({
      status: "served",
    }).sort({ token: -1 });

    if (lastCompleted) {
      currentToken = lastCompleted.token;
    }

    console.log(`Queue initialized. Current token: ${currentToken}, Next: ${nextTokenNumber}`);
  } catch (err) {
    console.error("Error initializing queue:", err);
  }
}

// 3. Main State Output Engine
async function getQueueState() {
  const avgTime = getSmartAvgTime();
  const waiting = getWaitingPatients();
  const nextPatient = waiting[0] || null;

  return {
    currentToken,
    nextPatient: nextPatient
      ? { token: nextPatient.token, name: nextPatient.name }
      : null,
    isQueueStarted: currentToken > 0,
    avgTime,
    avgSource:
      manualAvgTime !== null
        ? "manual"
        : completedTokens.length > 0
        ? `smart (last ${completedTokens.length} consultations)`
        : "default",
    patientsWaiting: waiting.length,
    totalWaitingTime: waiting.length * avgTime,

    waiting: waiting.map((p, index) => {
      const waitingMinutes = Math.floor(
        (Date.now() - new Date(p.joinedAt).getTime()) / 1000 / 60
      );
      return {
        token: p.token,
        name: p.name,
        mobile: p.mobile,
        position: index + 1,
        estimatedWait: currentToken === 0 ? null : (index + 1) * avgTime,
        waitingMinutes,
        isDelayed: waitingMinutes > 45,
        joinedAt: p.joinedAt,
      };
    }),

    appointments: await getUpcomingAppointments(),
    pendingAppointments: await getPendingAppointments(),
  };
}

// 4. Queue Actions
async function addPatient(name, mobile) {
  const token = nextTokenNumber++;

  const queuePatient = await QueuePatient.create({
    token,
    name,
    mobile: mobile || "",
    status: "waiting",
  });

  const patient = await Patient.create({
    token,
    name,
    mobile: mobile || "",
    status: "waiting",
  });

  queue.push({
    token: queuePatient.token,
    name: queuePatient.name,
    mobile: queuePatient.mobile,
    joinedAt: queuePatient.joinedAt.toISOString(),
  });

  return queuePatient;
}

async function callNext() {
  const waiting = getWaitingPatients();

  if (currentToken > 0 && currentTokenStartTime) {
    const duration = Math.round(
      (Date.now() - currentTokenStartTime) / 1000 / 60
    );
    completedTokens.push({ token: currentToken, duration: Math.max(1, duration) });
    const waitDuration = Math.round(
  (Date.now() -
    new Date(waiting[0].joinedAt).getTime()) /
    60000
  );

    // Update QueuePatient with consultation duration
    await QueuePatient.findOneAndUpdate(
  { token: currentToken },
  {
    status: "called",
    calledAt: new Date(),
    waitDuration,
  }
  );
  }

  if (waiting.length > 0) {
    currentToken = waiting[0].token;
    currentTokenStartTime = Date.now();

    // Update QueuePatient with called status
    await QueuePatient.findOneAndUpdate(
      { token: currentToken },
      {
        status: "called",
        calledAt: new Date(),
      }
    );
  }

  return await getQueueState();
}

async function setAvgTime(mins) {
  manualAvgTime = mins === null || mins === "" ? null : parseInt(mins);
  return await getQueueState();
}

async function resetQueue() {
  queue = [];
  currentToken = 0;
  nextTokenNumber = 1;
  manualAvgTime = null;
  completedTokens = [];
  currentTokenStartTime = null;

  // Also reset MongoDB queue
  await QueuePatient.deleteMany({});

  return await getQueueState();
}

// 5. Appointment Actions
async function requestAppointment(data) {
  const appt = await Appointment.create({
    patientName: data.patientName,
    mobile: data.mobile || "",
    date: data.date,
    time: data.time,
    reason: data.reason || "General Consultation",
    status: "pending",
  });
  return appt;
}

async function approveAppointment(id) {
  return await Appointment.findByIdAndUpdate(
    id,
    { status: "approved" },
    { new: true }
  );
}

async function rejectAppointment(id) {
  return await Appointment.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true }
  );
}

async function rescheduleAppointment(id, newSlot) {
  return await Appointment.findByIdAndUpdate(
    id,
    { date: newSlot.date, time: newSlot.time, reason: newSlot.reason },
    { new: true }
  );
}

async function cancelAppointment(id) {
  return await Appointment.findByIdAndUpdate(
    id,
    { status: "canceled" },
    { new: true }
  );
}

async function markAppointmentArrived(id) {
  const appt = await Appointment.findById(id);

  if (!appt) return null;
  if (appt.status === "arrived") return null;

  appt.status = "arrived";
  await appt.save();

  const patient = await addPatient(appt.patientName, appt.mobile);

  return { appointment: appt, patient };
}

async function markNoShow() {
  const next = queue.find((p) => p.token > currentToken);
  if (!next) return null;
  queue = queue.filter((p) => p.token !== next.token);

  // Mark as no-show in MongoDB
  await QueuePatient.findOneAndUpdate(
  { token: next.token },
  { status: "no-show" }
);
}

// 6. Analytics
async function getTodaysAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const patients = await QueuePatient.find({
    createdAt: { $gte: today, $lt: tomorrow },
  });

  const served = patients.filter((p) => p.status === "served");
  const noShows = patients.filter((p) => p.status === "no-show");

  const avgWaitTime =
    served.length > 0
      ? Math.round(
          served.reduce((sum, p) => sum + (p.waitDuration || 0), 0) /
            served.length
        )
      : 0;

  const avgConsultation =
    served.length > 0
      ? Math.round(
          served.reduce((sum, p) => sum + (p.consultationDuration || 0), 0) /
            served.length
        )
      : 0;

  return {
    totalPatients: patients.length,
    servedCount: served.length,
    noShowCount: noShows.length,
    waitingCount: patients.filter((p) => p.status === "waiting").length,
    calledCount: patients.filter((p) => p.status === "called").length,
    avgWaitTime,
    avgConsultation,
  };
}

async function getPatientTokenStatus(token) {
  const patient = await QueuePatient.findOne({ token });
  if (!patient) return null;
  return {
    token: patient.token,
    name: patient.name,
    status: patient.status,
    joinedAt: patient.joinedAt,
  };
}

module.exports = {
  addPatient,
  callNext,
  getQueueState,
  setAvgTime,
  resetQueue,
  initializeQueue,

  requestAppointment,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  cancelAppointment,

  getUpcomingAppointments,
  getAllAppointments,
  getPendingAppointments,
  getTodaysAppointments,

  markAppointmentArrived,
  markNoShow,

  getTodaysAnalytics,
  getPatientTokenStatus,
};