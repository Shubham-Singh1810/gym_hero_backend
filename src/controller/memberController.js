const express = require("express");
const memberController = express.Router();
const memberServices = require("../services/memberServices");
const Member = require("../model/memberSchema");
const Attendance = require("../model/attendanceSchema");
const { sendResponse } = require("../utils/common");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const upload = require("../utils/multer");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const cloudinary = require("../utils/cloudinary");
const QRCode = require("qrcode");
const path = require("path"); // Add this line to require the path module
const fs = require("fs");
// memberController.post("/createMember", upload.single("photo"), async (req, res) => {
//   try {
//     // Check if a member with the provided mobile number already exists
//     const existingMember = await Member.findOne({
//       $or: [{ mobile: req.body.mobile }],
//     });

//     if (existingMember) {
//       return res.status(200).send({
//         success: true,
//         message: "Mobile number already exists",
//       });
//     }

//     let memberData = { ...req.body };

//     // Handle photo upload if a file is provided
//     if (req.file) {
//       const photo = await cloudinary.uploader.upload(req.file.path);
//       memberData.photo = photo.url;
//     }

//     // // Generate a unique URL or identifier for the QR code
//     // const uniqueUrl = `https://gym-hero-backend.vercel.app/api/member/details/${req.body.mobile}`;

//     // // Generate the QR code as a temporary file using Multer
//     // const qrCodeFileName = `${memberData.mobile}-qr.png`;
//     // const qrCodePath = path.join("uploads", qrCodeFileName);
//     // await QRCode.toFile(qrCodePath, uniqueUrl);

//     // // Upload the QR code to Cloudinary
//     // const qrCode = await cloudinary.uploader.upload(qrCodePath);
//     // memberData.qrCode = qrCode.url;

//     // // Remove the temporary QR code file after upload
//     // fs.unlinkSync(qrCodePath);

//     // Create the new member record
//     const memberCreated = new Member(memberData);
//     await memberCreated.save();

//     // Send the response back to the client
//     sendResponse(res, 200, "Success", {
//       success: true,
//       message: "Member Registered successfully!",
//       memberData: memberCreated,
//     });
//   } catch (error) {
//     res.status(500).send({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// });

memberController.post("/createMember", upload.single("photo"), async (req, res) => {
  try {
    // Check if a member with the provided mobile number already exists
    const existingMember = await Member.findOne({
      $or: [{ mobile: req.body.mobile }],
    });

    if (existingMember) {
      return res.status(200).send({
        success: true,
        message: "Mobile number already exists",
      });
    }

    let memberData = { ...req.body };

    // Handle photo upload if a file is provided
    if (req.file) {
      const photo = await cloudinary.uploader.upload(req.file.path);
      memberData.photo = photo.url;
    }

    // Calculate the dueDate based on joiningDate and package
    if (req.body.joiningDate && req.body.package) {
      const { joiningDate, package } = req.body;
      let durationInMonths;

      switch (package) {
        case '1Month':
          durationInMonths = 1;
          break;
        case '3Month':
          durationInMonths = 3;
          break;
        case '6Month':
          durationInMonths = 6;
          break;
        case '12Month':
          durationInMonths = 12;
          break;
        default:
          return res.status(400).send({
            success: false,
            message: "Invalid package selected",
          });
      }

      // Calculate the due date
      memberData.dueDate = moment(joiningDate).add(durationInMonths, 'months').format('YYYY-MM-DD');
    } else {
      return res.status(400).send({
        success: false,
        message: "Joining date and package are required",
      });
    }

    // Create the new member record
    const memberCreated = new Member(memberData);
    await memberCreated.save();

    // Send the response back to the client
    sendResponse(res, 200, "Success", {
      success: true,
      message: "Member Registered successfully!",
      memberData: memberCreated,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// Assuming you're using Express and have defined a router for your member routes

// memberController.get("/details/:mobile", async (req, res) => {
//   try {
//     const { mobile } = req.params;
//     const member = await Member.findOne({ mobile });

//     if (!member) {
//       return res.status(404).send("Member not found");
//     }

//     // Assuming you want to render the member details as HTML
//     const htmlContent = `
//       <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Member Details</title>
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       margin: 20px;
//       background-color: #f4f4f4;
//     }
//     .member-details {
//       max-width: 600px;
//       margin: auto;
//       padding: 20px;
//       background: #fff;
//       border: 1px solid #ddd;
//       border-radius: 8px;
//       box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//     }
//     .member-details img {
//       max-width: 150px;
//       border-radius: 50%;
//       display: block;
//       margin: 0 auto;
//     }
//     .member-details h2 {
//       margin-top: 0;
//       text-align: center;
//       color: #333;
//     }
//     .member-details p {
//       margin: 10px 0;
//       font-size: 16px;
//     }
//     .member-details p strong {
//       color: #555;
//     }
//   </style>
// </head>
// <body>
//   <div class="member-details">
//     <img src="${member.photo}" alt="Member Photo">
//     <h2>${member.fullName}</h2>
//     <p><strong>Mobile:</strong> ${member.mobile}</p>
//     <p><strong>Address:</strong> ${member.address}</p>
//     <p><strong>Profession:</strong> ${member.profession}</p>
//     <p><strong>Body Weight:</strong> ${member.bodyWeight}</p>
//     <p><strong>Fitness Goal:</strong> ${member.fitnessGoal.join(", ")}</p>
//     <p><strong>Package:</strong> ${member.package.join(", ")}</p>
//     <p><strong>Due Date:</strong> ${member.dueDate}</p>
//   </div>
// </body>
// </html>

//     `;

//     res.send(htmlContent);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal server error");
//   }
// });

memberController.post("/getMembers", async (req, res) => {
  try {
    const data = await memberServices.getMember({});
    sendResponse(res, 200, "Success", {
      success: true,
      message: "All member list retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

memberController.put("/updateMemberData", async (req, res) => {
  try {
    const data = await memberServices.updateData({ _id: req.body._id }, req.body);
    sendResponse(res, 200, "Success", {
      success: true,
      message: "Member Updated successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});

memberController.delete("/deleteMember/:Id", async (req, res) => {
  try {
    const Id = req.params.Id;

    // Find the log entry in the database based on logId
    const memberToDelete = await Member.findById(Id);

    if (!memberToDelete) {
      return sendResponse(res, 404, "Not Found", {
        success: false,
        message: "Member entry not found",
      });
    }

    // Delete the log entry
    await memberToDelete.deleteOne();

    sendResponse(res, 200, "Success", {
      success: true,
      message: "Member entry deleted successfully",
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

memberController.post("/inTime/:userId", async (req, res) => {
  try {
    // Get the current date and time in the local timezone (Asia/Kolkata)
    const currentTime = new Date();
    const startOfDay = new Date(currentTime);
    startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
    const endOfDay = new Date(currentTime);
    endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

    // Check if the user has already marked attendance for the current date
    const attendanceExists = await Attendance.findOne({
      userId: req.params.userId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    if (attendanceExists) {
      return sendResponse(res, 400, "Failed", {
        success: false,
        message: "Attendance already marked for today.",
      });
    }

    // Create a new log entry in the database
    const userLogData = {
      userId: req.params.userId,
      date: currentTime,
    };

    const logCreated = await Attendance.create(userLogData);

    // Fetch user data dynamically based on userId
    const userData = await Member.findById(req.params.userId);

    sendResponse(res, 200, "Success", {
      success: true,
      message: "User Marked As Present successfully",
      user: userData, // Include user information in the response
      log: logCreated, // Include the log entry details
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// GET API to fetch attendance records
memberController.get("/attendance", async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    // Fetch attendance records and populate user details
    const attendanceRecords = await Attendance.find(query).populate("userId");

    sendResponse(res, 200, "Success", {
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, "Failed", {
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = memberController;
