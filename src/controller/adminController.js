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
const Notification = require("../model/notificationSchema");
const createNotification = require("../utils/createNotification");
const pushNotification = require("../utils/firebasePushNotification")
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

adminController.post("/login", async (req, res) => {
  try {
    const data = await adminServices.login({phoneNo:req.body.phoneNo, password:req.body.password});
    if (data) {
      await Admin.updateOne({ _id: data._id }, {fcmToken:req.body.fcmToken}, { new: true });
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
    const data = await adminServices.updateData({ _id: req.body._id }, req.body);
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
const currentDateStr = moment().format("DD-MM-YYYY");
function compareDates(date1, date2) {
  // Parse the dates using moment
  const d1 = moment(date1, "DD-MM-YYYY");
  const d2 = moment(date2, "DD-MM-YYYY");

  // Compare the two dates
  if (d1.isAfter(d2)) {
    return true;
  } else if (d1.isBefore(d2)) {
    return false;
  } else {
    return false;
  }
}
adminController.get("/statics", async (req, res) => {
  try {
    // Count total number of members
    const memberCount = await Member.countDocuments();
    const members = await Member.find({});
    const notifications = await Notification.find({ isRead: false }).sort({ createdAt: -1 });
    const currentDateStr = moment().format("DD-MM-YYYY");
    function compareDates(date1, date2) {
      // Parse the dates using moment
      const d1 = moment(date1, "DD-MM-YYYY");
      const d2 = moment(date2, "DD-MM-YYYY");

      // Compare the two dates
      if (d1.isAfter(d2)) {
        return true;
      } else if (d1.isBefore(d2)) {
        return false;
      } else {
        return false;
      }
    }

    const pendingPaymentMember = members?.filter((v, i) => {
      const dueDate = moment(v?.dueDate).format("DD-MM-YYYY");
      if (compareDates(currentDateStr, dueDate)) {
        return v;
      }
    });

    sendResponse(res, 200, "Success", {
      success: true,
      message: "Admin dashboard statistics fetched successfully!",
      data: {
        memberCount,
        pendingPayments: pendingPaymentMember,
        notifications: notifications,
      },
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

adminController.get("/notifications", async (req, res) => {
  try {
    const Notifications = await Notification.find({ isRead: false }).sort({ createdAt: -1 });
    sendResponse(res, 200, "Success", {
      success: true,
      message: "Notification retrieved successfully",
      data: Notifications,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

adminController.post("/create-notifications", async (req, res) => {
  try {
    const member = await Member.find();

    member.map(async (v, i) => {
      const isNotification = await Notification.findOne({ type: "newMember", releventId: v?._id });
      if (!isNotification) {
        createNotification({
          message:
            "Congrats! You have added " + v.fullName + " to the gym on " + moment(v.createdAt).format("DD-MM-YYYY"),
          type: "newMember",
          releventId: v._id,
        });
      }
    });

    member.map(async (v, i) => {
      const dueDate = moment(v?.dueDate).format("DD-MM-YYYY");
      if (compareDates(currentDateStr, dueDate)) {
        const isNotification = await Notification.findOne({ type: "pendingPayment", releventId: v?._id });
        if (!isNotification) {
          createNotification({
            message:
              "Payment is pending of " +
              v?.fullName +
              " and his due date is " +
              moment(v?.dueDate).format("DD-MM-YYYY"),
            type: "pendingPayment",
            releventId: v?._id,
          });
        }
      }
    });
    const notification = await Notification.find().sort({ createdAt: -1 });
    sendResponse(res, 200, "Success", {
      success: true,
      message: "Notification created successfully",
      data: notification.length,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

adminController.post("/send-notification", async (req, res) => {
  const { fcmToken, title, body } = req.body;

  try {
    const result = await pushNotification(fcmToken, title, body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = adminController;
