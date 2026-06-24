const Appointment = require("../models/Appointment");
const QueuePatient = require("../models/QueuePatient");
const Patient = require("../models/Patient");

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
    {
      date: newSlot.date,
      time: newSlot.time,
      reason: newSlot.reason,
    },
    { new: true }
  );
}

async function cancelAppointment(id) {
  return await Appointment.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true }
  );
}

async function markAppointmentArrived(id) {
  const appt = await Appointment.findById(id);
  if (!appt) return null;
  if (appt.status === "arrived") return null;

  appt.status = "arrived";
  await appt.save();

  // Direct DB insert to avoid circular dependency
  const { default: queueService } = await import("./queueService.js");
  const patient = await queueService.addPatient(appt.patientName, appt.mobile);
  return { appointment: appt, patient };
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

module.exports = {
  requestAppointment,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  cancelAppointment,
  markAppointmentArrived,
  getUpcomingAppointments,
  getPendingAppointments,
  getAllAppointments,
  getTodaysAppointments,
};