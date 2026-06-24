const QueuePatient = require("../models/QueuePatient");

const DEFAULT_AVG_TIME = 10;

async function getSmartAvgTime() {
  try {
    const recentServed = await QueuePatient.find({
      status: "served",
      consultationDuration: { $ne: null },
    })
      .sort({ completedAt: -1 })
      .limit(10);

    if (recentServed.length === 0) return DEFAULT_AVG_TIME;

    const sum = recentServed.reduce(
      (acc, p) => acc + (p.consultationDuration || 0),
      0
    );

    return Math.max(1, Math.round(sum / recentServed.length));
  } catch (err) {
    console.error("Error calculating smart avg time:", err);
    return DEFAULT_AVG_TIME;
  }
}

async function estimateWaitTime(position, avgTime) {
  return position * avgTime;
}

module.exports = {
  getSmartAvgTime,
  estimateWaitTime,
  DEFAULT_AVG_TIME,
};