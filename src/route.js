const express = require("express");
const router = express.Router();

const memberController = require("./controller/memberController");
const enqueryController = require("./controller/enqueryController");
const adminController = require("./controller/adminController");


router.use("/member", memberController);
router.use("/enquery", enqueryController);
router.use("/admin", adminController);





module.exports = router;