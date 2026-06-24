const QueuePatient = require("../models/QueuePatient");
const Appointment = require("../models/Appointment");

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

async function getWeeklyStats() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const count = await QueuePatient.countDocuments({
      createdAt: { $gte: start, $lt: end },
      status: "served",
    });

    days.push({
      date: start.toISOString().split("T")[0],
      served: count,
    });
  }
  return days;
}

module.exports = {
  getTodaysAnalytics,
  getWeeklyStats,
};