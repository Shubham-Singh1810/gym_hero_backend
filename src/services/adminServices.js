const mongoose = require("mongoose");
const Admin = require("../model/adminSchema");
const { body } = require("express-validator");



exports.getAdmin = async () => {
  const admin = await Admin.find();
  return admin;
};

exports.login = async (body) => {
  const admin = await Admin.findOne(body);
  return admin;
};


exports.updateData = async (filter, update) => {
  return await Admin.updateOne(filter, update, { new: true });
};