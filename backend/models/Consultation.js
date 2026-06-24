const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    token: Number,

    patientName: String,

    startedAt: Date,

    endedAt: Date,

    duration: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Consultation",
  consultationSchema
);