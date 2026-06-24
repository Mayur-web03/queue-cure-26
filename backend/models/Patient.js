const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    token: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
 "waiting",
 "called",
 "served",
 "no-show"
],
      default: "waiting",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);