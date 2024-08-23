const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const notificationSchema = mongoose.Schema({
    photo: { type: String },
    fullName: { type: String },
    mobile: { type: String },
    address: { type: String },
    profession: { type: String },
    bodyWeight: { type: String },
    fitnessGoal: {
        type: [String],
        enum: ['WeightLoss', 'WeightGain', 'FatLoss']
    },
    package: {
        type: [String],
        enum: ['1Month', '3Month', '6Month', '12Month']
    },
    dueDate: { type: String },
    
});

notificationSchema.plugin(timestamps);
module.exports = mongoose.model("Notification", notificationSchema);