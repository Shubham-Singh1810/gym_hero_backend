const express = require("express");
const adminController = express.Router();
const adminServices = require("../services/adminServices");
const Admin = require("../model/adminSchema");
const { sendResponse } = require("../utils/common");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const cloudinary = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
const upload = require("../utils/multer")

adminController.post("/createAdmin", upload.single("photo"), async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({
      $or: [{ phoneNo: req.body.phoneNo }],
    });

    if (existingAdmin) {
      return res.status(409).send({
        success: false,
        message: "mobile number already exists",
      });
    }

    let adminData = { ...req.body };

    if (req.file) {
      let photo = await cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
          return err;
        } else {
          return result;
        }
      });
      adminData = { ...req.body, photo: photo.url };
    }

    const adminCreated = new Admin(adminData);
    await adminCreated.save();

    sendResponse(res, 200, "Success", {
      success: true,
      message: "Admin Registered successfully!",
      adminData: adminCreated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});


adminController.get("/getAdmin", async (req, res) => {
  try {
    const data = await adminServices.getAdmin({});
    sendResponse(res, 200, "Success", {
      success: true,
      message: "All Admin list retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


adminController.put("/updateAdminData", async (req, res) => {
    try {
      const data = await adminServices.updateData({ _id: req.body._id }, req.body);
      sendResponse(res, 200, "Success", {
        success: true,
        message: "Admin Updated successfully!",
        data: data
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});


module.exports = adminController;