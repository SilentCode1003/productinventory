var express = require("express");
const { Repair, Product, RepairProduct } = require("./model/spimodel");
const { Select, InsertTable, Update, SelectParameter } = require("./repository/spidb");
const { SelectStatement, convertExcelDate } = require("./repository/customhelper");
const { GetValue, RPRD } = require("./repository/dictionary");
const { Validator } = require("./controller/middleware");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render("repair", { title: "Express" });
  Validator(req, res, "deffective");
});

module.exports = router;

