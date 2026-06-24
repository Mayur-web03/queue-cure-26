const mongoose = require("mongoose");

const QueuePatientSchema = new mongoose.Schema(
  {
    token: { type: Number, unique: true, required: true, index: true },
    name: { type: String, required: true },
    mobile: { type: String, default: "" },
    status: {
      type: String,
      enum: ["waiting", "called", "served", "no-show"],
      default: "waiting",
    },
    joinedAt: { type: Date, default: Date.now },
    calledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    waitDuration: { type: Number, default: null }, // in minutes
    consultationDuration: { type: Number, default: null }, // in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("QueuePatient", QueuePatientSchema);