const mongoose = require("mongoose");

const queueSettingsSchema =
  new mongoose.Schema({
    avgConsultTime: {
      type: Number,
      default: 10,
    },
  });

module.exports = mongoose.model(
  "QueueSettings",
  queueSettingsSchema
);