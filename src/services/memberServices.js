const mongoose = require("mongoose");
const Member = require("../model/memberSchema");
const Attendance = require("../model/attendanceSchema");
const { body } = require("express-validator");



exports.getMember = async (query) => {
  const members = await Member.find(query);
  return members;
};


exports.updateData = async (filter, update) => {
  return await Member.updateOne(filter, update, { new: true });
};
