const express = require("express");
const enqueryController = express.Router();
const enqueryServices = require("../services/enqueryServices");
const Enquery = require("../model/enquerySchema");
const { sendResponse } = require("../utils/common");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
// const imgUpload = require("../utils/multer");
const jwt = require("jsonwebtoken");




enqueryController.post("/createEnqMember", async (req, res) => {
  try {
    const existingMember = await Enquery.findOne({
      $or: [{ mobile: req.body.mobile }],
    });

    if (existingMember) {
      return res.status(409).send({
        success: false,
        message: "mobile number already exists",
      });
    }

    const memberData = { ...req.body };

    const memberCreated = new Enquery(memberData);
    await memberCreated.save();

    sendResponse(res, 200, "Success", {
      success: true,
      message: "Member Added successfully!",
      memberData: memberCreated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});


enqueryController.get("/getEnqMembers", async (req, res) => {
  try {
    const data = await enqueryServices.getEnqMember({});
    sendResponse(res, 200, "Success", {
      success: true,
      message: "All Enquery member list retrieved successfully!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    sendResponse(res, 500, "Failed", {
      message: error.message || "Internal server error",
    });
  }
});


enqueryController.put("/updateEnqMemberData", async (req, res) => {
    try {
      const data = await enqueryServices.updateData({ _id: req.body._id }, req.body);
      sendResponse(res, 200, "Success", {
        success: true,
        message: "Enquery Member Updated successfully!",
        data: data
      });
    } catch (error) {
      console.log(error);
      sendResponse(res, 500, "Failed", {
        message: error.message || "Internal server error",
      });
    }
});


enqueryController.delete("/deleteEnqMember/:Id",  async (req, res) => {
    try {
      const Id = req.params.Id;
  
      // Find the log entry in the database based on logId
      const memberToDelete = await Enquery.findById(Id);
  
  
      if (!memberToDelete) {
        return sendResponse(res, 404, "Not Found", {
          success: false,
          message: "Enquery Member entry not found"
        });
      }
  
      // Delete the log entry
      await memberToDelete.deleteOne();
  
      sendResponse(res, 200, "Success", {
        success: true,
        message: "Enquery Member entry deleted successfully"
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, 500, "Failed", {
        success: false,
        message: error.message || "Internal server error"
      });
    }
});



module.exports = enqueryController;
