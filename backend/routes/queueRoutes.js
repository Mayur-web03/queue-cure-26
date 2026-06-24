const express = require("express");
const router = express.Router();
const {
  getQueueState,
  resetQueue,
  setAvgTime,
  getPatientTokenStatus,
} = require("../services/queueService");

router.get("/state", async (req, res) => {
  try {
    const state = await getQueueState();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/check-token/:token", async (req, res) => {
  try {
    const data = await getPatientTokenStatus(parseInt(req.params.token));
    if (!data) return res.status(404).json({ error: "Token not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const state = await resetQueue();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/avg-time", async (req, res) => {
  try {
    const { mins } = req.body;
    const state = await setAvgTime(mins);
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;