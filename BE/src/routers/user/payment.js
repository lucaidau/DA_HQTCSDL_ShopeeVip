const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/user/PaymentController");

router.post("/", paymentController.thanhToan);

module.exports = router;
