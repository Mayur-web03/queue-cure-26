const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const {
  requestAppointment,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  cancelAppointment,
  markAppointmentArrived,
} = require("../services/appointmentService");

router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/pending", async (req, res) => {
  try {
    const pending = await Appointment.find({ status: "pending" });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const appointments = await Appointment.find({ date: today }).sort({ time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      status: { $in: ["approved", "arrived"] },
    }).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/request", async (req, res) => {
  try {
    const appt = await requestAppointment(req.body);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/approve", async (req, res) => {
  try {
    const appt = await approveAppointment(req.params.id);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/reject", async (req, res) => {
  try {
    const appt = await rejectAppointment(req.params.id);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/reschedule", async (req, res) => {
  try {
    const appt = await rescheduleAppointment(req.params.id, req.body);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const appt = await cancelAppointment(req.params.id);
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/arrived", async (req, res) => {
  try {
    const result = await markAppointmentArrived(req.params.id);
    if (!result) return res.status(400).json({ error: "Already arrived or not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;