const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const attendanceSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    date: { type: Date },
});

attendanceSchema.plugin(timestamps);
module.exports = mongoose.model("Attendance", attendanceSchema);