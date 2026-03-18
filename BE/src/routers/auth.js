const express = require("express");
const router = express.Router();

const authController = require("../controllers/AuthController");

router.get("/", (req, res) => res.send("<h1>Hello Server</h1>"));
router.post("/dangKi", authController.dangKi);
router.post("/", authController.dangNhap);

module.exports = router;
