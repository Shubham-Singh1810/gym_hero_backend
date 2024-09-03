const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const notificationSchema = mongoose.Schema({
  message: { type: String },
  type: { type: [String], enum: ["newMember", "paymentRemainder", "pendingPayment", "enquiryFollowUp"]},
  isRead: { type: Boolean ,  default: false},
  releventId: { type: String },
});

notificationSchema.plugin(timestamps);
module.exports = mongoose.model("Notification", notificationSchema);
