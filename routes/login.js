var express = require("express");
var router = express.Router();

const {
  Select,
} = require("./repository/spidb");
const dictionary = require("./repository/dictionary");
const helper = require("./repository/customhelper");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login", { title: "Express" });
});

module.exports = router;
