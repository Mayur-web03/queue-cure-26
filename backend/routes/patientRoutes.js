const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const QueuePatient = require("../models/QueuePatient");

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/queue", async (req, res) => {
  try {
    const queuePatients = await QueuePatient.find({
      status: { $in: ["waiting", "called"] },
    }).sort({ token: 1 });
    res.json(queuePatients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const history = await QueuePatient.find({
      status: { $in: ["served", "no-show"] },
    }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:token", async (req, res) => {
  try {
    const patient = await Patient.findOne({
      token: parseInt(req.params.token),
    });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;