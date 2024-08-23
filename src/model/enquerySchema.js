const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const enquerySchema = mongoose.Schema({
    fullName: { type: String },
    mobile: { type: String },
    comment: { type: String },
    followUpDate: { type: Date },
    followUpReply: { type: String },
    status: {type: Boolean, default: false}
});

enquerySchema.plugin(timestamps);
module.exports = mongoose.model("Enquery", enquerySchema);