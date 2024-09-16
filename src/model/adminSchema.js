const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const adminSchema = mongoose.Schema({
    photo: { type: String },
    fullName: { type: String },
    phoneNo: { type: String },
    password: { type: String },
    fcmToken:{type:String}
});

adminSchema.plugin(timestamps);
module.exports = mongoose.model("Admin", adminSchema);