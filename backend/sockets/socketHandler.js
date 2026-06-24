const {
  addPatient,
  callNext,
  getQueueState,
  resetQueue,
  setAvgTime,
  markNoShow,
} = require("../services/queueService");

const {
  requestAppointment,
  approveAppointment,
  rejectAppointment,
  rescheduleAppointment,
  cancelAppointment,
  markAppointmentArrived,
} = require("../services/appointmentService");

module.exports = function initSocket(io) {
  io.on("connection", async (socket) => {
    console.log("🟢 Screen connected:", socket.id);

    socket.emit("queue_update", await getQueueState());

    socket.on("add_patient", async ({ name, mobile }) => {
      if (!name || name.trim() === "") return;
      await addPatient(name.trim(), mobile || "");
      io.emit("queue_update", await getQueueState());
    });

    socket.on("call_next", async () => {
      await callNext();
      io.emit("queue_update", await getQueueState());
    });

    socket.on("mark_no_show", async () => {
      const removed = await markNoShow();
      if (!removed) return;
      io.emit("queue_update", await getQueueState());
    });

    socket.on("reset_queue", async () => {
      await resetQueue();
      io.emit("queue_update", await getQueueState());
    });

    socket.on("set_avg_time", async (mins) => {
      await setAvgTime(mins);
      io.emit("queue_update", await getQueueState());
    });

    socket.on("book_appointment", async (data) => {
      if (!data.patientName || !data.date || !data.time) return;
      const appt = await requestAppointment(data);
      await approveAppointment(appt._id);
      io.emit("queue_update", await getQueueState());
      socket.emit("appointment_booked", appt);
    });

    socket.on("approve_appointment", async (id) => {
      const appt = await approveAppointment(id);
      if (!appt) return;
      io.emit("queue_update", await getQueueState());
      io.emit("appointment_approved", appt);
    });

    socket.on("reject_appointment", async (id) => {
      const appt = await rejectAppointment(id);
      if (!appt) return;
      io.emit("queue_update", await getQueueState());
      io.emit("appointment_rejected", appt);
    });

    socket.on("reschedule_appointment", async ({ id, date, time, reason }) => {
      const appt = await rescheduleAppointment(id, { date, time, reason });
      if (!appt) return;
      io.emit("queue_update", await getQueueState());
      io.emit("appointment_rescheduled", appt);
    });

    socket.on("cancel_appointment", async (id) => {
      await cancelAppointment(id);
      io.emit("queue_update", await getQueueState());
    });

    socket.on("appointment_arrived", async (id) => {
      const result = await markAppointmentArrived(id);
      if (!result) return;
      io.emit("queue_update", await getQueueState());
      io.emit("appointment_arrived", result);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Screen disconnected:", socket.id);
    });
  });
};