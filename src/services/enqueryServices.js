const mongoose = require("mongoose");
const Enquery = require("../model/enquerySchema");
const { body } = require("express-validator");



exports.getEnqMember = async () => {
  const enquery = await Enquery.find();
  return enquery;
};


exports.updateData = async (filter, update) => {
  return await Enquery.updateOne(filter, update, { new: true });
};
