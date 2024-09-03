const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const notificationSchema = mongoose.Schema({
  message: { type: String },
  type: { type: [String], enum: ["member", "enquiry"]},
  isRead: { type: Boolean },
  releventId: { type: String },
});

notificationSchema.plugin(timestamps);
module.exports = mongoose.model("Notification", notificationSchema);
