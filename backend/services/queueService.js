const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const QueuePatient = require("../models/QueuePatient");
const { getUpcomingAppointments, getPendingAppointments } = require("./appointmentService");

let queue = [];
let currentToken = 0;
let nextTokenNumber = 1;
let manualAvgTime = null;
let completedTokens = [];
let currentTokenStartTime = null;

const DEFAULT_AVG_TIME = 10;

function getWaitingPatients() {
  return queue.filter((p) => p.token > currentToken);
}

function getSmartAvgTime() {
  if (manualAvgTime !== null) return manualAvgTime;
  if (completedTokens.length === 0) return DEFAULT_AVG_TIME;
  const sum = completedTokens.reduce((acc, t) => acc + t.duration, 0);
  return Math.max(1, Math.round(sum / completedTokens.length));
}

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

async function addPatient(name, mobile) {
  const token = nextTokenNumber++;

  const queuePatient = await QueuePatient.create({
    token,
    name,
    mobile: mobile || "",
    status: "waiting",
  });

  await Patient.create({
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

    const waitDuration = waiting[0]
      ? Math.round(
          (Date.now() - new Date(waiting[0].joinedAt).getTime()) / 60000
        )
      : 0;

    await QueuePatient.findOneAndUpdate(
      { token: currentToken },
      { status: "served", completedAt: new Date(), waitDuration }
    );
  }

  if (waiting.length > 0) {
    currentToken = waiting[0].token;
    currentTokenStartTime = Date.now();

    await QueuePatient.findOneAndUpdate(
      { token: currentToken },
      { status: "called", calledAt: new Date() }
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
  await QueuePatient.deleteMany({});
  return await getQueueState();
}

async function markNoShow() {
  const next = queue.find((p) => p.token > currentToken);
  if (!next) return null;
  queue = queue.filter((p) => p.token !== next.token);
  await QueuePatient.findOneAndUpdate(
    { token: next.token },
    { status: "no-show" }
  );
  return next;
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
  initializeQueue,
  getQueueState,
  addPatient,
  callNext,
  setAvgTime,
  resetQueue,
  markNoShow,
  getPatientTokenStatus,
  getUpcomingAppointments,
  getPendingAppointments,
};