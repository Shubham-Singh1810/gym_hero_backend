const express = require("express");
const adminController = express.Router();
const adminServices = require("../services/adminServices");
const Admin = require("../model/adminSchema");
const { sendResponse } = require("../utils/common");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const cloudinary = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
const upload = require("../utils/multer");
const Member = require("../model/memberSchema");
const moment = require("moment");

adminController.post(
  "/createAdmin",
  upload.single("photo"),
  async (req, res) => {
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
        let photo = await cloudinary.uploader.upload(
          req.file.path,
          function (err, result) {
            if (err) {
              return err;
            } else {
              return result;
            }
          }
        );
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
  }
);

adminController.post("/login", async (req, res) => {
  try {
    const data = await adminServices.login(req.body);
    if (data) {
      sendResponse(res, 200, "Success", {
        success: true,
        message: "Admin Logged Successfully",
        data: data,
      });
    } else {
      sendResponse(res, 200, "Success", {
        success: true,
        message: "Invalid Credentials",
        data: data,
      });
    }
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
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
    const data = await adminServices.updateData(
      { _id: req.body._id },
      req.body
    );
    sendResponse(res, 200, "Success", {
      success: true,
      message: "Admin Updated successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

adminController.get("/statics", async (req, res) => {
  try {
    // Count total number of members
    const memberCount = await Member.countDocuments();
    const members = await Member.find({});
    const currentDateStr = moment().format("DD-MM-YYYY");
    function compareDates(date1, date2) {
      // Parse the dates using moment
      const d1 = moment(date1, "DD-MM-YYYY");
      const d2 = moment(date2, "DD-MM-YYYY");
  
      // Compare the two dates
      if (d1.isAfter(d2)) {
          return true
      } else if (d1.isBefore(d2)) {
          return false
      } else {
          return false
      }
  }
    const pendingPaymentMember = members?.filter((v, i)=>{
      const dueDate = moment(v?.dueDate).format("DD-MM-YYYY")
      if(compareDates(currentDateStr, dueDate)){
        return v
      }
    })
    sendResponse(res, 200, "Success", {
      success: true,
      message: "Admin dashboard statistics fetched successfully!",
      data: {
        memberCount,
        pendingPaymentsCount: pendingPaymentMember.length,
        pendingPayments: pendingPaymentMember,
      },
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

module.exports = adminController;
