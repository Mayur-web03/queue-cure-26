const express = require("express");
const router = express.Router();
const {
  getTodaysAnalytics,
  getWeeklyStats,
} = require("../services/analyticsService");

router.get("/today", async (req, res) => {
  try {
    const analytics = await getTodaysAnalytics();
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/weekly", async (req, res) => {
  try {
    const stats = await getWeeklyStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;